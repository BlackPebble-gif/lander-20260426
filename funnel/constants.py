from dataclasses import dataclass, field
from typing import Optional


# ── Procedures ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Procedure:
    id: str
    name: str
    category: str          # breast | face | body | unsure
    description: str
    also_known_as: str = ""
    popular: bool = False
    safety_note: str = ""


PROCEDURES: list[Procedure] = [
    # Breast
    Procedure("breast_aug",       "Breast Augmentation",             "breast", "Increase breast size and improve shape using implants or fat transfer.",                              "Boob job, implants"),
    Procedure("breast_lift",      "Breast Lift",                     "breast", "Raise and reshape sagging breasts without changing size.",                                            "Mastopexy"),
    Procedure("breast_reduction", "Breast Reduction",                "breast", "Reduce breast size to relieve discomfort and improve proportion.",                                    "Reduction mammoplasty"),
    Procedure("breast_combo",     "Augmentation + Lift",             "breast", "Combine implants with a lift for volume and shape.",                                                  "Augmentation mastopexy",      popular=True),
    Procedure("implant_revision", "Implant Revision",                "breast", "Replace, remove, or correct existing breast implants.",                                               "Implant replacement, removal"),
    # Face
    Procedure("rhinoplasty",      "Rhinoplasty",                     "face",   "Reshape the nose for aesthetic or functional improvement.",                                            "Nose job, nose reshaping"),
    Procedure("blepharoplasty",   "Blepharoplasty",                  "face",   "Remove excess skin and fat from upper and/or lower eyelids.",                                         "Eyelid surgery"),
    Procedure("brow_lift",        "Brow Lift",                       "face",   "Raise a sagging brow and smooth forehead lines.",                                                      "Forehead lift"),
    Procedure("facelift",         "Facelift / Neck Lift",            "face",   "Tighten loose skin and deep tissues of the face and neck.",                                           "Rhytidectomy"),
    Procedure("fat_transfer_face","Fat Transfer",                    "face",   "Use your own fat to restore volume and youthfulness to the face.",                                    "Fat grafting, lipofilling"),
    Procedure("ear_reshaping",    "Ear Reshaping",                   "face",   "Correct prominent, asymmetric, or misshapen ears.",                                                    "Otoplasty, ear pinning"),
    Procedure("chin_jaw",         "Chin / Jaw Contouring",           "face",   "Enhance chin projection or refine the jawline.",                                                       "Genioplasty, jaw reduction"),
    # Body
    Procedure("tummy_tuck",       "Abdominoplasty",                  "body",   "Remove excess skin and tighten the abdominal muscles.",                                               "Tummy tuck"),
    Procedure("liposuction",      "Liposuction",                     "body",   "Remove stubborn fat deposits from targeted areas.",                                                    "Lipo, fat removal"),
    Procedure("body_contouring",  "Body Contouring",                 "body",   "Reshape and refine the body silhouette.",                                                              "Body sculpting"),
    Procedure("arm_lift",         "Arm Lift",                        "body",   "Remove excess skin and fat from the upper arms.",                                                      "Brachioplasty"),
    Procedure("thigh_lift",       "Thigh Lift",                      "body",   "Tighten and reshape the inner or outer thighs.",                                                       "Thighplasty"),
    Procedure("bbl",              "Brazilian Butt Lift",             "body",   "Transfer fat to the buttocks for fullness and shape.",                                                 "BBL, buttock augmentation",
              safety_note="Safety first. BBL has specific safety requirements. We only work with surgeons who follow current best-practice guidelines."),
    Procedure("post_weight_loss", "Post-Weight Loss Surgery",        "body",   "Remove excess skin after significant weight loss.",                                                    "Body lift, loose skin removal"),
    Procedure("gynaecomastia",    "Gynaecomastia",                   "body",   "Reduce enlarged male breast tissue.",                                                                  "Male breast reduction"),
    Procedure("mommy_makeover",   "Post-Pregnancy Body Restoration", "body",   "Restore the body after pregnancy — typically combines tummy tuck and breast work.",                   "Mummy makeover",              popular=True),
]

PROCEDURE_BY_ID: dict[str, Procedure] = {p.id: p for p in PROCEDURES}


# ── Budget floors ─────────────────────────────────────────────────────────────────────────────

PROCEDURE_FLOORS: dict[str, dict[str, int]] = {
    "rhinoplasty":      {"minimum": 12000, "standard": 16000, "premium": 22000},
    "breast_aug":       {"minimum": 10000, "standard": 14000, "premium": 18000},
    "breast_combo":     {"minimum": 10000, "standard": 14000, "premium": 18000},
    "facelift":         {"minimum": 18000, "standard": 25000, "premium": 35000},
    "tummy_tuck":       {"minimum": 14000, "standard": 18000, "premium": 25000},
    "bbl":              {"minimum": 12000, "standard": 16000, "premium": 22000},
    "mommy_makeover":   {"minimum": 22000, "standard": 30000, "premium": 40000},
    "liposuction":      {"minimum":  6000, "standard": 10000, "premium": 15000},
    "blepharoplasty":   {"minimum":  5000, "standard":  8000, "premium": 12000},
    "_default":         {"minimum":  8000, "standard": 12000, "premium": 18000},
}

def get_procedure_floor(procedure_id: Optional[str]) -> dict[str, int]:
    return PROCEDURE_FLOORS.get(procedure_id or "", PROCEDURE_FLOORS["_default"])


# ── Scoring weights ─────────────────────────────────────────────────────────────────────────────

JOURNEY_SCORES: dict[str, int] = {
    "multiple_consults": 25,
    "had_consult":       22,
    "have_surgeon":      18,
    "researching":       10,
}

TIMELINE_SCORES: dict[str, int] = {
    "asap":         20,
    "3_6_months":   15,
    "6_12_months":   8,
    "exploring":     0,
}

TRAVEL_SCORES: dict[str, int] = {
    "anywhere":   5,
    "interstate": 4,
    "local":      2,
    "overseas":   1,
}

SERIOUS_PRIORITY_SIGNALS = {"fracs", "surgeon_experience", "post_op_care"}
PRICE_PRIORITY_SIGNALS   = {"cost_pricing", "payment_plans"}

TIER_THRESHOLDS = {"Platinum": 80, "Gold": 60, "Silver": 40}


# ── Goals per procedure ──────────────────────────────────────────────────────────────────────────────

GOALS_BY_PROCEDURE: dict[str, list[str]] = {
    "breast_aug":       ["Natural-looking fullness", "Significant size increase", "Restore volume after pregnancy or weight loss", "Improve asymmetry"],
    "breast_lift":      ["Lift and firm sagging breasts", "Improve shape and position", "Restore shape after pregnancy"],
    "breast_reduction": ["Relieve back, neck or shoulder pain", "Improve body proportion", "Improve clothing fit"],
    "rhinoplasty":      ["Refine or reshape the tip", "Reduce overall size", "Correct a bump or hump", "Improve breathing (functional)", "Improve asymmetry"],
    "facelift":         ["Tighten jowls and lower face", "Improve neck laxity", "Comprehensive facial rejuvenation"],
    "tummy_tuck":       ["Remove excess skin after weight loss", "Restore abdomen after pregnancy", "Tighten separated abdominal muscles"],
    "bbl":              ["Add volume and projection", "Improve overall shape and contour", "Correct asymmetry"],
    "liposuction":      ["Remove stubborn fat deposits", "Overall body contouring", "Target a specific area (abdomen, flanks, thighs)"],
    "_default":         ["Aesthetic improvement", "Functional improvement", "Boost confidence and self-image", "Restore appearance after life changes"],
}

def get_goals(procedure_id: Optional[str]) -> list[str]:
    return GOALS_BY_PROCEDURE.get(procedure_id or "", GOALS_BY_PROCEDURE["_default"])


# ── Australian locations ──────────────────────────────────────────────────────────────────────────────

AU_LOCATIONS = [
    "Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD", "Perth, WA",
    "Adelaide, SA", "Canberra, ACT", "Hobart, TAS", "Darwin, NT",
    "Gold Coast, QLD", "Newcastle, NSW", "Regional / Rural",
]

TOTAL_STAGES = 13
