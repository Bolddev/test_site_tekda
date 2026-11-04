import { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CinematicScene } from './lib/three-scene';
import { ParticleSystem } from './lib/particle-system';

gsap.registerPlugin(ScrollTrigger);

// Code snippets for beat 2
const codeLines = [
  'const tekda = new CreativeEngine();',
  'import { poetry } from "./digital/soul";',
  'function build(memories) {',
  '  return memories.map(m => m.render());',
  '}',
  'const canvas = document.createElement("future");',
  'class Pixel { constructor(x,y) { this.pos = [x,y] } }',
  'export default function dream() {',
  '  while(alive) { create(); iterate(); }',
  '}',
  'let vision = await imagine("what-if");',
  'const grid = Array.from({length: ∞});',
  'tekda.deploy({ mode: "cinematic" });',
  'render(<Memory key={moment} />);',
  'const shader = gl.createShader(GL_FRAGMENT);',
  'particles.forEach(p => p.moveTo(target));',
  '// every pixel tells a story',
  'return <Canvas><World /></Canvas>;',
  'const dither = bayer4x4(luminance);',
  'tekda.init({ soul: true, pixels: "∞" });',
  'const memory = await recall("first-line");',
  'export const soul = { code: true, art: true };',
  'function transform(dream) { return reality(dream); }',
  'const pixel = new ImageData(1, 1);',
];

// Project data for beat 6
const projects = [
  { title: 'فروشگاه', year: '۱۴۰۳', desc: 'فروشگاه آنلاین با تجربهٔ خرید سینمایی. طراحی از صفر، کدنویسی با عشق. هر محصول یک داستان دارد و هر کلیک یک لحظه.' },
  { title: 'پنل ادمین', year: '۱۴۰۴', desc: 'داشبورد مدیریت هوشمند. داده‌ها زنده‌اند، تصمیم‌ها سریع. رابط کاربری‌ای که خسته‌ات نمی‌کند.' },
  { title: 'اپلیکیشن', year: '۱۴۰۴', desc: 'اپ موبایل با انیمیشن‌های روان. هر لمس یک تجربه، هر صفحه یک خاطره. ساخته‌شده برای انسان‌ها.' },
];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<CinematicScene | null>(null);
  const particlesRef = useRef<ParticleSystem | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [activeModal, setActiveModal] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const animFrameRef = useRef<number>(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noiseFrameRef = useRef<number>(0);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Wait for fonts
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  // Typing animation for beat 1
  useEffect(() => {
    if (reducedMotion) return;
    const sequences = ['hello', '', 'we build', '', 'watch'];
    let seqIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      const current = sequences[seqIndex];
      if (!isDeleting) {
        setTypedText(current.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex >= current.length) {
          if (seqIndex < sequences.length - 1) {
            typingTimeoutRef.current = setTimeout(() => {
              isDeleting = true;
              seqIndex++;
              charIndex = current.length;
              type();
            }, 600);
          }
          return;
        }
      } else {
        setTypedText(current.substring(0, charIndex - 1));
        charIndex--;
        if (charIndex <= 0) {
          isDeleting = false;
          if (seqIndex < sequences.length - 1) seqIndex++;
          charIndex = 0;
        }
      }
      typingTimeoutRef.current = setTimeout(type, isDeleting ? 60 : 120);
    };

    typingTimeoutRef.current = setTimeout(type, 1500);
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [reducedMotion]);

  // Cursor blink - steps(2)
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Noise canvas animation
  useEffect(() => {
    if (reducedMotion || !noiseCanvasRef.current) return;
    const canvas = noiseCanvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 256;
    
    const drawNoise = () => {
      const imageData = ctx.createImageData(256, 256);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 25;
        imageData.data[i] = v;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = 15; // Very subtle
      }
      ctx.putImageData(imageData, 0, 0);
      noiseFrameRef.current = requestAnimationFrame(drawNoise);
    };
    
    // Only update noise every few frames for performance
    let frameCount = 0;
    const drawNoiseThrottled = () => {
      frameCount++;
      if (frameCount % 4 === 0) {
        const imageData = ctx.createImageData(256, 256);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const v = Math.random() * 20;
          imageData.data[i] = v;
          imageData.data[i + 1] = v;
          imageData.data[i + 2] = v;
          imageData.data[i + 3] = 12;
        }
        ctx.putImageData(imageData, 0, 0);
      }
      noiseFrameRef.current = requestAnimationFrame(drawNoiseThrottled);
    };
    drawNoiseThrottled();
    
    return () => cancelAnimationFrame(noiseFrameRef.current);
  }, [reducedMotion]);

  // Main setup
  useEffect(() => {
    if (reducedMotion) return;
    if (!threeCanvasRef.current || !particleCanvasRef.current) return;

    // Initialize Three.js scene
    const scene = new CinematicScene(threeCanvasRef.current);
    sceneRef.current = scene;

    // Initialize particle system
    const particles = new ParticleSystem(particleCanvasRef.current);
    particlesRef.current = particles;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // Connect Lenis to ScrollTrigger
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });
    
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Animation loop
    const animate = () => {
      scene.render();
      particles.render();
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // ScrollTrigger master
    ScrollTrigger.create({
      trigger: '.scroll-spacer',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);
        scene.setProgress(p);
        
        // Particle system progress (beat 4: 35-48%)
        const beat4Start = 0.35;
        const beat4End = 0.48;
        if (p >= beat4Start && p <= beat4End) {
          const bp = (p - beat4Start) / (beat4End - beat4Start);
          particles.setProgress(bp);
        } else if (p > beat4End && p <= 0.62) {
          particles.setProgress(1);
        } else if (p > 0.62 && p <= 0.72) {
          particles.setProgress(Math.max(0, 1 - (p - 0.62) / 0.1));
        } else {
          particles.setProgress(0);
        }
      }
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      lenis.destroy();
      ScrollTrigger.getAll().forEach(st => st.kill());
      scene.dispose();
      particles.dispose();
    };
  }, [reducedMotion]);

  // Compute beat visibility
  const getBeatOpacity = useCallback((start: number, end: number, fadeIn = 0.03, fadeOut = 0.03) => {
    if (scrollProgress < start - fadeIn) return 0;
    if (scrollProgress > end + fadeOut) return 0;
    const inProgress = scrollProgress < start ? 0 : Math.min(1, (scrollProgress - start) / fadeIn);
    const outProgress = scrollProgress > end ? 0 : Math.min(1, (end - scrollProgress) / fadeOut);
    return Math.min(inProgress, outProgress);
  }, [scrollProgress]);

  // Reduced motion static page
  if (reducedMotion) {
    return (
      <div className="min-h-screen bg-[#0A0806] text-[#E8DCC4] p-8 font-vazir" dir="rtl">
        <header className="mb-16">
          <h1 className="font-pixel text-[#C8954A] text-2xl mb-4">tekda</h1>
          <p className="text-lg opacity-70">استودیوی دیجیتال</p>
        </header>
        
        <main className="max-w-4xl mx-auto space-y-16">
          <section>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">ما دیجیتال را با دست می‌سازیم، نه با قالب.</h2>
            <p className="text-xl opacity-80 leading-relaxed">ما با کد شعر می‌نویسیم. هر پیکسل یک انتخاب است، هر انیمیشن یک داستان.</p>
          </section>
          
          <section>
            <h3 className="text-2xl font-bold mb-8">پروژه‌ها</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {projects.map((p, i) => (
                <div key={i} className="border border-[#3A3025] p-6 shadow-hard">
                  <h4 className="text-xl font-bold mb-2">{p.title}</h4>
                  <p className="font-pixel text-sm text-[#C8954A] mb-3">{p.year}</p>
                  <p className="text-sm opacity-80">{p.desc}</p>
                </div>
              ))}
            </div>
          </section>
          
          <section className="text-center py-16">
            <h3 className="text-2xl font-bold mb-4">پروژه‌تان را شروع کنیم.</h3>
            <p className="opacity-70 mb-8">خاطرهٔ بعدی اینجا شکل می‌گیرد.</p>
            <a 
              href="https://wa.me/989123456789" 
              className="inline-block bg-[#C8954A] text-[#0A0806] px-8 py-4 font-bold shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
            >
              شروع پروژه
            </a>
          </section>
        </main>
        
        <footer className="mt-16 pt-8 border-t border-[#3A3025] text-center opacity-50">
          <p className="font-pixel text-sm">tekda © ۱۴۰۴</p>
        </footer>
      </div>
    );
  }

  // Beat visibility calculations
  const beat1Opacity = scrollProgress < 0.10 ? 1 : Math.max(0, 1 - (scrollProgress - 0.06) / 0.04);
  const beat2Opacity = getBeatOpacity(0.06, 0.22, 0.04, 0.04);
  const beat3Opacity = getBeatOpacity(0.18, 0.36, 0.04, 0.04);
  const beat4Opacity = getBeatOpacity(0.33, 0.50, 0.04, 0.04);
  const beat5Opacity = getBeatOpacity(0.48, 0.64, 0.04, 0.04);
  const beat6Opacity = getBeatOpacity(0.60, 0.82, 0.04, 0.04);
  const beat7Opacity = getBeatOpacity(0.78, 0.94, 0.04, 0.04);
  const beat8Opacity = getBeatOpacity(0.90, 1.01, 0.04, 0.01);

  return (
    <div ref={containerRef} dir="rtl">
      {/* Three.js Canvas */}
      <canvas 
        ref={threeCanvasRef}
        className="cinematic-canvas three-canvas"
        style={{ opacity: beat3Opacity }}
      />
      
      {/* Particle Canvas */}
      <canvas 
        ref={particleCanvasRef}
        className="cinematic-canvas particle-canvas"
        style={{ opacity: beat4Opacity }}
      />

      {/* Film grain / noise overlay */}
      <canvas 
        ref={noiseCanvasRef}
        className="fixed inset-0 w-full h-full z-[5] pointer-events-none"
        style={{ 
          opacity: 0.4,
          mixBlendMode: 'overlay',
          imageRendering: 'pixelated'
        }}
      />

      {/* Scanline overlay */}
      <div 
        className="fixed inset-0 z-[6] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(10,8,6,0.03) 2px, rgba(10,8,6,0.03) 4px)',
        }}
      />

      {/* DOM Overlays */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        
        {/* Beat 1: Typing cursor (0-8%) */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          style={{ opacity: beat1Opacity }}
        >
          <div className="font-pixel text-2xl md:text-4xl text-[#E8DCC4] flex items-center gap-1" dir="ltr">
            <span className="tracking-wider">{typedText}</span>
            <span 
              className="inline-block w-3 h-8 md:w-4 md:h-10"
              style={{ 
                backgroundColor: showCursor ? '#C8954A' : 'transparent',
              }}
            />
          </div>
        </div>

        {/* Beat 2: Code rain + H1 (8-20%) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: beat2Opacity }}
        >
          {/* Code lines */}
          <div className="absolute inset-0 overflow-hidden">
            {codeLines.map((line, i) => {
              const lineProgress = Math.max(0, Math.min(1, (scrollProgress - 0.06) * 5 - i * 0.15));
              return (
                <div
                  key={i}
                  className="absolute font-pixel text-[10px] md:text-xs whitespace-nowrap"
                  style={{
                    color: i % 3 === 0 ? '#3A3025' : '#1A1410',
                    top: `${5 + (i * 4)}%`,
                    left: 0,
                    right: 0,
                    opacity: lineProgress * (0.3 + (i % 4) * 0.15),
                    transform: `translateX(${-100 + lineProgress * 120 + i * 5}%)`,
                    direction: 'ltr',
                    textAlign: 'left',
                    paddingLeft: `${(i % 5) * 2}rem`
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
          
          {/* H1 Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 
              className="font-vazir text-center font-bold px-6 leading-tight"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                opacity: Math.min(1, Math.max(0, (scrollProgress - 0.10) / 0.05)),
                color: '#E8DCC4',
                maxWidth: '85vw',
                textShadow: '0 0 40px rgba(10,8,6,0.8)'
              }}
            >
              ما دیجیتال را با دست می‌سازیم، نه با قالب.
            </h1>
          </div>
        </div>

        {/* Beat 3: 3D space indicator (20-35%) */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: beat3Opacity * 0.6 }}
        >
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <p className="font-pixel text-xs text-[#3A3025] tracking-widest" dir="ltr">
              {Math.floor(scrollProgress * 100)}% — LOADING MEMORY
            </p>
          </div>
        </div>

        {/* Beat 5: Text to cards transition (48-62%) */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: beat5Opacity }}
        >
          <div 
            className="font-vazir font-bold text-center px-4"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
              color: '#E8DCC4',
              opacity: Math.max(0, 1 - (scrollProgress - 0.50) / 0.06),
              transform: `scale(${1 + (scrollProgress - 0.48) * 2})`,
              filter: `blur(${Math.max(0, (scrollProgress - 0.52) * 20)}px)`
            }}
          >
            ما با کد شعر می‌نویسیم
          </div>
        </div>

        {/* Beat 6: Project cards (62-80%) */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          style={{ opacity: beat6Opacity }}
        >
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center px-4"
            style={{
              transform: `scale(${0.7 + Math.min(0.3, (scrollProgress - 0.60) * 2.5)})`,
            }}
          >
            {projects.map((project, i) => (
              <div
                key={i}
                className="project-card border-2 border-[#3A3025] bg-[#1A1410] p-5 md:p-6 w-56 md:w-72 shadow-hard"
                style={{
                  transform: `rotate(${(i - 1) * 4}deg) translateY(${Math.sin(Date.now() * 0.001 + i * 2) * 3}px)`,
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease'
                }}
                onClick={() => setActiveModal(i)}
              >
                {/* Mock browser chrome */}
                <div className="flex gap-1.5 mb-4 pb-3 border-b border-[#3A3025]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3A3025]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3A3025]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3A3025]"></div>
                </div>
                <h3 className="font-vazir font-bold text-lg md:text-xl mb-1">{project.title}</h3>
                <p className="font-pixel text-xs text-[#C8954A] mb-4" dir="ltr">{project.year}</p>
                <div className="space-y-2">
                  <div className="h-2 bg-[#3A3025] w-full rounded-none"></div>
                  <div className="h-2 bg-[#3A3025] w-3/4 rounded-none"></div>
                  <div className="h-2 bg-[#3A3025] w-1/2 rounded-none"></div>
                  <div className="h-16 bg-[#0A0806] mt-3 border border-[#3A3025]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Beat 7: Empty frame (80-92%) */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ opacity: beat7Opacity }}
        >
          <div 
            className="border-2 border-dashed border-[#3A3025] w-52 h-52 md:w-72 md:h-72 flex items-center justify-center relative"
            style={{
              opacity: Math.min(1, (scrollProgress - 0.78) / 0.05),
            }}
          >
            {/* Corner marks */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#C8954A]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#C8954A]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#C8954A]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#C8954A]"></div>
            
            <p className="font-vazir text-sm md:text-base text-center px-6 opacity-70 leading-relaxed">
              خاطرهٔ بعدی اینجا شکل می‌گیرد.
            </p>
          </div>
        </div>

        {/* Beat 8-9: CTA + Header/Footer (92-100%) */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
          style={{ 
            opacity: beat8Opacity,
          }}
        >
          {/* Background fade to lighter */}
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, rgba(26,20,16,${Math.max(0, (scrollProgress - 0.90) * 4)}) 0%, rgba(10,8,6,${Math.max(0, (scrollProgress - 0.90) * 3)}) 100%)`,
            }}
          />
          
          {/* Mini header */}
          <div className="absolute top-6 right-6 md:top-8 md:right-8 z-20">
            <span className="font-pixel text-lg text-[#C8954A]">tekda</span>
          </div>
          
          {/* CTA */}
          <div className="text-center px-4 relative z-10">
            <h2 
              className="font-vazir font-bold mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)' }}
            >
              پروژه‌تان را شروع کنیم.
            </h2>
            <p className="font-vazir text-base md:text-lg opacity-60 mb-10">
              پروژۀ بعدی، خاطرهٔ بعدی.
            </p>
            <a 
              href="https://wa.me/989123456789" 
              className="inline-block bg-[#C8954A] text-[#0A0806] px-10 py-4 font-bold font-vazir text-lg shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform duration-200"
            >
              شروع پروژه
            </a>
            <div className="mt-8">
              <a 
                href="https://wa.me/989123456789" 
                className="inline-flex items-center gap-2 text-[#E8DCC4] opacity-50 hover:opacity-100 transition-opacity font-pixel text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.32-2.234l-.442-.362-3.096 1.037 1.037-3.096-.362-.442A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                واتساپ
              </a>
            </div>
          </div>
          
          {/* Mini footer */}
          <div className="absolute bottom-6 left-0 right-0 text-center z-20">
            <p className="font-pixel text-xs text-[#3A3025]">tekda © ۱۴۰۴ — ساخته‌شده با کد و عشق</p>
          </div>
        </div>
      </div>

      {/* Scroll spacer - creates scrollable height */}
      <div className="scroll-spacer" style={{ height: '900vh' }}>
        {/* Invisible beat markers */}
        <div className="beat-section" style={{ height: '100vh' }} data-beat="0" />
        <div className="beat-section" style={{ height: '100vh' }} data-beat="1" />
        <div className="beat-section" style={{ height: '100vh' }} data-beat="2" />
        <div className="beat-section" style={{ height: '100vh' }} data-beat="3" />
        <div className="beat-section" style={{ height: '100vh' }} data-beat="4" />
        <div className="beat-section" style={{ height: '100vh' }} data-beat="5" />
        <div className="beat-section" style={{ height: '100vh' }} data-beat="6" />
        <div className="beat-section" style={{ height: '100vh' }} data-beat="7" />
        <div className="beat-section" style={{ height: '100vh' }} data-beat="8" />
      </div>

      {/* Modal */}
      {activeModal !== null && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div 
            className="bg-[#1A1410] border-2 border-[#3A3025] p-6 md:p-8 max-w-lg mx-4 shadow-hard pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-vazir font-bold text-2xl">{projects[activeModal].title}</h3>
                <p className="font-pixel text-sm text-[#C8954A] mt-1" dir="ltr">{projects[activeModal].year}</p>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-[#E8DCC4] opacity-50 hover:opacity-100 font-pixel text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <p className="font-vazir text-base md:text-lg leading-relaxed opacity-80 mb-6">
              {projects[activeModal].desc}
            </p>
            <div className="space-y-3">
              <div className="h-36 bg-[#0A0806] border border-[#3A3025] flex items-center justify-center">
                <div className="text-center">
                  <span className="font-pixel text-xs opacity-30 block mb-2">preview</span>
                  <div className="flex gap-1 justify-center">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-4 h-4 bg-[#3A3025]" style={{ opacity: 0.3 + j * 0.15 }}></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-2 bg-[#3A3025] flex-1"></div>
                <div className="h-2 bg-[#3A3025] flex-1"></div>
                <div className="h-2 bg-[#3A3025] flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
