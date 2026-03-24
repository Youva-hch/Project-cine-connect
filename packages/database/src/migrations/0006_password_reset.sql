ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "password_reset_token_hash" text,
  ADD COLUMN IF NOT EXISTS "password_reset_token_expires_at" timestamp;

CREATE INDEX IF NOT EXISTS "users_password_reset_token_hash_idx"
  ON "users" ("password_reset_token_hash");
