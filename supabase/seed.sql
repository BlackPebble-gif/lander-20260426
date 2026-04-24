-- Seed a test surgeon for development
insert into surgeons (clinic_name, surgeon_name, exclusivity_postcodes, procedures, crm_webhook_url, ppl_rate_platinum, ppl_rate_gold, ppl_rate_silver)
values (
  'Sydney Cosmetic Specialists',
  'Dr Jane Smith',
  '["Sydney, NSW", "2000", "2010", "2011"]',
  '["rhinoplasty", "breast_aug", "breast_lift", "breast_combo", "blepharoplasty", "facelift"]',
  'https://example.com/crm-webhook',
  800,
  500,
  300
);
