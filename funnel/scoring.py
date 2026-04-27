from dataclasses import dataclass
from typing import Optional
from .constants import (
    JOURNEY_SCORES, TIMELINE_SCORES, TRAVEL_SCORES,
    SERIOUS_PRIORITY_SIGNALS, PRICE_PRIORITY_SIGNALS,
    TIER_THRESHOLDS, get_procedure_floor,
)


@dataclass
class ScoreBreakdown:
    journey_stage: int = 0
    timeline:      int = 0
    stoppers:      int = 0
    priorities:    int = 0
    budget:        int = 0
    travel:        int = 0
    funding:       int = 0

    @property
    def total(self) -> int:
        raw = (
            self.journey_stage + self.timeline + self.stoppers
            + self.priorities + self.budget + self.travel + self.funding
        )
        return max(0, min(100, raw))


@dataclass
class ScoredResult:
    score:     int
    tier:      str
    breakdown: ScoreBreakdown


def compute_intent_score(
    journey_stage:      Optional[str],
    timeline:           Optional[str],
    stoppers:           list[str],
    priorities:         list[str],
    budget:             int,
    procedure:          Optional[str],
    travel_willingness: Optional[str],
    funding_flags:      list[str],
) -> ScoredResult:
    bd = ScoreBreakdown()

    bd.journey_stage = JOURNEY_SCORES.get(journey_stage or "", 0)
    bd.timeline = TIMELINE_SCORES.get(timeline or "", 0)

    if "nothing_ready_now" in stoppers:
        bd.stoppers = 20
    elif "overwhelmed" in stoppers or "dont_know_who_to_trust" in stoppers:
        bd.stoppers = 15
    elif "fear_wrong_result" in stoppers:
        bd.stoppers = 12
    elif stoppers == ["cost"]:
        bd.stoppers = 5
    else:
        bd.stoppers = 10

    serious_count = sum(1 for p in priorities if p in SERIOUS_PRIORITY_SIGNALS)
    price_count   = sum(1 for p in priorities if p in PRICE_PRIORITY_SIGNALS)
    bd.priorities = min(serious_count * 5, 15)
    if priorities and price_count == len(priorities):
        bd.priorities -= 5

    floors = get_procedure_floor(procedure)
    if budget >= floors["premium"]:       bd.budget = 10
    elif budget >= floors["standard"]:    bd.budget = 7
    elif budget >= floors["minimum"]:     bd.budget = 3

    bd.travel = TRAVEL_SCORES.get(travel_willingness or "", 0)

    if "none" in funding_flags and budget >= floors["standard"]:
        bd.funding += 5
    if "medically_related" in funding_flags:
        bd.funding += 3
    if "super_access" in funding_flags:
        bd.funding -= 2

    score = bd.total
    return ScoredResult(score=score, tier=score_to_tier(score), breakdown=bd)


def score_to_tier(score: int) -> str:
    if score >= TIER_THRESHOLDS["Platinum"]: return "Platinum"
    if score >= TIER_THRESHOLDS["Gold"]:     return "Gold"
    if score >= TIER_THRESHOLDS["Silver"]:   return "Silver"
    return "Reject"
