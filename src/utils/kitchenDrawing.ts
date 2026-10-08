// ============================================================================
// SVG drawings of a configured kitchen: a front elevation per wall and a top-view
// plan. Pure string builders so the same drawing renders in the configurator,
// prints in the quotation and is saved as the project's preliminary design image.
// ============================================================================

import type { ConfiguredUnit, KitchenConfiguration } from '../types/configurator';
import { cabinetHeights, frontOption, countertopOption } from '../services/kitchenConfigurator';

const FRONT_COLORS: Record<string, string> = {
  'HPL-WHITE-MATT': '#F2F0EB',
  'HPL-812-BEIGE': '#D8C7AC',
  'HPL-GRAPHITE': '#55595F',
  'HPL-OAK-IND': '#B98A5B',
  'ACRYLIC-WHITE-GLOSS': '#FBFBF9',
  'LACQUER-MDF-18': '#ECE5DA',
  'OAK-PLYWOOD-18': '#A87545'
};

const TOP_COLORS: Record<string, string> = { 'MARBLE-GALAXY': '#232323', 'QUARTZ-WHITE': '#EDEDED' };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const svgToDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) < 140;
};

/** Front elevation of one wall, in centimetres (1 unit = 1 cm). */
export function renderElevationSvg(config: KitchenConfiguration, wallId: string, opts: { title?: boolean } = {}): string {
  const wall = config.walls.find(w => w.id === wallId);
  if (!wall) return '';
  const units = config.units.filter(u => u.wallId === wallId);
  const h = cabinetHeights(config.ceilingHeightCm);
  const front = FRONT_COLORS[config.options.frontKey] || '#EEE';
  const line = isDark(front) ? '#E8E2D8' : '#5B4636';
  const top = TOP_COLORS[config.options.countertopKey] || '#333';
  const C = config.ceilingHeightCm;
  const pad = 30;
  const W = wall.lengthCm + pad * 2;
  const H = C + pad * 2 + (opts.title ? 44 : 0);
  const oy = pad + (opts.title ? 44 : 0);
  const X = (x: number) => pad + x;
  const Y = (fromFloor: number) => oy + C - fromFloor;
  const out: string[] = [];

  out.push(`<rect x="${X(0)}" y="${Y(C)}" width="${wall.lengthCm}" height="${C}" fill="#FAF7F2" stroke="#C9BBAA" stroke-width="1"/>`);
  out.push(`<line x1="${X(0) - 10}" y1="${Y(0)}" x2="${X(wall.lengthCm) + 10}" y2="${Y(0)}" stroke="#5B4636" stroke-width="2"/>`);

  // Window above the sink
  if (wall.windowWidthCm > 0) {
    const sink = units.find(u => u.role === 'sink');
    const centre = sink ? sink.offsetCm + 45 : wall.lengthCm / 2;
    const x0 = Math.max(0, centre - wall.windowWidthCm / 2);
    out.push(`<rect x="${X(x0)}" y="${Y(215)}" width="${wall.windowWidthCm}" height="110" fill="#DCEBF2" stroke="#7FA6B8" stroke-width="1.5"/>`);
    out.push(`<line x1="${X(x0 + wall.windowWidthCm / 2)}" y1="${Y(215)}" x2="${X(x0 + wall.windowWidthCm / 2)}" y2="${Y(105)}" stroke="#7FA6B8"/>`);
  }

  const drawFronts = (u: ConfiguredUnit, x: number, yTop: number, height: number) => {
    const w = u.widthCm;
    if (u.role === 'dishwasher') {
      out.push(`<text x="${x + w / 2}" y="${yTop + height / 2}" font-size="9" text-anchor="middle" fill="${line}" opacity="0.6">غسالة</text>`);
      return;
    }
    if (u.drawers > 0 && u.role !== 'oven') {
      const f1 = height * 0.25;
      out.push(`<line x1="${x + 1}" y1="${yTop + f1}" x2="${x + w - 1}" y2="${yTop + f1}" stroke="${line}" stroke-width="0.8"/>`);
      out.push(`<line x1="${x + 1}" y1="${yTop + f1 + (height - f1) / 2}" x2="${x + w - 1}" y2="${yTop + f1 + (height - f1) / 2}" stroke="${line}" stroke-width="0.8"/>`);
      return;
    }
    if (u.role === 'oven') {
      out.push(`<rect x="${x + 3}" y="${yTop + height - 30 - 60}" width="${w - 6}" height="58" fill="#2B2B2B" rx="2"/>`);
      out.push(`<line x1="${x + 1}" y1="${yTop + height - 30}" x2="${x + w - 1}" y2="${yTop + height - 30}" stroke="${line}" stroke-width="0.8"/>`);
      return;
    }
    if (u.role === 'fridge') {
      out.push(`<line x1="${x + 1}" y1="${yTop + 40}" x2="${x + w - 1}" y2="${yTop + 40}" stroke="${line}" stroke-width="0.8"/>`);
      out.push(`<rect x="${x + 4}" y="${yTop + 44}" width="${w - 8}" height="${height - 48}" fill="#D6D8DA" stroke="#9AA0A6" rx="3"/>`);
      return;
    }
    if (u.role === 'pantry') {
      out.push(`<line x1="${x}" y1="${yTop + height / 2}" x2="${x + w}" y2="${yTop + height / 2}" stroke="${line}" stroke-width="0.8"/>`);
    }
    const doors = u.role === 'pantry' ? 2 : u.doors;
    for (let i = 1; i < doors; i++) {
      out.push(`<line x1="${x + (w * i) / doors}" y1="${yTop + 1}" x2="${x + (w * i) / doors}" y2="${yTop + height - 1}" stroke="${line}" stroke-width="0.8"/>`);
    }
    if (config.options.handleStyle === 'bar' || u.zone !== 'base') {
      for (let i = 0; i < Math.max(1, doors); i++) {
        const hx = doors > 1 ? x + (w * (i + 0.5)) / doors + (i % 2 === 0 ? w / doors / 2 - 4 : -(w / doors / 2) + 4) : x + w - 5;
        const hy = u.zone === 'wall' ? yTop + height - 14 : yTop + 8;
        out.push(`<line x1="${hx}" y1="${hy}" x2="${hx}" y2="${hy + 10}" stroke="#2B2B2B" stroke-width="1.6"/>`);
      }
    }
  };

  units.forEach(u => {
    const x = X(u.offsetCm);
    if (u.zone === 'base' || u.zone === 'tall') {
      const height = u.zone === 'tall' ? h.tall : 72;
      const yTop = Y(10 + height);
      out.push(`<rect x="${x}" y="${Y(10)}" width="${u.widthCm}" height="10" fill="#3A3A3A"/>`);
      out.push(`<rect x="${x + 0.5}" y="${yTop}" width="${u.widthCm - 1}" height="${height}" fill="${front}" stroke="${line}" stroke-width="1"/>`);
      if (u.role !== 'filler') drawFronts(u, x + 0.5, yTop, height);
      if (config.options.handleStyle === 'gola' && u.zone === 'base' && u.role !== 'filler') {
        out.push(`<rect x="${x}" y="${yTop}" width="${u.widthCm}" height="3" fill="#1F1F1F"/>`);
      }
      if (u.zone === 'base') {
        out.push(`<rect x="${x}" y="${Y(85)}" width="${u.widthCm}" height="3" fill="${top}"/>`);
        if (u.role === 'sink') out.push(`<path d="M ${x + u.widthCm / 2 - 3} ${Y(85)} v -16 h 10" stroke="#8A8F94" stroke-width="2" fill="none"/>`);
        if (u.role === 'hob') out.push(`<rect x="${x + 8}" y="${Y(86)}" width="${u.widthCm - 16}" height="1.5" fill="#111"/>`);
      }
      if (u.widthCm >= 25) out.push(`<text x="${x + u.widthCm / 2}" y="${Y(0) + 14}" font-size="9" text-anchor="middle" fill="#5B4636">${u.widthCm}</text>`);
    } else {
      const isHood = u.role === 'hood';
      const height = isHood ? 40 : h.wall;
      const yTop = Y(h.wallBottom + h.wall);
      out.push(`<rect x="${x + 0.5}" y="${yTop}" width="${u.widthCm - 1}" height="${height}" fill="${front}" stroke="${line}" stroke-width="1"/>`);
      if (u.role !== 'filler') drawFronts(u, x + 0.5, yTop, height);
      if (isHood) {
        const cx = x + u.widthCm / 2;
        out.push(`<path d="M ${cx - 30} ${Y(h.wallBottom)} L ${cx - 12} ${yTop + height} L ${cx + 12} ${yTop + height} L ${cx + 30} ${Y(h.wallBottom)} Z" fill="#B7BCC1" stroke="#80868C"/>`);
      }
      if (config.options.ledUnderWallUnits && !isHood) out.push(`<rect x="${x + 3}" y="${Y(h.wallBottom) - 1}" width="${u.widthCm - 6}" height="1.5" fill="#F7C948"/>`);
      if (u.widthCm >= 25) out.push(`<text x="${x + u.widthCm / 2}" y="${yTop - 4}" font-size="9" text-anchor="middle" fill="#5B4636">${u.widthCm}</text>`);
    }
  });

  // Overall dimension
  out.push(`<line x1="${X(0)}" y1="${Y(0) + 22}" x2="${X(wall.lengthCm)}" y2="${Y(0) + 22}" stroke="#C87A38" stroke-width="1"/>`);
  out.push(`<text x="${X(wall.lengthCm / 2)}" y="${Y(0) + 27}" font-size="9" text-anchor="middle" fill="#C87A38" font-weight="700">${wall.lengthCm} سم</text>`);
  if (opts.title) {
    out.push(`<text x="${W - pad}" y="18" font-size="13" text-anchor="start" direction="rtl" fill="#361D13" font-weight="800">${esc(wall.name)} — واجهة أمامية</text>`);
    out.push(`<text x="${W - pad}" y="36" font-size="10" text-anchor="start" direction="rtl" fill="#8F857C">${esc(frontOption(config.options.frontKey).label)} • ${esc(countertopOption(config.options.countertopKey).label)}</text>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Cairo, Tajawal, sans-serif">${out.join('')}</svg>`;
}

interface Geo { ox: number; oy: number; dx: number; dy: number; nx: number; ny: number }

function wallGeometry(config: KitchenConfiguration): Record<string, Geo> {
  const [w0, w1, w2] = config.walls;
  const g: Record<string, Geo> = {};
  if (w0) g[w0.id] = { ox: 0, oy: 0, dx: 1, dy: 0, nx: 0, ny: 1 };
  if (config.layout === 'parallel' && w1) {
    g[w1.id] = { ox: 0, oy: 60 + 120 + 60, dx: 1, dy: 0, nx: 0, ny: -1 };
  } else if (w1 && w0) {
    g[w1.id] = { ox: w0.lengthCm, oy: 0, dx: 0, dy: 1, nx: -1, ny: 0 };
    if (w2) g[w2.id] = { ox: w0.lengthCm, oy: w1.lengthCm, dx: -1, dy: 0, nx: 0, ny: -1 };
  }
  return g;
}

/** Top-view plan of the whole kitchen. */
export function renderPlanSvg(config: KitchenConfiguration): string {
  const geo = wallGeometry(config);
  const front = FRONT_COLORS[config.options.frontKey] || '#EEE';
  const rects: { x: number; y: number; w: number; h: number; fill: string; stroke: string; dash?: boolean; label?: string }[] = [];
  const walls: string[] = [];

  config.walls.forEach(wall => {
    const g = geo[wall.id];
    if (!g) return;
    const x1 = g.ox;
    const y1 = g.oy;
    const x2 = g.ox + g.dx * wall.lengthCm;
    const y2 = g.oy + g.dy * wall.lengthCm;
    walls.push(`<line x1="${x1 - g.nx * 6}" y1="${y1 - g.ny * 6}" x2="${x2 - g.nx * 6}" y2="${y2 - g.ny * 6}" stroke="#5B4636" stroke-width="12" stroke-linecap="square"/>`);
    const lx = (x1 + x2) / 2 - g.nx * 22;
    const ly = (y1 + y2) / 2 - g.ny * 22 + 4;
    walls.push(`<text x="${lx}" y="${ly}" font-size="12" text-anchor="middle" fill="#C87A38" font-weight="700"${g.dy !== 0 ? ` transform="rotate(90 ${lx} ${ly})"` : ""}>${esc(wall.name.split('(')[0].trim())} • ${wall.lengthCm}</text>`);
  });

  const place = (u: ConfiguredUnit, g: Geo, depth: number) => {
    const ax = g.ox + g.dx * u.offsetCm;
    const ay = g.oy + g.dy * u.offsetCm;
    const bx = g.ox + g.dx * (u.offsetCm + u.widthCm) + g.nx * depth;
    const by = g.oy + g.dy * (u.offsetCm + u.widthCm) + g.ny * depth;
    return { x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax), h: Math.abs(by - ay) };
  };

  config.units.filter(u => u.zone !== 'wall').forEach(u => {
    if (u.wallId === 'island') return;
    const g = geo[u.wallId];
    if (!g) return;
    const r = place(u, g, 60);
    rects.push({ ...r, fill: u.zone === 'tall' ? '#7A5A43' : u.role === 'filler' ? '#D9D2C7' : front, stroke: '#5B4636', label: u.role === 'sink' ? 'حوض' : u.role === 'hob' ? 'بوتاجاز' : u.role === 'dishwasher' ? 'غسالة' : u.role === 'fridge' ? 'ثلاجة' : u.role === 'oven' ? 'فرن' : u.role === 'corner' ? 'ركنة' : undefined });
  });
  config.units.filter(u => u.zone === 'wall').forEach(u => {
    const g = geo[u.wallId];
    if (!g) return;
    rects.push({ ...place(u, g, 35), fill: 'none', stroke: '#C87A38', dash: true });
  });

  const island = config.units.filter(u => u.wallId === 'island');
  if (island.length) {
    const len = island.reduce((s, u) => s + u.widthCm, 0);
    const w0 = config.walls[0]?.lengthCm || 300;
    const x0 = Math.max(80, (w0 - len) / 2);
    const y0 = config.layout === 'parallel' ? 90 : 160;
    rects.push({ x: x0, y: y0, w: len, h: 90, fill: front, stroke: '#5B4636', label: 'جزيرة' });
  }

  const xs = rects.flatMap(r => [r.x, r.x + r.w]).concat(config.walls.map(w => w.lengthCm), [0]);
  const ys = rects.flatMap(r => [r.y, r.y + r.h]).concat([0]);
  const minX = Math.min(...xs) - 90;
  const minY = Math.min(...ys) - 60;
  const maxX = Math.max(...xs) + 90;
  const maxY = Math.max(...ys) + 50;

  const body = rects.map(r =>
    `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.fill}" stroke="${r.stroke}" stroke-width="${r.dash ? 1.5 : 1}" ${r.dash ? 'stroke-dasharray="5 4"' : ''}/>` +
    (r.label ? `<text x="${r.x + r.w / 2}" y="${r.y + r.h / 2 + 4}" font-size="11" text-anchor="middle" fill="${r.fill === '#7A5A43' || isDark(r.fill) ? '#FFF' : '#361D13'}" font-weight="700">${r.label}</text>` : '')
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" font-family="Cairo, Tajawal, sans-serif"><rect x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}" fill="#FFFDF9"/>${walls.join('')}${body}</svg>`;
}
