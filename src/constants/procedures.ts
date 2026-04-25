export type ProcedureCategory = 'breast' | 'face' | 'body' | 'unsure'

export interface Procedure {
  id: string
  name: string
  alsoKnownAs?: string
  description: string
  category: ProcedureCategory
  popular?: boolean
  safetyNote?: string
}

export const PROCEDURES: Procedure[] = [
  // Breast
  { id: 'breast_aug',         name: 'Breast Augmentation',             alsoKnownAs: 'Boob job, implants',              description: 'Increase breast size and improve shape using implants or fat transfer.',                              category: 'breast' },
  { id: 'breast_lift',        name: 'Breast Lift',                     alsoKnownAs: 'Mastopexy',                       description: 'Raise and reshape sagging breasts without changing size.',                                        category: 'breast' },
  { id: 'breast_reduction',   name: 'Breast Reduction',                alsoKnownAs: 'Reduction mammoplasty',           description: 'Reduce breast size to relieve discomfort and improve proportion.',                                category: 'breast' },
  { id: 'breast_combo',       name: 'Augmentation + Lift',             alsoKnownAs: 'Augmentation mastopexy',          description: 'Combine implants with a lift for volume and shape.',                                             category: 'breast', popular: true },
  { id: 'implant_revision',   name: 'Implant Revision',                alsoKnownAs: 'Implant replacement, removal',    description: 'Replace, remove, or correct existing breast implants.',                                          category: 'breast' },

  // Face
  { id: 'rhinoplasty',        name: 'Rhinoplasty',                     alsoKnownAs: 'Nose job, nose reshaping',        description: 'Reshape the nose for aesthetic or functional improvement.',                                       category: 'face' },
  { id: 'blepharoplasty',     name: 'Blepharoplasty',                  alsoKnownAs: 'Eyelid surgery',                  description: 'Remove excess skin and fat from upper and/or lower eyelids.',                                     category: 'face' },
  { id: 'brow_lift',          name: 'Brow Lift',                       alsoKnownAs: 'Forehead lift',                   description: 'Raise a sagging brow and smooth forehead lines.',                                                category: 'face' },
  { id: 'facelift',           name: 'Facelift / Neck Lift',            alsoKnownAs: 'Rhytidectomy',                    description: 'Tighten loose skin and deep tissues of the face and neck.',                                      category: 'face' },
  { id: 'fat_transfer_face',  name: 'Fat Transfer',                    alsoKnownAs: 'Fat grafting, lipofilling',       description: 'Use your own fat to restore volume and youthfulness to the face.',                                category: 'face' },
  { id: 'ear_reshaping',      name: 'Ear Reshaping',                   alsoKnownAs: 'Otoplasty, ear pinning',          description: 'Correct prominent, asymmetric, or misshapen ears.',                                              category: 'face' },
  { id: 'chin_jaw',           name: 'Chin / Jaw Contouring',           alsoKnownAs: 'Genioplasty, jaw reduction',      description: 'Enhance chin projection or refine the jawline.',                                                 category: 'face' },

  // Body
  { id: 'tummy_tuck',         name: 'Abdominoplasty',                  alsoKnownAs: 'Tummy tuck',                      description: 'Remove excess skin and tighten the abdominal muscles.',                                          category: 'body' },
  { id: 'liposuction',        name: 'Liposuction',                     alsoKnownAs: 'Lipo, fat removal',               description: 'Remove stubborn fat deposits from targeted areas.',                                              category: 'body' },
  { id: 'body_contouring',    name: 'Body Contouring',                 alsoKnownAs: 'Body sculpting',                  description: 'Reshape and refine the body silhouette, often combining procedures.',                            category: 'body' },
  { id: 'arm_lift',           name: 'Arm Lift',                        alsoKnownAs: 'Brachioplasty',                   description: 'Remove excess skin and fat from the upper arms.',                                                category: 'body' },
  { id: 'thigh_lift',         name: 'Thigh Lift',                      alsoKnownAs: 'Thighplasty',                     description: 'Tighten and reshape the inner or outer thighs.',                                                 category: 'body' },
  { id: 'bbl',                name: 'Brazilian Butt Lift',             alsoKnownAs: 'BBL, buttock augmentation',       description: 'Transfer fat to the buttocks for fullness and shape.',                                          category: 'body',
    safetyNote: 'BBL has specific safety requirements. We only work with surgeons who follow current best-practice guidelines.' },
  { id: 'post_weight_loss',   name: 'Post-Weight Loss Surgery',        alsoKnownAs: 'Body lift, loose skin removal',   description: 'Remove excess skin after significant weight loss.',                                              category: 'body' },
  { id: 'gynaecomastia',      name: 'Gynaecomastia',                   alsoKnownAs: 'Male breast reduction',           description: 'Reduce enlarged male breast tissue.',                                                           category: 'body' },
  { id: 'mommy_makeover',     name: 'Post-Pregnancy Body Restoration', alsoKnownAs: 'Mummy makeover',                  description: 'Restore the body after pregnancy and breastfeeding — typically combines tummy tuck and breast work.', category: 'body', popular: true },
]

export const PROCEDURE_FLOORS: Record<string, { minimum: number; standard: number; premium: number }> = {
  rhinoplasty:        { minimum: 12000, standard: 16000, premium: 22000 },
  breast_aug:         { minimum: 10000, standard: 14000, premium: 18000 },
  breast_combo:       { minimum: 10000, standard: 14000, premium: 18000 },
  facelift:           { minimum: 18000, standard: 25000, premium: 35000 },
  tummy_tuck:         { minimum: 14000, standard: 18000, premium: 25000 },
  bbl:                { minimum: 12000, standard: 16000, premium: 22000 },
  mommy_makeover:     { minimum: 22000, standard: 30000, premium: 40000 },
  liposuction:        { minimum:  6000, standard: 10000, premium: 15000 },
  blepharoplasty:     { minimum:  5000, standard:  8000, premium: 12000 },
  _default:           { minimum:  8000, standard: 12000, premium: 18000 },
}

export function getProcedureFloor(procedureId: string | null) {
  return PROCEDURE_FLOORS[procedureId ?? ''] ?? PROCEDURE_FLOORS['_default']
}
