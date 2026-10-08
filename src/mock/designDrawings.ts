// Offline-safe drawings used where the demo previously showed a stock photo.
// Generated from the configurator for PRJ-2026-001 (L-shaped kitchen, walls 420 × 340 cm).

import { buildConfiguration, defaultOptions, layoutKitchen } from '../services/kitchenConfigurator';
import { renderElevationSvg, renderPlanSvg, svgToDataUrl } from '../utils/kitchenDrawing';
import type { ConfiguratorWall } from '../types/configurator';

const walls: ConfiguratorWall[] = [
  { id: 'wall-1', name: 'جدار A الرئيسي (الحوض)', lengthCm: 420, hasSink: true, hasHob: false, hasDishwasher: false, hasFridge: false, hasOvenTower: false, windowWidthCm: 100 },
  { id: 'wall-2', name: 'جدار B (البوتاجاز والثلاجة)', lengthCm: 340, hasSink: false, hasHob: true, hasDishwasher: true, hasFridge: true, hasOvenTower: false, windowWidthCm: 0 }
];
const options = { ...defaultOptions('standard'), frontKey: 'HPL-812-BEIGE', countertopKey: 'MARBLE-GALAXY', islandLengthCm: 180 };
const layout = layoutKitchen('l_shape', walls, options, 280);
const config = buildConfiguration({ layout: 'l_shape', tier: 'standard', walls, options, ceilingHeightCm: 280, units: layout.units });

export const KITCHEN_DRAWINGS = {
  plan: svgToDataUrl(renderPlanSvg(config)),
  elevationA: svgToDataUrl(renderElevationSvg(config, 'wall-1', { title: true })),
  elevationB: svgToDataUrl(renderElevationSvg(config, 'wall-2', { title: true }))
};

/** Shown when a design is saved without any uploaded image. */
export const NO_IMAGE_PLACEHOLDER = svgToDataUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" font-family="Cairo, sans-serif">` +
  `<rect width="600" height="400" fill="#FAF7F2"/><rect x="20" y="20" width="560" height="360" fill="none" stroke="#D9CBB9" stroke-dasharray="8 6" rx="16"/>` +
  `<text x="300" y="195" font-size="22" text-anchor="middle" fill="#8F857C" font-weight="700">لم يتم رفع صورة للتصميم بعد</text>` +
  `<text x="300" y="228" font-size="14" text-anchor="middle" fill="#B8AC9E">ارفع الرندر أو ملف الـ PDF من زرار التصميم</text></svg>`
);
