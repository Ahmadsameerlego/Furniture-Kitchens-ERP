// ============================================================================
// Kitchen configurator: turns site measurements + a few finish choices into a
// full list of cabinet units. The same units price the quotation and, after the
// contract, explode into the technical office BOM (cutting list + hardware).
// ============================================================================

export type KitchenLayout = 'straight' | 'l_shape' | 'u_shape' | 'parallel';

export type FinishTier = 'economy' | 'standard' | 'premium';

export type CabinetZone = 'base' | 'wall' | 'tall';

export type CabinetRole =
  | 'standard'
  | 'sink'
  | 'hob'
  | 'drawers'
  | 'dishwasher'
  | 'corner'
  | 'bottle'
  | 'filler'
  | 'hood'
  | 'fridge'
  | 'oven'
  | 'pantry'
  | 'island';

export type HandleStyle = 'bar' | 'gola';

export interface ConfiguratorWall {
  id: string;
  /** Wall label as written in the site measurement (e.g. "جدار A الرئيسي"). */
  name: string;
  lengthCm: number;
  hasSink: boolean;
  hasHob: boolean;
  hasDishwasher: boolean;
  hasFridge: boolean;
  hasOvenTower: boolean;
  /** Width of a window on this wall; no wall cabinets are hung across it. */
  windowWidthCm: number;
}

export interface ConfiguratorOptions {
  /** Catalog key of the cabinet body board. */
  carcassKey: string;
  /** Catalog key of the door / drawer-front board. */
  frontKey: string;
  /** Catalog key of the worktop stone. */
  countertopKey: string;
  handleStyle: HandleStyle;
  /** Lift-up (Aventos) doors on wall cabinets 80 cm and wider. */
  liftUpWallDoors: boolean;
  ledUnderWallUnits: boolean;
  /** Island length in cm; 0 means no island. */
  islandLengthCm: number;
  includeInstallation: boolean;
  /** Floor of the site, used for transport cost. */
  siteFloor: number;
  discountPercent: number;
}

export interface ConfiguredUnit {
  id: string;
  wallId: string;
  zone: CabinetZone;
  role: CabinetRole;
  /** Factory code, e.g. "B-90-SINK", "W-60-2D", "T-60-OVEN". */
  code: string;
  name: string;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  doors: number;
  drawers: number;
  /** Position along the wall from its start, in cm (used by the plan drawing). */
  offsetCm: number;
}

export interface ConfiguratorMetrics {
  baseMeters: number;
  wallMeters: number;
  tallMeters: number;
  countertopMeters: number;
  unitsCount: number;
  doorsCount: number;
  drawersCount: number;
}

export interface KitchenConfiguration {
  layout: KitchenLayout;
  tier: FinishTier;
  ceilingHeightCm: number;
  walls: ConfiguratorWall[];
  options: ConfiguratorOptions;
  units: ConfiguredUnit[];
  metrics: ConfiguratorMetrics;
  /** Measurement version the walls were taken from, for traceability. */
  sourceMeasurementVersion?: number;
  generatedAt: string;
}
