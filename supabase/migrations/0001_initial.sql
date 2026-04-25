-- Surgeons must exist before leads reference them
create table surgeons (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz default now(),
  clinic_name           text not null,
  surgeon_name          text not null,
  exclusivity_postcodes jsonb default '[]',
  procedures            jsonb default '[]',
  accepting_leads       boolean default true,
  crm_webhook_url       text,
  ppl_rate_platinum     integer default 0,
  ppl_rate_gold         integer default 0,
  ppl_rate_silver       integer default 0
);

create table leads (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz default now(),

  -- Funnel data
  category              text,
  procedure             text,
  specific_goal         text,
  priorities            jsonb default '[]',
  age_bracket           text,
  journey_stage         text,
  surgeon_in_mind       jsonb,
  stoppers              jsonb default '[]',
  funding_flags         jsonb default '[]',
  timeline              text,
  budget                integer default 0,
  location              text,
  travel_willingness    text,

  -- Contact
  first_name            text,
  email                 text,
  phone                 text,

  -- Verification
  sms_code_verified     boolean default false,
  sms_response_confirmed boolean default false,
  sms_response_at       timestamptz,

  -- Scoring
  intent_score          integer,
  tier                  text check (tier in ('Platinum', 'Gold', 'Silver', 'Reject')),
  fraud_flags           jsonb default '[]',

  -- Delivery
  matched_surgeon_id    uuid references surgeons(id),
  delivered_at          timestamptz,
  surgeon_paid          boolean default false,
  ppl_amount            integer,

  -- Replacement tracking
  replacement_requested boolean default false,
  replacement_reason    text,
  refunded              boolean default false
);

create table nurture_contacts (
  id                uuid primary key default gen_random_uuid(),
  email             text unique not null,
  source_stage      text,
  procedure_interest text,
  created_at        timestamptz default now()
);

-- Tracks unrecognised SMS replies for rate-limiting
create table sms_attempts (
  id        uuid primary key default gen_random_uuid(),
  lead_id   uuid references leads(id) on delete cascade,
  body      text,
  created_at timestamptz default now()
);

-- Indexes
create index leads_phone_idx        on leads(phone);
create index leads_tier_idx         on leads(tier);
create index leads_created_at_idx   on leads(created_at desc);
create index leads_delivered_idx    on leads(delivered_at) where delivered_at is not null;
create index sms_attempts_lead_idx  on sms_attempts(lead_id);
