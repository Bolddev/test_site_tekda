import * as THREE from 'three';

// Bayer 4x4 dithering matrix as GLSL
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uThreshold;
uniform vec2 uResolution;
varying vec2 vUv;

float bayer4x4(vec2 pos) {
  mat4 bayer = mat4(
    0.0/16.0,  8.0/16.0,  2.0/16.0,  10.0/16.0,
    12.0/16.0, 4.0/16.0,  14.0/16.0, 6.0/16.0,
    3.0/16.0,  11.0/16.0, 1.0/16.0,  9.0/16.0,
    15.0/16.0, 7.0/16.0,  13.0/16.0, 5.0/16.0
  );
  int x = int(mod(pos.x, 4.0));
  int y = int(mod(pos.y, 4.0));
  int index = x + y * 4;
  
  if (index == 0) return bayer[0][0];
  if (index == 1) return bayer[1][0];
  if (index == 2) return bayer[2][0];
  if (index == 3) return bayer[3][0];
  if (index == 4) return bayer[0][1];
  if (index == 5) return bayer[1][1];
  if (index == 6) return bayer[2][1];
  if (index == 7) return bayer[3][1];
  if (index == 8) return bayer[0][2];
  if (index == 9) return bayer[1][2];
  if (index == 10) return bayer[2][2];
  if (index == 11) return bayer[3][2];
  if (index == 12) return bayer[0][3];
  if (index == 13) return bayer[1][3];
  if (index == 14) return bayer[2][3];
  return bayer[3][3];
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  float bayer = bayer4x4(vUv * uResolution);
  
  // Palette colors
  vec3 black = vec3(0.039, 0.031, 0.024);
  vec3 ink = vec3(0.102, 0.078, 0.063);
  vec3 ash = vec3(0.227, 0.188, 0.145);
  vec3 cream = vec3(0.91, 0.863, 0.769);
  vec3 amber = vec3(0.784, 0.584, 0.290);
  
  float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  
  // Dithered quantization
  float threshold = uThreshold;
  float ditheredLum = lum + (bayer - 0.5) * threshold * 0.4;
  
  vec3 mapped;
  if (ditheredLum < 0.12) {
    mapped = black;
  } else if (ditheredLum < 0.30) {
    mapped = mix(black, ink, smoothstep(0.12, 0.30, ditheredLum));
  } else if (ditheredLum < 0.55) {
    mapped = mix(ink, ash, smoothstep(0.30, 0.55, ditheredLum));
  } else if (ditheredLum < 0.80) {
    mapped = mix(ash, cream, smoothstep(0.55, 0.80, ditheredLum));
  } else {
    mapped = cream;
  }
  
  // Preserve amber highlights
  if (color.r > 0.6 && color.g > 0.4 && color.b < 0.4) {
    mapped = mix(mapped, amber, 0.7);
  }
  
  gl_FragColor = vec4(mapped, color.a);
}
`;

export class CinematicScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  renderTarget: THREE.WebGLRenderTarget;
  ditherScene: THREE.Scene;
  ditherCamera: THREE.OrthographicCamera;
  ditherMaterial: THREE.ShaderMaterial;
  logoGroup: THREE.Group;
  dotGrid: THREE.Points;
  clock: THREE.Clock;
  disposed: boolean = false;
  
  constructor(canvas: HTMLCanvasElement) {
    this.clock = new THREE.Clock();
    
    // Main scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0A0806);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 6;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    // Render target for post-processing
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth * Math.min(window.devicePixelRatio, 1.5),
      window.innerHeight * Math.min(window.devicePixelRatio, 1.5)
    );
    
    // Dithering post-process
    this.ditherScene = new THREE.Scene();
    this.ditherCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.ditherMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        uThreshold: { value: 0.2 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader,
      fragmentShader
    });
    
    const ditherGeo = new THREE.PlaneGeometry(2, 2);
    const ditherQuad = new THREE.Mesh(ditherGeo, this.ditherMaterial);
    this.ditherScene.add(ditherQuad);
    
    // Logo group
    this.logoGroup = new THREE.Group();
    this.buildLogo();
    this.scene.add(this.logoGroup);
    this.logoGroup.visible = false;
    
    // Dot grid
    this.dotGrid = this.buildDotGrid();
    this.scene.add(this.dotGrid);
    this.dotGrid.visible = false;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xE8DCC4, 0.6);
    this.scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xE8DCC4, 1.2);
    dirLight.position.set(3, 4, 5);
    this.scene.add(dirLight);
    
    const backLight = new THREE.DirectionalLight(0xC8954A, 0.3);
    backLight.position.set(-2, -1, -3);
    this.scene.add(backLight);
    
    // Handle resize
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }
  
  buildDotGrid(): THREE.Points {
    const count = 600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x3A3025, size: 0.06, sizeAttenuation: true });
    return new THREE.Points(geo, mat);
  }
  
  buildLogo() {
    const creamMat = new THREE.MeshStandardMaterial({ 
      color: 0xE8DCC4, 
      roughness: 0.7,
      metalness: 0.05
    });
    
    const amberMat = new THREE.MeshStandardMaterial({ 
      color: 0xC8954A, 
      roughness: 0.5,
      metalness: 0.1,
      emissive: 0xC8954A,
      emissiveIntensity: 0.1
    });
    
    // Horizontal bar of T
    const topBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.45, 0.45),
      creamMat
    );
    topBar.position.y = 1.1;
    this.logoGroup.add(topBar);
    
    // Vertical bar of T
    const vertBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 2.2, 0.45),
      creamMat
    );
    vertBar.position.y = -0.2;
    this.logoGroup.add(vertBar);
    
    // Cape/flowing elements using curves
    const capeCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.2, 1.1, 0),
      new THREE.Vector3(-1.8, 0.3, 0.6),
      new THREE.Vector3(-1.5, -0.8, 1.0),
      new THREE.Vector3(-0.8, -1.6, 0.5),
      new THREE.Vector3(-0.3, -2.0, 0.2),
    ]);
    const capeGeo1 = new THREE.TubeGeometry(capeCurve1, 32, 0.07, 8, false);
    const cape1 = new THREE.Mesh(capeGeo1, amberMat);
    this.logoGroup.add(cape1);
    
    const capeCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.2, 1.1, 0),
      new THREE.Vector3(1.8, 0.3, 0.6),
      new THREE.Vector3(1.5, -0.8, 1.0),
      new THREE.Vector3(0.8, -1.6, 0.5),
      new THREE.Vector3(0.3, -2.0, 0.2),
    ]);
    const capeGeo2 = new THREE.TubeGeometry(capeCurve2, 32, 0.07, 8, false);
    const cape2 = new THREE.Mesh(capeGeo2, amberMat);
    this.logoGroup.add(cape2);
    
    // Small decorative cubes at T corners
    const cornerGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const corners = [
      [-1.2, 1.3, 0.2], [1.2, 1.3, 0.2],
      [-1.2, 0.9, 0.2], [1.2, 0.9, 0.2]
    ];
    corners.forEach(([x, y, z]) => {
      const corner = new THREE.Mesh(cornerGeo, amberMat);
      corner.position.set(x, y, z);
      this.logoGroup.add(corner);
    });
  }
  
  setProgress(progress: number) {
    const beat3Start = 0.20;
    const beat3End = 0.35;
    const beat4Start = 0.35;
    const beat4End = 0.48;
    
    // Beat 3: Logo appears and rotates
    if (progress >= beat3Start - 0.02 && progress <= beat4End + 0.02) {
      this.logoGroup.visible = true;
      this.dotGrid.visible = true;
      
      // Fade in
      const fadeIn = Math.min(1, (progress - (beat3Start - 0.02)) / 0.04);
      
      if (progress <= beat3End) {
        const beat3Progress = (progress - beat3Start) / (beat3End - beat3Start);
        this.logoGroup.rotation.y = beat3Progress * Math.PI * 2;
        this.logoGroup.rotation.x = Math.sin(beat3Progress * Math.PI) * 0.2;
        this.logoGroup.scale.setScalar(fadeIn);
        this.logoGroup.position.set(0, 0, 0);
        
        // Reset children positions
        this.resetLogoChildren();
      }
      
      // Beat 4: Logo cracks/dissolves
      if (progress > beat3End && progress <= beat4End) {
        const beat4Progress = (progress - beat3End) / (beat4End - beat3End);
        this.logoGroup.rotation.y = Math.PI * 2;
        
        // Explode children outward
        this.logoGroup.children.forEach((child, i) => {
          const angle = (i / this.logoGroup.children.length) * Math.PI * 2 + beat4Progress * 2;
          const dist = beat4Progress * beat4Progress * 3;
          child.position.x = Math.cos(angle) * dist;
          child.position.y = Math.sin(angle) * dist;
          child.position.z = beat4Progress * 2;
          child.scale.setScalar(1 - beat4Progress * 0.8);
        });
        
        // Overall scale
        this.logoGroup.scale.setScalar(1 - beat4Progress * 0.3);
      }
      
      // Fade out after beat 4
      if (progress > beat4End) {
        const fadeOut = Math.max(0, 1 - (progress - beat4End) / 0.04);
        this.logoGroup.scale.setScalar(fadeOut * 0.7);
      }
      
      // Dot grid animation
      const gridPositions = this.dotGrid.geometry.attributes.position;
      const time = this.clock.getElapsedTime();
      for (let i = 0; i < gridPositions.count; i++) {
        const x = gridPositions.getX(i);
        const y = gridPositions.getY(i);
        gridPositions.setZ(i, Math.sin(time * 0.5 + x * 0.3 + y * 0.3) * 0.5 - 5);
      }
      gridPositions.needsUpdate = true;
      
    } else {
      this.logoGroup.visible = false;
      this.dotGrid.visible = false;
    }
    
    // Camera movement
    if (progress >= beat3Start && progress <= beat4End) {
      const beatProgress = (progress - beat3Start) / (beat4End - beat3Start);
      this.camera.position.z = 6 - beatProgress * 2;
      this.camera.position.y = Math.sin(beatProgress * Math.PI) * 0.5;
    } else {
      this.camera.position.z = 6;
      this.camera.position.y = 0;
    }
    
    // Update dithering threshold
    const threshold = 0.2 + progress * 0.7;
    this.ditherMaterial.uniforms.uThreshold.value = Math.min(threshold, 0.9);
  }
  
  resetLogoChildren() {
    const positions = [
      { x: 0, y: 1.1, z: 0 },
      { x: 0, y: -0.2, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: -1.2, y: 1.3, z: 0.2 },
      { x: 1.2, y: 1.3, z: 0.2 },
      { x: -1.2, y: 0.9, z: 0.2 },
      { x: 1.2, y: 0.9, z: 0.2 },
    ];
    
    this.logoGroup.children.forEach((child, i) => {
      if (positions[i]) {
        child.position.set(positions[i].x, positions[i].y, positions[i].z);
        child.scale.setScalar(1);
      }
    });
  }
  
  onResize() {
    if (this.disposed) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pr = Math.min(window.devicePixelRatio, 1.5);
    
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(pr);
    this.renderTarget.setSize(w * pr, h * pr);
    this.ditherMaterial.uniforms.uResolution.value.set(w * pr, h * pr);
  }
  
  render() {
    if (this.disposed) return;
    
    // Render scene to render target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    
    // Render dithering pass to screen
    this.renderer.render(this.ditherScene, this.ditherCamera);
  }
  
  dispose() {
    this.disposed = true;
    this.renderer.dispose();
    this.renderTarget.dispose();
    this.ditherMaterial.dispose();
    window.removeEventListener('resize', this.onResize);
  }
}
