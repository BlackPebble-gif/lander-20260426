import { describe, it, expect } from 'vitest'
import { computeIntentScore, scoreToTier } from './engine'

const BASE: Parameters<typeof computeIntentScore>[0] = {
  journeyStage:     'had_consult',
  timeline:         '3_6_months',
  stoppers:         ['overwhelmed'],
  priorities:       ['fracs', 'surgeon_experience'],
  budget:           16000,
  procedure:        'rhinoplasty',
  travelWillingness:'interstate',
  fundingFlags:     ['none'],
}

describe('computeIntentScore', () => {
  it('returns Gold for a typical qualified lead', () => {
    const result = computeIntentScore(BASE)
    expect(result.tier).toBe('Gold')
    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(result.score).toBeLessThan(80)
  })

  it('returns Platinum for a high-intent lead', () => {
    const result = computeIntentScore({
      ...BASE,
      journeyStage:     'multiple_consults',
      timeline:         'asap',
      stoppers:         ['nothing_ready_now'],
      priorities:       ['fracs', 'surgeon_experience', 'post_op_care'],
      budget:           22000,
      travelWillingness:'anywhere',
    })
    expect(result.tier).toBe('Platinum')
    expect(result.score).toBeGreaterThanOrEqual(80)
  })

  it('returns Reject for low-intent exploring lead', () => {
    const result = computeIntentScore({
      ...BASE,
      journeyStage:     'researching',
      timeline:         'exploring',
      stoppers:         ['cost'],
      priorities:       ['cost_pricing'],
      budget:           5000,
      travelWillingness:'local',
      fundingFlags:     [],
    })
    expect(result.tier).toBe('Reject')
    expect(result.score).toBeLessThan(40)
  })

  it('penalises price-only priorities', () => {
    const withSerious = computeIntentScore({ ...BASE, priorities: ['fracs'] })
    const priceOnly   = computeIntentScore({ ...BASE, priorities: ['cost_pricing', 'payment_plans'] })
    expect(withSerious.breakdown.priorities).toBeGreaterThan(priceOnly.breakdown.priorities)
  })

  it('caps score at 100', () => {
    const result = computeIntentScore({
      ...BASE,
      journeyStage:     'multiple_consults',
      timeline:         'asap',
      stoppers:         ['nothing_ready_now'],
      priorities:       ['fracs', 'surgeon_experience', 'post_op_care'],
      budget:           40000,
      procedure:        'mommy_makeover',
      travelWillingness:'anywhere',
      fundingFlags:     ['none'],
    })
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('floors score at 0', () => {
    const result = computeIntentScore({
      journeyStage:     null,
      timeline:         null,
      stoppers:         [],
      priorities:       [],
      budget:           0,
      procedure:        null,
      travelWillingness:null,
      fundingFlags:     ['super_access'],
    })
    expect(result.score).toBeGreaterThanOrEqual(0)
  })

  it('super_access funding deducts points', () => {
    const withoutSuper = computeIntentScore({ ...BASE, fundingFlags: ['none'] })
    const withSuper    = computeIntentScore({ ...BASE, fundingFlags: ['none', 'super_access'] })
    expect(withSuper.score).toBeLessThan(withoutSuper.score)
  })
})

describe('scoreToTier', () => {
  it('maps 80+ to Platinum', () => expect(scoreToTier(80)).toBe('Platinum'))
  it('maps 60-79 to Gold',   () => expect(scoreToTier(65)).toBe('Gold'))
  it('maps 40-59 to Silver', () => expect(scoreToTier(45)).toBe('Silver'))
  it('maps <40 to Reject',   () => expect(scoreToTier(39)).toBe('Reject'))
  it('maps 0 to Reject',     () => expect(scoreToTier(0)).toBe('Reject'))
})
