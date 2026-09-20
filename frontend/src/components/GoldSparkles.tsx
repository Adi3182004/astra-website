import { useEffect, useRef } from "react";

const goldColors = [
  'rgba(255,215,100,',
  'rgba(255,200,80,',
  'rgba(240,190,70,',
  'rgba(255,230,130,',
  'rgba(220,170,60,',
  'rgba(255,240,160,',
];

const VIRTUAL_SCREENS = 3;
const COLS = 12;
const ROWS = 18;
const SHIMMER_GROUPS = 12;

class Sparkle {
  group: number;
  ix: number;
  iy: number;
  x = 0;
  y = 0;
  size = 0;
  color = '';
  drift = 0;
  arms = 4;
  rotSpeed = 0;
  rot = 0;
  phaseNudge = 0;
  W = 0;

  constructor(group: number, ix: number, iy: number, W: number, H: number) {
    this.group = group;
    this.ix = ix;
    this.iy = iy;
    this.W = W;
    this.init(W, H);
  }

  init(W: number, H: number) {
    this.W = W;
    const cellW = W / COLS;
    const totalH = H * VIRTUAL_SCREENS;
    const cellH = totalH / ROWS;
    this.x = this.ix * cellW + cellW * 0.1 + Math.random() * cellW * 0.8;
    this.y = this.iy * cellH + cellH * 0.1 + Math.random() * cellH * 0.8;
    this.size = 1.2 + Math.random() * 2.6;
    this.color = goldColors[Math.floor(Math.random() * goldColors.length)];
    this.drift = (Math.random() - 0.5) * 0.06;
    this.arms = Math.random() < 0.5 ? 4 : 6;
    this.rotSpeed = (Math.random() - 0.5) * 0.009;
    this.rot = Math.random() * Math.PI;
    this.phaseNudge = (Math.random() - 0.5) * 0.5;
  }

  update() {
    this.rot += this.rotSpeed;
    this.x += this.drift;
    if (this.x < -30) this.x = this.W + 30;
    if (this.x > this.W + 30) this.x = -30;
  }

  draw(ctx: CanvasRenderingContext2D, t: number, scrollY: number, H: number) {
    const sy = this.y - scrollY;
    if (sy < -80 || sy > H + 80) return;

    const groupOffset = (this.group / SHIMMER_GROUPS) * Math.PI * 2;
    const shimmerT = t * 0.0001 * Math.PI * 2 + groupOffset + this.phaseNudge;
    const raw = Math.sin(shimmerT);
    const shimmerPulse = raw > 0 ? Math.pow(raw, 8) : 0;
    const alpha = 0.06 + 0.94 * shimmerPulse;
    if (alpha < 0.012) return;

    ctx.save();
    ctx.translate(this.x, sy);
    ctx.rotate(this.rot);

    const r = this.size;
    ctx.beginPath();
    for (let i = 0; i < this.arms * 2; i++) {
      const ang = (i / (this.arms * 2)) * Math.PI * 2;
      const len = i % 2 === 0 ? r * 4.4 : r * 0.8;
      if (i === 0) ctx.moveTo(Math.cos(ang) * len, Math.sin(ang) * len);
      else ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 5);
    grad.addColorStop(0, this.color + alpha.toFixed(3) + ')');
    grad.addColorStop(0.35, this.color + (alpha * 0.45).toFixed(3) + ')');
    grad.addColorStop(1, this.color + '0)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = this.color + Math.min(alpha * 1.05, 1).toFixed(3) + ')';
    ctx.fill();

    ctx.restore();
  }
}

export const GoldSparkles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let sparkles: Sparkle[] = [];
    let scrollY = 0;
    let animId: number;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const buildGrid = () => {
      sparkles = [];
      let gi = 0;
      for (let iy = 0; iy < ROWS; iy++) {
        for (let ix = 0; ix < COLS; ix++) {
          sparkles.push(new Sparkle(gi % SHIMMER_GROUPS, ix, iy, W, H));
          gi++;
        }
      }
    };

    resize();
    buildGrid();

    const onResize = () => { resize(); buildGrid(); };
    const onScroll = () => { scrollY = window.scrollY; };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll);

    const animate = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      sparkles.forEach(s => { s.update(); s.draw(ctx, t, scrollY, H); });
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ width: "100%", height: "100%" }}
    />
  );
};
