// ============================================================================
// Which kitchen configuration should the technical office explode into a BOM?
//
// 1. The configuration the customer signed (quotation made with the configurator).
// 2. Otherwise one rebuilt from the engineer's site survey (laser walls, plumbing,
//    gas, duct and appliances), with materials read from the signed quotation's
//    specification text.
// 3. Otherwise one rebuilt from the sales measurement.
// There is no fixed template any more: every BOM comes from the real walls.
// ============================================================================

import type { ProjectMeasurement, ProjectQuotation } from '../types/erp';
import type { ConfiguratorOptions, ConfiguratorWall, KitchenConfiguration } from '../types/configurator';
import type { TechnicalSiteSurvey } from '../types/technicalOffice';
import { buildConfiguration, defaultOptions, layoutKitchen, suggestLayout, wallsFromMeasurement } from './kitchenConfigurator';

export interface BomSource {
  configuration: KitchenConfiguration;
  kind: 'configurator' | 'survey' | 'measurement';
  label: string;
}

/** "الجدار B (الجانبي...)" / "جدار B" -> "B" */
const wallLetter = (text?: string) => (text || '').match(/\b([A-Za-z])\b/)?.[1]?.toUpperCase() || '';

/** Guess the finish from the words used in the signed quotation and project name. */
export function optionsFromText(text: string): ConfiguratorOptions {
  const t = text || '';
  const o = defaultOptions('standard');
  if (/أكريليك|اكريليك|acrylic/i.test(t)) o.frontKey = 'ACRYLIC-WHITE-GLOSS';
  else if (/بولي|لاكيه|لاكية|lacquer/i.test(t)) o.frontKey = 'LACQUER-MDF-18';
  else if (/قشرة|أرو طبيعي|veneer/i.test(t)) o.frontKey = 'OAK-PLYWOOD-18';
  else if (/HPL/i.test(t) && /أرو|خشابي|oak/i.test(t)) o.frontKey = 'HPL-OAK-IND';
  else if (/HPL/i.test(t) && /رمادي|جرافيت|graphite/i.test(t)) o.frontKey = 'HPL-GRAPHITE';
  else if (/HPL/i.test(t) && /812|بيج/i.test(t)) o.frontKey = 'HPL-812-BEIGE';
  else if (/HPL/i.test(t)) o.frontKey = 'HPL-WHITE-MATT';
  o.countertopKey = /كوارتز|quartz/i.test(t) ? 'QUARTZ-WHITE' : 'MARBLE-GALAXY';
  o.handleStyle = /جولا|gola/i.test(t) ? 'gola' : 'bar';
  o.liftUpWallDoors = /aventos|أفنتوس|قلاب/i.test(t);
  o.ledUnderWallUnits = /ليد|led/i.test(t);
  o.islandLengthCm = /جزيرة/.test(t) ? 180 : 0;
  return o;
}

function wallsFromSurvey(survey: TechnicalSiteSurvey): ConfiguratorWall[] {
  const sinkWall = wallLetter(survey.plumbing?.waterDrainageLocation || survey.plumbing?.waterSupplyLocation);
  const hobWall = wallLetter(survey.gas?.valveLocation) || wallLetter(survey.ventilation?.ductLocation);
  const dwWall = wallLetter(survey.electricalPoints?.find(e => /غسالة/.test(e.purpose))?.locationWall);
  const hasFridge = survey.appliances?.some(a => a.applianceType === 'refrigerator');
  const hasOven = survey.appliances?.some(a => a.applianceType === 'built_in_oven');
  const window = survey.openings?.find(o => o.type === 'window');

  const walls = survey.walls.slice(0, 3).map((w, idx): ConfiguratorWall => {
    const letter = wallLetter(w.wallName) || String.fromCharCode(65 + idx);
    const text = `${w.wallName} ${w.notes || ''}`;
    return {
      id: `wall-${idx + 1}`,
      name: w.wallName,
      lengthCm: Math.round(w.lengthCm),
      hasSink: letter === sinkWall || /حوض|صرف/.test(text),
      hasHob: letter === hobWall || /بوتاجاز|شفاط|مسطح/.test(text),
      hasDishwasher: letter === dwWall || /غسالة/.test(text),
      hasFridge: /ثلاجة/.test(text),
      hasOvenTower: /فرن/.test(text),
      windowWidthCm: window && wallLetter(window.location) === letter ? Math.round(window.widthCm) : 0
    };
  });
  if (walls.length === 0) return walls;
  if (!walls.some(w => w.hasSink)) walls[0].hasSink = true;
  if (!walls.some(w => w.hasHob)) (walls[1] || walls[0]).hasHob = true;
  // Tall appliances go on the wall with the most free run: the one without the sink
  const tallWall = walls.find(w => !w.hasSink) || walls[walls.length - 1];
  if (hasFridge && !walls.some(w => w.hasFridge)) tallWall.hasFridge = true;
  if (hasOven && !walls.some(w => w.hasOvenTower)) tallWall.hasOvenTower = true;
  return walls;
}

export function resolveBomSource(params: {
  signedQuote?: ProjectQuotation;
  survey?: TechnicalSiteSurvey;
  measurement?: ProjectMeasurement;
  projectName: string;
}): BomSource | null {
  const { signedQuote, survey, measurement, projectName } = params;
  if (signedQuote?.configuration) {
    return { configuration: signedQuote.configuration, kind: 'configurator', label: `عرض السعر المعتمد V${signedQuote.version} (Configurator)` };
  }

  const specText = [
    projectName,
    signedQuote?.breakdown?.specifications?.doors,
    signedQuote?.breakdown?.specifications?.carcass,
    signedQuote?.breakdown?.specifications?.notes,
    signedQuote?.breakdown?.marble?.typeName,
    ...(signedQuote?.items || []).map(i => i.materialName)
  ].filter(Boolean).join(' ');
  const options = optionsFromText(specText);

  let walls: ConfiguratorWall[] = [];
  let ceiling = 270;
  let kind: BomSource['kind'] = 'survey';
  let label = '';
  if (survey && survey.walls.length > 0) {
    walls = wallsFromSurvey(survey);
    ceiling = survey.ceilingHeightCm || 270;
    label = `الرفع المساحي ${survey.surveyNumber}`;
  } else if (measurement) {
    const m = wallsFromMeasurement(measurement);
    walls = m.walls;
    ceiling = m.ceilingHeightCm;
    kind = 'measurement';
    label = `معاينة المبيعات V${measurement.version}`;
  }
  if (walls.length === 0) return null;

  const layout = suggestLayout(walls.length);
  const result = layoutKitchen(layout, walls, options, ceiling);
  return {
    configuration: buildConfiguration({ layout, tier: 'standard', walls, options, ceilingHeightCm: ceiling, units: result.units, sourceMeasurementVersion: measurement?.version }),
    kind,
    label
  };
}
