-- Remote migration: 20261024145031 explicit_public_data_api_opt_in_20261024
-- Applied and verified on 2026-10-24 to project ibloovohuhrceivrvhvn.
--
-- Prepare for the Supabase 2026-10-30 change. Opt in to *future*
-- public tables/sequences requiring explicit Data API privileges.
-- Existing table/sequence privileges and RLS policies remain unchanged.
-- New public tables that need client or server Data API access must
-- include explicit minimal GRANTs next to their RLS policies.

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES
  FROM anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE USAGE, SELECT ON SEQUENCES
  FROM anon, authenticated, service_role;

-- Deliberately does not blanket-GRANT existing tables, and does not
-- change EXECUTE default privileges of functions or change RLS.
