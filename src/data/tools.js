// Central registry of every tool page. Header nav, Footer, homepage grid,
// and RelatedTools all read from this single list so links stay in sync.
export const tools = [
  {
    slug: 'body-fat-calculator',
    name: 'Body Fat Calculator',
    category: 'Body and Composition',
    description: 'Estimate body fat percentage from neck, waist, and hip measurements using the US Navy method.',
  },
  {
    slug: 'lean-body-mass-calculator',
    name: 'Lean Body Mass Calculator',
    category: 'Body and Composition',
    description: 'Estimate lean body mass and fat mass from your weight and height using the Boer formula.',
  },
  {
    slug: 'macro-calculator',
    name: 'Macro Calculator',
    category: 'Body and Composition',
    description: 'Get a daily protein, fat, and carb target based on your calorie goal and body weight.',
  },
  {
    slug: 'tdee-calculator',
    name: 'TDEE and BMR Calculator',
    category: 'Body and Composition',
    description: 'Find your basal metabolic rate and total daily energy expenditure based on activity level.',
  },
  {
    slug: 'calories-burned-calculator',
    name: 'Calories Burned Calculator',
    category: 'Body and Composition',
    description: 'Estimate calories burned during an activity using standard MET values, weight, and duration.',
  },
  {
    slug: 'one-rep-max-calculator',
    name: '1RM Calculator',
    category: 'Performance and Training',
    description: 'Estimate your one-rep max from a weight and rep count using the Epley and Brzycki formulas.',
  },
  {
    slug: 'plate-loading-calculator',
    name: 'Plate Loading Calculator',
    category: 'Performance and Training',
    description: 'Work out exactly which plates to load on each side of the bar to hit a target weight.',
  },
  {
    slug: 'running-pace-calculator',
    name: 'Running Pace Calculator',
    category: 'Performance and Training',
    description: 'Calculate finish time, required pace, or average speed for any distance or race.',
  },
  {
    slug: 'heart-rate-zone-calculator',
    name: 'Heart Rate Zone Calculator',
    category: 'Performance and Training',
    description: 'Find your training heart rate zones from age and, optionally, resting heart rate.',
  },
  {
    slug: 'wilks-score-calculator',
    name: 'Wilks Score Calculator',
    category: 'Performance and Training',
    description: 'Calculate your Wilks score to compare powerlifting strength across body weights.',
  },
];

export function getTool(slug) {
  return tools.find((t) => t.slug === slug);
}

export function getRelatedTools(currentSlug, count = 3) {
  const current = getTool(currentSlug);
  const sameCategory = tools.filter(
    (t) => t.slug !== currentSlug && t.category === current?.category
  );
  const others = tools.filter(
    (t) => t.slug !== currentSlug && t.category !== current?.category
  );
  return [...sameCategory, ...others].slice(0, count);
}
