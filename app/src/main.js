// Neon Bay Cover Studio: the editor wiring. State lives here; drawing lives in
// cover.js and the sample illustrations in samples.js. Photos are read on the
// user's own machine with FileReader and never uploaded anywhere.

import { renderCover, EXPORT_SIZES } from './cover.js';
import { SAMPLES, drawSample, sampleNames } from './samples.js';

const $ = (sel) => document.querySelector(sel);
const canvas = $('#cover');
const statusEl = $('#status');
const exportPreview = $('#exportPreview');
const exportBox = $('#exportBox');
const exportMeta = $('#exportMeta');

const state = {
  layout: 'triptych',
  grade: 'sunset',
  caption: 'NEON BAY',
  captionStyle: 'sunset',
  captionPos: 'bottom',
  photos: [null, null, null],
};

const SLOT_NAMES = ['Hero panel', 'Upper panel', 'Lower panel'];
const SLOT_TAGS = ['A', 'B', 'C'];

function setStatus(text) {
  statusEl.textContent = text;
}

function draw() {
  const [w, h] = EXPORT_SIZES[$('#size').value] ?? [1080, 1080];
  canvas.width = w;
  canvas.height = h;
  renderCover(canvas, state);
}

async function ensureFont() {
  try {
    await document.fonts.load('100px Anton');
    await document.fonts.ready;
  } catch {
    // The caption falls back to a system condensed face; the cover still draws.
  }
}

function photoFromCanvas(sourceCanvas, label) {
  return { img: sourceCanvas, zoom: 1, ox: 0, oy: 0, label };
}

function loadSampleIntoSlot(index, kind) {
  if (!SAMPLES[kind]) return;
  const art = drawSample(kind, 1080, 1350);
  state.photos[index] = photoFromCanvas(art, SAMPLES[kind].label);
  draw();
  setStatus(`${SLOT_NAMES[index]} now shows the sample “${SAMPLES[kind].label}”.`);
}

function loadFileIntoSlot(index, file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.photos[index] = photoFromCanvas(img, file.name);
      draw();
      setStatus(`${SLOT_NAMES[index]} now shows “${file.name}”.`);
    };
    img.onerror = () => setStatus(`Could not read “${file.name}” as an image.`);
    img.src = String(reader.result);
  };
  reader.onerror = () => setStatus(`Could not read “${file.name}”.`);
  reader.readAsDataURL(file);
}

function buildSlots() {
  const host = $('#slots');
  host.innerHTML = '';
  SLOT_NAMES.forEach((name, i) => {
    const box = document.createElement('div');
    box.className = 'slot';

    const heading = document.createElement('h3');
    heading.textContent = `${name} `;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = `Panel ${SLOT_TAGS[i]}`;
    heading.appendChild(tag);
    box.appendChild(heading);

    const fileLabel = document.createElement('label');
    fileLabel.textContent = 'Your photo';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', () => loadFileIntoSlot(i, fileInput.files?.[0]));
    fileLabel.appendChild(fileInput);
    box.appendChild(fileLabel);

    const sampleRow = document.createElement('div');
    sampleRow.className = 'sample-row';
    const sampleSelect = document.createElement('select');
    sampleSelect.setAttribute('aria-label', `Sample illustration for ${name}`);
    const none = document.createElement('option');
    none.value = '';
    none.textContent = 'Sample illustration…';
    sampleSelect.appendChild(none);
    for (const kind of sampleNames()) {
      const opt = document.createElement('option');
      opt.value = kind;
      opt.textContent = SAMPLES[kind].label;
      sampleSelect.appendChild(opt);
    }
    sampleSelect.addEventListener('change', () => {
      if (sampleSelect.value) loadSampleIntoSlot(i, sampleSelect.value);
      sampleSelect.value = '';
    });
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'clear';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', () => {
      state.photos[i] = null;
      draw();
      setStatus(`${name} cleared; it shows the Neon Bay skyline until you add a photo.`);
    });
    sampleRow.appendChild(sampleSelect);
    sampleRow.appendChild(clearBtn);
    box.appendChild(sampleRow);

    const sliders = [
      ['zoom', 'Zoom', 1, 2.4, 0.01],
      ['ox', 'Pan left / right', -1, 1, 0.01],
      ['oy', 'Pan up / down', -1, 1, 0.01],
    ];
    for (const [key, label, min, max, step] of sliders) {
      const lab = document.createElement('label');
      lab.textContent = label;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.value = key === 'zoom' ? '1' : '0';
      input.setAttribute('aria-label', `${label} for ${name}`);
      input.addEventListener('input', () => {
        const photo = state.photos[i];
        if (!photo) {
          setStatus(`Add a photo to ${name} first, then crop and position it.`);
          input.value = key === 'zoom' ? '1' : '0';
          return;
        }
        photo[key] = Number(input.value);
        draw();
      });
      lab.appendChild(input);
      box.appendChild(lab);
    }
    host.appendChild(box);
  });
}

function wireChoices(selector, key) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(selector).forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      state[key] = btn.dataset[key];
      draw();
    });
  });
}

function exportPng() {
  const key = $('#size').value;
  const [w, h] = EXPORT_SIZES[key] ?? [1080, 1080];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  renderCover(off, state);
  return new Promise((resolve, reject) => {
    off.toBlob((blob) => {
      if (!blob) {
        reject(new Error('The browser could not make the PNG.'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neon-bay-cover-${key}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      exportPreview.src = url;
      exportBox.hidden = false;
      exportMeta.textContent = `Exported ${w} × ${h} PNG — “${state.caption.trim() || 'NEON BAY'}”, ${state.layout} layout, ${state.grade} grade.`;
      setStatus(`Exported a ${w} × ${h} PNG.`);
      resolve({ blob, url, w, h });
    }, 'image/png');
  });
}

function readShotParams() {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (!shot) return;
  const caption = params.get('caption');
  if (caption) {
    state.caption = caption;
    $('#caption').value = caption;
  }
  const layout = params.get('layout');
  if (layout && ['triptych', 'split', 'hero'].includes(layout)) {
    state.layout = layout;
    document.querySelectorAll('.layout-choice').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.layout === layout)));
  }
  const grade = params.get('grade');
  if (grade && ['sunset', 'neon', 'teal'].includes(grade)) {
    state.grade = grade;
    document.querySelectorAll('.grade-choice').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.grade === grade)));
  }
  const size = params.get('size');
  if (size && EXPORT_SIZES[size]) $('#size').value = size;
  const photo = params.get('photo');
  const kinds = sampleNames();
  if (photo && kinds.includes(photo)) {
    const count = state.layout === 'hero' ? 1 : state.layout === 'split' ? 2 : 3;
    for (let i = 0; i < count; i++) {
      const kind = kinds[(kinds.indexOf(photo) + i) % kinds.length];
      loadSampleIntoSlot(i, kind);
    }
  }
  if (params.get('captionStyle')) {
    state.captionStyle = params.get('captionStyle');
    $('#captionStyle').value = state.captionStyle;
  }
  if (params.get('captionPos')) {
    state.captionPos = params.get('captionPos');
    $('#captionPos').value = state.captionPos;
  }
  draw();
}

buildSlots();
wireChoices('.layout-choice', 'layout');
wireChoices('.grade-choice', 'grade');

$('#caption').addEventListener('input', (e) => {
  state.caption = e.target.value;
  draw();
});
$('#captionStyle').addEventListener('change', (e) => {
  state.captionStyle = e.target.value;
  draw();
});
$('#captionPos').addEventListener('change', (e) => {
  state.captionPos = e.target.value;
  draw();
});
$('#size').addEventListener('change', draw);
$('#export').addEventListener('click', () => {
  exportPng().catch((err) => setStatus(err.message));
});

// For automated checks: window.__neonBay exposes the export without a click.
window.__neonBay = { state, draw, exportPng };

await ensureFont();
readShotParams();
draw();
