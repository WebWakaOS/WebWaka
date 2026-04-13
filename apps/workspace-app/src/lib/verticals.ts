export interface VerticalMeta {
  slug: string;
  label: string;
  icon: string;
  aiCapability?: string;
}

export const VERTICAL_REGISTRY: Record<string, VerticalMeta> = {
  'abattoir':              { slug: 'abattoir',              label: 'Abattoir',            icon: '🥩', aiCapability: 'SLAUGHTER_YIELD_FORECAST' },
  'agro-input':           { slug: 'agro-input',            label: 'Agro-Input Store',    icon: '🌱', aiCapability: 'INPUT_DEMAND_ADVISORY' },
  'cassava-miller':       { slug: 'cassava-miller',        label: 'Cassava Miller',      icon: '🌾', aiCapability: 'MILLING_YIELD_FORECAST' },
  'cocoa-exporter':       { slug: 'cocoa-exporter',        label: 'Cocoa Exporter',      icon: '🍫', aiCapability: 'COMMODITY_PRICE_ADVISORY' },
  'cold-room':            { slug: 'cold-room',             label: 'Cold Room Facility',  icon: '🧊', aiCapability: 'TEMPERATURE_ALERT_ADVISORY' },
  'creche':               { slug: 'creche',                label: 'Crèche',              icon: '👶', aiCapability: 'ENROLLMENT_CAPACITY_ADVISORY' },
  'fish-market':          { slug: 'fish-market',           label: 'Fish Market',         icon: '🐟', aiCapability: 'DEMAND_PLANNING_ADVISORY' },
  'food-processing':      { slug: 'food-processing',       label: 'Food Processing',     icon: '🏭', aiCapability: 'PRODUCTION_DEMAND_ADVISORY' },
  'palm-oil':             { slug: 'palm-oil',              label: 'Palm Oil Mill',       icon: '🌴', aiCapability: 'PALM_OIL_YIELD_ADVISORY' },
  'vegetable-garden':     { slug: 'vegetable-garden',      label: 'Vegetable Garden',    icon: '🥦', aiCapability: 'CROP_YIELD_ADVISORY' },
  'pharmacy':             { slug: 'pharmacy',              label: 'Pharmacy',            icon: '💊' },
  'hotel':                { slug: 'hotel',                 label: 'Hotel',               icon: '🏨' },
  'supermarket':          { slug: 'supermarket',           label: 'Supermarket',         icon: '🛒' },
  'laundry':              { slug: 'laundry',               label: 'Laundry',             icon: '👕' },
  'auto-workshop':        { slug: 'auto-workshop',         label: 'Auto Workshop',       icon: '🔧' },
  'beauty-salon':         { slug: 'beauty-salon',          label: 'Beauty Salon',        icon: '💅' },
  'barber-shop':          { slug: 'barber-shop',           label: 'Barber Shop',         icon: '✂️' },
  'tailoring':            { slug: 'tailoring',             label: 'Tailoring',           icon: '🧵' },
  'restaurant':           { slug: 'restaurant',            label: 'Restaurant',          icon: '🍽️' },
  'bakery':               { slug: 'bakery',                label: 'Bakery',              icon: '🥖' },
};

export function getVerticalMeta(slug: string): VerticalMeta | undefined {
  return VERTICAL_REGISTRY[slug];
}

export function getVerticalLabel(slug: string): string {
  return VERTICAL_REGISTRY[slug]?.label ?? slug;
}
