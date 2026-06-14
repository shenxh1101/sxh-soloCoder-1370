import { Particle } from '../types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private pool: Particle[] = [];
  private maxParticles: number;

  constructor(maxParticles = 200) {
    this.maxParticles = maxParticles;
  }

  private getParticle(): Particle {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 0,
      color: '#ffffff',
      life: 0,
      maxLife: 0,
      type: 'bubble',
    };
  }

  private releaseParticle(particle: Particle): void {
    if (this.pool.length < this.maxParticles) {
      this.pool.push(particle);
    }
  }

  emitBubble(
    x: number,
    y: number,
    intensity: number = 1
  ): void {
    if (this.particles.length >= this.maxParticles) return;

    const particle = this.getParticle();
    particle.x = x + (Math.random() - 0.5) * 30 * intensity;
    particle.y = y;
    particle.vx = (Math.random() - 0.5) * 0.5;
    particle.vy = -1 - Math.random() * 2 * intensity;
    particle.radius = 2 + Math.random() * 4;
    particle.color = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
    particle.life = 0;
    particle.maxLife = 60 + Math.random() * 60;
    particle.type = 'bubble';

    this.particles.push(particle);
  }

  emitPrecipitate(
    x: number,
    y: number,
    color: string,
    intensity: number = 1
  ): void {
    if (this.particles.length >= this.maxParticles) return;

    const particle = this.getParticle();
    particle.x = x + (Math.random() - 0.5) * 50;
    particle.y = y;
    particle.vx = (Math.random() - 0.5) * 0.3;
    particle.vy = 0.5 + Math.random() * 1.5 * intensity;
    particle.radius = 1 + Math.random() * 3;
    particle.color = color;
    particle.life = 0;
    particle.maxLife = 120 + Math.random() * 60;
    particle.type = 'precipitate';

    this.particles.push(particle);
  }

  emitSpark(
    x: number,
    y: number,
    color: string,
    intensity: number = 1
  ): void {
    if (this.particles.length >= this.maxParticles) return;

    const particle = this.getParticle();
    particle.x = x;
    particle.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3 * intensity;
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    particle.radius = 1 + Math.random() * 2;
    particle.color = color;
    particle.life = 0;
    particle.maxLife = 30 + Math.random() * 30;
    particle.type = 'spark';

    this.particles.push(particle);
  }

  update(beakerHeight: number, solutionHeight: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;

      if (p.type === 'bubble') {
        p.vx *= 0.98;
        p.vy *= 0.995;
        p.vy -= 0.02;
        if (p.y < solutionHeight - 10) {
          p.radius *= 1.01;
        }
      } else if (p.type === 'precipitate') {
        p.vy += 0.05;
        if (p.y > beakerHeight - 20) {
          p.vy *= -0.3;
          p.vx *= 0.8;
        }
      } else if (p.type === 'spark') {
        p.vy += 0.1;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.life >= p.maxLife) {
        this.releaseParticle(p);
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'bubble') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(Math.floor(p.x), Math.floor(p.y), Math.floor(p.radius), 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
      } else if (p.type === 'precipitate') {
        ctx.fillStyle = p.color;
        ctx.fillRect(
          Math.floor(p.x - p.radius),
          Math.floor(p.y - p.radius),
          Math.floor(p.radius * 2),
          Math.floor(p.radius * 2)
        );
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.fillRect(
          Math.floor(p.x),
          Math.floor(p.y),
          Math.floor(p.radius),
          Math.floor(p.radius)
        );
      }

      ctx.restore();
    }
  }

  clear(): void {
    this.particles.length = 0;
  }

  getActiveCount(): number {
    return this.particles.length;
  }
}
