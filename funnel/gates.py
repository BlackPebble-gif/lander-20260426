from typing import Optional
from .constants import get_procedure_floor


def evaluate_timeline_gate(timeline: Optional[str]) -> Optional[str]:
    """Returns redirect destination or None if pass."""
    if timeline == "exploring":
        return "nurture"
    return None


def evaluate_budget_gate(
    budget: int,
    procedure: Optional[str],
    priorities: list[str],
) -> Optional[str]:
    floors = get_procedure_floor(procedure)
    has_payment_plan = "payment_plans" in priorities
    if budget < floors["minimum"] and not has_payment_plan:
        return "finance"
    return None


def evaluate_location_gate(
    travel_willingness: Optional[str],
    has_surgeon_in_zone: bool = True,
) -> Optional[str]:
    if not has_surgeon_in_zone and travel_willingness == "local":
        return "waitlist"
    return None
