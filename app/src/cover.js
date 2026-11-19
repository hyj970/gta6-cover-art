// The cover renderer for Neon Bay Cover Studio: it draws the multi-panel poster,
// the photos inside their panels, the colour grade and the bold caption, all on a
// canvas. Everything it draws is code: the photos come from the user's own files
// or from the code-drawn samples, the skyline and figures are drawn, never copied.

import { drawSample } from './samples.js';

// Panel rectangles for each layout, as fractions of the cover [x, y, w, h].
export const LAYOUTS = {
  triptych: [
    [0, 0, 0.55, 1],
    [0.55, 0, 0.45, 0.55],
    [0.55, 0.55, 0.45, 0.45],
  ],
  split: [
    [0, 0, 0.5, 1],
    [0.5, 0, 0.5, 1],
  ],
  hero: [[0, 0, 1, 1]],
};

const GRADES = {
  sunset: {
    wash: ['rgba(255, 122, 61, 0.16)', 'rgba(255, 94, 138, 0.20)', 'rgba(43, 16, 85, 0.10)'],
    vignette: 'rgba(20, 6, 30, 0.42)',
    dots: 'rgba(255, 209, 102, 0.20)',
  },
  neon: {
    wash: ['rgba(45, 226, 255, 0.18)', 'rgba(255, 46, 147, 0.24)', 'rgba(11, 16, 48, 0.16)'],
    vignette: 'rgba(8, 4, 24, 0.5)',
    dots: 'rgba(45, 226, 255, 0.22)',
  },
  teal: {
    wash: ['rgba(45, 226, 255, 0.20)', 'rgba(255, 140, 90, 0.16)', 'rgba(18, 58, 107, 0.14)'],
    vignette: 'rgba(10, 20, 32, 0.46)',
    dots: 'rgba(255, 255, 255, 0.16)',
  },
};

// Draw one image into a rectangle, cover-fit, with zoom and pan offsets.
// zoom 1 means "fill the rectangle"; ox/oy shift the image by a fraction of its size.
export function drawPhotoCover(ctx, img, rect, zoom, ox, oy) {
  const [rx, ry, rw, rh] = rect;
  const iw = img.width;
  const ih = img.height;
  const base = Math.max(rw / iw, rh / ih);
  const scale = base * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rx + (rw - dw) / 2 + ox * rw * 0.25;
  const dy = ry + (rh - dh) / 2 + oy * rh * 0.25;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawEmptyPanel(ctx, rect, w, h, seedKind) {
  const [rx, ry, rw, rh] = rect;
  const art = drawSample(seedKind, Math.max(320, Math.round(rw)), Math.max(320, Math.round(rh)));
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();
  ctx.drawImage(art, rx, ry, rw, rh);
  ctx.restore();
}

function gradeWash(ctx, w, h, grade) {
  const g = GRADES[grade] ?? GRADES.sunset;
  const wash = ctx.createLinearGradient(0, 0, w, h);
  wash.addColorStop(0, g.wash[0]);
  wash.addColorStop(0.55, g.wash[1]);
  wash.addColorStop(1, g.wash[2]);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  // Halftone dots in the two far corners, a print-poster touch.
  ctx.save();
  ctx.fillStyle = g.dots;
  const step = Math.max(14, w / 72);
  for (const [cx0, cy0] of [[w - w * 0.16, h * 0.1], [w * 0.06, h * 0.9]]) {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const r = step * 0.16 * (1 + (i + j) * 0.12);
        ctx.beginPath();
        ctx.arc(cx0 + i * step, cy0 + j * step, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
  // Vignette.
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, g.vignette);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

function captionFill(ctx, text, x, y, size, style, w) {
  if (style === 'neon') {
    const g = ctx.createLinearGradient(x, y - size, x, y + size * 0.12);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, '#ff9ecf');
    g.addColorStop(1, '#ff2e9a');
    return g;
  }
  if (style === 'outline') return '#ffffff';
  const g = ctx.createLinearGradient(x, y - size, x, y + size * 0.12);
  g.addColorStop(0, '#ffe9a8');
  g.addColorStop(0.45, '#ffb347');
  g.addColorStop(1, '#ff5e8a');
  return g;
}

function drawCaption(ctx, text, style, pos, w, h) {
  const clean = (text || '').trim().toUpperCase() || 'NEON BAY';
  const bandH = h * 0.24;
  const bandY = pos === 'top' ? 0 : h - bandH;
  // Soft dark scrim so the letters read on any photo.
  const scrim = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  if (pos === 'top') {
    scrim.addColorStop(0, 'rgba(10, 4, 18, 0.72)');
    scrim.addColorStop(1, 'rgba(10, 4, 18, 0)');
  } else {
    scrim.addColorStop(0, 'rgba(10, 4, 18, 0)');
    scrim.addColorStop(1, 'rgba(10, 4, 18, 0.78)');
  }
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY, w, bandH);

  let size = Math.round(h * 0.15);
  ctx.save();
  ctx.font = `400 ${size}px Anton, "Arial Narrow", sans-serif`;
  ctx.textBaseline = 'alphabetic';
  const maxW = w * 0.92;
  const measured = ctx.measureText(clean).width;
  if (measured > maxW) {
    size = Math.max(24, Math.floor(size * (maxW / measured)));
    ctx.font = `400 ${size}px Anton, "Arial Narrow", sans-serif`;
  }
  const tw = ctx.measureText(clean).width;
  const x = (w - tw) / 2;
  const y = pos === 'top' ? bandY + bandH * 0.62 : h - bandH * 0.18;
  ctx.translate(w / 2, y);
  ctx.rotate(-0.02);
  ctx.translate(-w / 2, -y);
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeStyle = style === 'outline' ? '#160a1e' : 'rgba(22, 10, 30, 0.9)';
  ctx.lineWidth = Math.max(4, size / 14);
  ctx.strokeText(clean, x, y);
  if (style === 'neon') {
    ctx.shadowColor = '#ff2e9a';
    ctx.shadowBlur = size * 0.28;
  }
  ctx.fillStyle = captionFill(ctx, clean, x, y, size, style, w);
  ctx.fillText(clean, x, y);
  ctx.restore();
}

function drawWordmark(ctx, pos, w, h) {
  const size = Math.round(Math.min(w, h) * 0.032);
  ctx.save();
  ctx.font = `400 ${size}px Anton, "Arial Narrow", sans-serif`;
  ctx.textBaseline = 'top';
  const label = 'NEON BAY';
  const tw = ctx.measureText(label).width;
  const x = pos === 'top' ? w - tw - 28 : 28;
  const y = pos === 'top' ? h - size - 26 : 26;
  ctx.fillStyle = 'rgba(10, 4, 18, 0.55)';
  ctx.fillRect(x - 12, y - 8, tw + 24, size + 16);
  ctx.fillStyle = '#ffd166';
  ctx.fillText(label, x, y);
  // Small star.
  ctx.fillStyle = '#ff5e8a';
  const sx = x + tw + 34;
  const sy = y + size / 2;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? size * 0.42 : size * 0.18;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](sx + Math.cos(a) * r, sy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Render the whole cover onto `canvas` at its own pixel size.
export function renderCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#160a1e';
  ctx.fillRect(0, 0, w, h);

  const panels = LAYOUTS[state.layout] ?? LAYOUTS.triptych;
  const gap = Math.max(4, Math.round(Math.min(w, h) * 0.008));
  const emptyKinds = ['skyline', 'driver', 'racer'];
  panels.forEach((frac, i) => {
    const rect = [
      frac[0] * w + (frac[0] > 0 ? gap / 2 : 0),
      frac[1] * h + (frac[1] > 0 ? gap / 2 : 0),
      frac[2] * w - (frac[0] > 0 ? gap / 2 : 0) - (frac[0] + frac[2] < 1 ? gap / 2 : 0),
      frac[3] * h - (frac[1] > 0 ? gap / 2 : 0) - (frac[1] + frac[3] < 1 ? gap / 2 : 0),
    ];
    const photo = state.photos[i];
    if (photo && photo.img) {
      drawPhotoCover(ctx, photo.img, rect, photo.zoom, photo.ox, photo.oy);
    } else {
      drawEmptyPanel(ctx, rect, w, h, emptyKinds[i % emptyKinds.length]);
    }
    // White panel divider.
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = gap;
    ctx.strokeRect(rect[0], rect[1], rect[2], rect[3]);
  });

  gradeWash(ctx, w, h, state.grade);
  drawCaption(ctx, state.caption, state.captionStyle, state.captionPos, w, h);
  drawWordmark(ctx, state.captionPos, w, h);
}

// The export sizes the app offers, as [width, height].
export const EXPORT_SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};
