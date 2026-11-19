// Sample "photos" for Neon Bay Cover Studio. Every one is drawn here, in code, as
// flat stylised illustration: a sunset sky, a fictional skyline, palm silhouettes
// and a character silhouette. No real person, no photograph, no game artwork.

function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function sunDisc(ctx, w, h, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Slatted retro sun: cut horizontal bands out of the lower half.
  ctx.globalCompositeOperation = 'destination-out';
  let y = cy + r * 0.08;
  let band = 4;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, band);
    y += band + r * 0.14;
    band += 3;
  }
  ctx.restore();
}

function skyline(ctx, w, h, baseY, color, seed) {
  ctx.fillStyle = color;
  let x = -10;
  let n = 0;
  while (x < w + 10) {
    const bw = 46 + ((seed * (n + 3)) % 90);
    const bh = h * (0.16 + ((seed * (n + 7)) % 100) / 100 * 0.24);
    ctx.fillRect(x, baseY - bh, bw, bh + 4);
    // Lit windows.
    ctx.fillStyle = 'rgba(255, 214, 130, 0.85)';
    for (let wy = baseY - bh + 12; wy < baseY - 14; wy += 22) {
      for (let wx = x + 9; wx < x + bw - 9; wx += 20) {
        if (((wx * 7 + wy * 13 + seed) % 5) < 2) ctx.fillRect(wx, wy, 7, 9);
      }
    }
    ctx.fillStyle = color;
    // Antenna on some towers.
    if (n % 3 === 0) ctx.fillRect(x + bw / 2 - 2, baseY - bh - 26, 4, 26);
    x += bw + 6;
    n++;
  }
}

function palm(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -70, 44, -108);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + i * 0.13);
    const len = 62 - Math.abs(i - 3) * 8;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(44, -108);
    ctx.quadraticCurveTo(
      44 + Math.cos(a) * len * 0.6, -108 + Math.sin(a) * len * 0.5 - 14,
      44 + Math.cos(a) * len, -108 + Math.sin(a) * len + 16,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function ground(ctx, w, h, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, w, h - y);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 5; i++) ctx.fillRect(0, y + 14 + i * 18, w, 2);
}

// A stylised character silhouette: head, shoulders, cap brim and shades.
function figure(ctx, cx, baseY, s, skin, jacket, cap) {
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.scale(s, s);
  // Shoulders / jacket.
  ctx.fillStyle = jacket;
  ctx.beginPath();
  ctx.moveTo(-150, 40);
  ctx.quadraticCurveTo(-140, -70, -58, -96);
  ctx.lineTo(58, -96);
  ctx.quadraticCurveTo(140, -70, 150, 40);
  ctx.closePath();
  ctx.fill();
  // Jacket zipper and collar.
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -92);
  ctx.lineTo(0, 40);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.moveTo(-58, -96);
  ctx.lineTo(0, -58);
  ctx.lineTo(58, -96);
  ctx.lineTo(30, -96);
  ctx.lineTo(0, -74);
  ctx.lineTo(-30, -96);
  ctx.closePath();
  ctx.fill();
  // Neck and head.
  ctx.fillStyle = skin;
  ctx.fillRect(-26, -128, 52, 40);
  ctx.beginPath();
  ctx.arc(0, -168, 62, 0, Math.PI * 2);
  ctx.fill();
  // Hair sweep.
  ctx.fillStyle = '#241423';
  ctx.beginPath();
  ctx.arc(0, -176, 62, Math.PI * 1.02, Math.PI * 1.98);
  ctx.quadraticCurveTo(52, -196, 30, -214);
  ctx.quadraticCurveTo(-10, -196, -58, -190);
  ctx.closePath();
  ctx.fill();
  // Cap.
  ctx.fillStyle = cap;
  ctx.beginPath();
  ctx.arc(0, -180, 64, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -178, 96, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  // Shades.
  ctx.fillStyle = '#12060f';
  ctx.fillRect(-52, -176, 44, 22);
  ctx.fillRect(8, -176, 44, 22);
  ctx.fillRect(-10, -170, 20, 6);
  // Earring glint.
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(58, -150, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function racerFigure(ctx, cx, baseY, s, suit, helmet) {
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.scale(s, s);
  // Leaning rider.
  ctx.rotate(-0.16);
  ctx.fillStyle = suit;
  ctx.beginPath();
  ctx.moveTo(-120, 30);
  ctx.quadraticCurveTo(-110, -60, -40, -88);
  ctx.lineTo(50, -88);
  ctx.quadraticCurveTo(120, -64, 128, 30);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-40, -88);
  ctx.lineTo(-14, 30);
  ctx.moveTo(50, -88);
  ctx.lineTo(26, 30);
  ctx.stroke();
  ctx.fillStyle = '#f2b28c';
  ctx.fillRect(-22, -122, 44, 38);
  // Helmet with a wide dark visor and a cyan glint.
  ctx.fillStyle = helmet;
  ctx.beginPath();
  ctx.arc(0, -164, 66, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#12060f';
  ctx.beginPath();
  ctx.roundRect(-48, -184, 96, 34, 16);
  ctx.fill();
  ctx.fillStyle = 'rgba(45, 226, 255, 0.85)';
  ctx.fillRect(-40, -178, 80, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(-38, -196, 76, 8);
  ctx.restore();
}

function drawDriver(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  skyGradient(ctx, w, h, [[0, '#2b1055'], [0.45, '#c13b7a'], [0.75, '#ff7a3d'], [1, '#ffc46b']]);
  sunDisc(ctx, w, h, w * 0.68, h * 0.42, w * 0.2, '#ffe9a8');
  skyline(ctx, w, h, h * 0.78, '#3a1445', 31);
  skyline(ctx, w, h, h * 0.84, '#24102e', 77);
  ground(ctx, w, h, h * 0.84, '#1c0b22');
  // A low car bonnet at the bottom edge.
  ctx.fillStyle = '#ff2e63';
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.93);
  ctx.quadraticCurveTo(w * 0.5, h * 0.88, w, h * 0.94);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(w * 0.12, h * 0.925, w * 0.2, 6);
  figure(ctx, w * 0.42, h * 0.86, h / 900, '#f2b28c', '#1e6f8e', '#ff2e63');
  palm(ctx, w * 0.88, h * 0.86, h / 900, '#160a1e');
  return c;
}

function drawRacer(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  skyGradient(ctx, w, h, [[0, '#0b1030'], [0.5, '#3b1a63'], [0.8, '#d63384'], [1, '#ff7a3d']]);
  // Neon grid horizon.
  ctx.strokeStyle = 'rgba(45, 226, 255, 0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const y = h * (0.62 + i * i * 0.006);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let i = -6; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * 40, h * 0.62);
    ctx.lineTo(w / 2 + i * 260, h);
    ctx.stroke();
  }
  sunDisc(ctx, w, h, w * 0.5, h * 0.4, w * 0.17, '#ff9ecf');
  skyline(ctx, w, h, h * 0.62, '#1a0f33', 53);
  ground(ctx, w, h, h * 0.62, '#12081f');
  racerFigure(ctx, w * 0.5, h * 0.74, h / 820, '#2de2ff', '#ff2e63');
  palm(ctx, w * 0.1, h * 0.66, h / 1000, '#0d0616');
  palm(ctx, w * 0.92, h * 0.64, h / 1100, '#0d0616');
  return c;
}

function drawSkyline(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  skyGradient(ctx, w, h, [[0, '#123a6b'], [0.45, '#7a4a9e'], [0.75, '#ff8c5a'], [1, '#ffd166']]);
  sunDisc(ctx, w, h, w * 0.5, h * 0.46, w * 0.22, '#fff3c4');
  // Water with sun reflection.
  ctx.fillStyle = '#1b2a52';
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  ctx.fillStyle = 'rgba(255, 214, 130, 0.5)';
  for (let i = 0; i < 14; i++) {
    const y = h * (0.74 + i * 0.018);
    const ww = w * (0.06 + i * 0.012);
    ctx.fillRect(w / 2 - ww / 2, y, ww, 4);
  }
  skyline(ctx, w, h, h * 0.72, '#2a1740', 19);
  skyline(ctx, w, h, h * 0.74, '#1a0e28', 91);
  palm(ctx, w * 0.08, h * 0.74, h / 800, '#12081f');
  palm(ctx, w * 0.94, h * 0.73, h / 900, '#12081f');
  // A small speedboat cutting the water.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(w * 0.62, h * 0.86);
  ctx.lineTo(w * 0.78, h * 0.86);
  ctx.lineTo(w * 0.74, h * 0.82);
  ctx.lineTo(w * 0.66, h * 0.82);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.6, h * 0.88);
  ctx.quadraticCurveTo(w * 0.52, h * 0.9, w * 0.44, h * 0.88);
  ctx.stroke();
  return c;
}

// The samples the editor offers, with the character or place each one shows.
export const SAMPLES = {
  driver: { label: 'Mara Voss — getaway driver', draw: drawDriver },
  racer: { label: 'Luna Reyes — street racer', draw: drawRacer },
  skyline: { label: 'Neon Bay waterfront', draw: drawSkyline },
};

export function sampleNames() {
  return Object.keys(SAMPLES);
}

export function drawSample(kind, w, h) {
  const entry = SAMPLES[kind];
  if (!entry) return null;
  return entry.draw(w, h);
}
