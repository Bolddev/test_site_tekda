// Canvas 2D Particle System
// Particles form Persian text "ما با کد شعر می‌نویسیم"

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  delay: number;
}

export class ParticleSystem {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: Particle[] = [];
  textPoints: { x: number; y: number }[] = [];
  width: number;
  height: number;
  progress: number = 0;
  disposed: boolean = false;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * Math.min(window.devicePixelRatio, 2);
    this.canvas.height = this.height * Math.min(window.devicePixelRatio, 2);
    this.ctx.scale(Math.min(window.devicePixelRatio, 2), Math.min(window.devicePixelRatio, 2));
    
    // Delay text generation to ensure font is loaded
    setTimeout(() => {
      this.generateTextPoints();
      this.initParticles();
    }, 500);
    
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }
  
  onResize() {
    if (this.disposed) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const pr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = this.width * pr;
    this.canvas.height = this.height * pr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(pr, pr);
    this.generateTextPoints();
    this.updateTargets();
  }
  
  generateTextPoints() {
    // Create offscreen canvas to render text and sample points
    const pr = Math.min(window.devicePixelRatio, 2);
    const offscreen = document.createElement('canvas');
    offscreen.width = this.width * pr;
    offscreen.height = this.height * pr;
    const offCtx = offscreen.getContext('2d')!;
    offCtx.scale(pr, pr);
    
    // Draw Persian text - multiple sizes for density
    const fontSize = Math.min(this.width * 0.065, 65);
    offCtx.font = `bold ${fontSize}px Vazirmatn, sans-serif`;
    offCtx.fillStyle = '#FFFFFF';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('ما با کد شعر می‌نویسیم', this.width / 2, this.height / 2);
    
    // Sample points from the rendered text
    const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
    const points: { x: number; y: number }[] = [];
    const gap = Math.max(4, Math.floor(6 / pr));
    
    for (let y = 0; y < offscreen.height; y += gap) {
      for (let x = 0; x < offscreen.width; x += gap) {
        const index = (y * offscreen.width + x) * 4;
        if (imageData.data[index + 3] > 128) {
          points.push({ x: x / pr, y: y / pr });
        }
      }
    }
    
    // Shuffle points for more organic distribution
    for (let i = points.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [points[i], points[j]] = [points[j], points[i]];
    }
    
    this.textPoints = points;
  }
  
  initParticles() {
    const maxCount = 2000;
    const count = Math.min(this.textPoints.length, maxCount);
    this.particles = [];
    
    for (let i = 0; i < count; i++) {
      const target = this.textPoints[i % this.textPoints.length] || { 
        x: this.width / 2 + (Math.random() - 0.5) * 300, 
        y: this.height / 2 + (Math.random() - 0.5) * 200 
      };
      
      // Random starting positions spread around the screen
      const angle = Math.random() * Math.PI * 2;
      const radius = 200 + Math.random() * 400;
      
      this.particles.push({
        x: this.width / 2 + Math.cos(angle) * radius,
        y: this.height / 2 + Math.sin(angle) * radius,
        targetX: target.x,
        targetY: target.y,
        originX: this.width / 2 + Math.cos(angle) * radius,
        originY: this.height / 2 + Math.sin(angle) * radius,
        size: 1.5 + Math.random() * 2.5,
        color: Math.random() > 0.8 ? '#C8954A' : '#E8DCC4',
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        delay: Math.random() * 0.3 // Staggered arrival
      });
    }
  }
  
  updateTargets() {
    for (let i = 0; i < this.particles.length; i++) {
      const target = this.textPoints[i % this.textPoints.length] || { 
        x: this.width / 2, 
        y: this.height / 2 
      };
      this.particles[i].targetX = target.x;
      this.particles[i].targetY = target.y;
    }
  }
  
  setProgress(progress: number) {
    this.progress = progress;
  }
  
  render() {
    if (this.disposed) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    if (this.progress <= 0 || this.particles.length === 0) return;
    
    const p = this.progress;
    const time = Date.now() * 0.001;
    
    for (const particle of this.particles) {
      // Staggered progress based on delay
      const particleP = Math.max(0, Math.min(1, (p - particle.delay) / (1 - particle.delay)));
      
      // Sinusoidal movement that decreases as particles approach targets
      const turbulence = (1 - particleP) * (1 - particleP);
      const sinX = Math.sin(time * 1.5 + particle.originX * 0.01) * turbulence * 40;
      const sinY = Math.cos(time * 1.2 + particle.originY * 0.01) * turbulence * 40;
      
      // Eased interpolation
      const easedP = particleP * particleP * (3 - 2 * particleP); // smoothstep
      
      particle.x = particle.originX + sinX + (particle.targetX - particle.originX - sinX) * easedP;
      particle.y = particle.originY + sinY + (particle.targetY - particle.originY - sinY) * easedP;
      
      // Draw particle as pixel square
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = 0.4 + particleP * 0.6;
      
      const size = particle.size * (1 + turbulence * 0.8);
      const pixelX = Math.floor(particle.x);
      const pixelY = Math.floor(particle.y);
      const pixelSize = Math.max(1, Math.floor(size));
      
      this.ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
    }
    
    this.ctx.globalAlpha = 1;
  }
  
  dispose() {
    this.disposed = true;
    window.removeEventListener('resize', this.onResize);
  }
}
