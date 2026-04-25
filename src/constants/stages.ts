export const STAGES = [
  { index: 1,  slug: 'start',        path: '/funnel/start',        label: 'Category' },
  { index: 2,  slug: 'procedure',    path: '/funnel/procedure',    label: 'Procedure' },
  { index: 3,  slug: 'goal',         path: '/funnel/goal',         label: 'Goal' },
  { index: 4,  slug: 'priorities',   path: '/funnel/priorities',   label: 'Priorities' },
  { index: 5,  slug: 'age',          path: '/funnel/age',          label: 'About You' },
  { index: 6,  slug: 'journey',      path: '/funnel/journey',      label: 'Journey' },
  { index: 7,  slug: 'stoppers',     path: '/funnel/stoppers',     label: 'Honesty' },
  { index: 8,  slug: 'timeline',     path: '/funnel/timeline',     label: 'Timeline' },
  { index: 9,  slug: 'funding',      path: '/funnel/funding',      label: 'Funding' },
  { index: 10, slug: 'budget',       path: '/funnel/budget',       label: 'Investment' },
  { index: 11, slug: 'location',     path: '/funnel/location',     label: 'Location' },
  { index: 12, slug: 'summary',      path: '/funnel/summary',      label: 'Summary' },
  { index: 13, slug: 'contact',      path: '/funnel/contact',      label: 'Contact' },
  { index: 14, slug: 'verify-code',  path: '/funnel/verify-code',  label: 'Verify' },
  { index: 15, slug: 'confirmation', path: '/funnel/confirmation', label: 'Confirmed' },
] as const

export type StageSlug = typeof STAGES[number]['slug']

export const TOTAL_STAGES = 13 // progress bar shows 1-13; verify + confirmation are post-contact

export function getStageBySlug(slug: string) {
  return STAGES.find((s) => s.slug === slug)
}

export function getNextStage(currentSlug: string) {
  const idx = STAGES.findIndex((s) => s.slug === currentSlug)
  return idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : null
}

export function getPrevStage(currentSlug: string) {
  const idx = STAGES.findIndex((s) => s.slug === currentSlug)
  return idx > 0 ? STAGES[idx - 1] : null
}
