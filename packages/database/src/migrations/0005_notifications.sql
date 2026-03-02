CREATE TABLE IF NOT EXISTS "notifications" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "type" text NOT NULL,
  "related_user_id" integer,
  "message" text NOT NULL,
  "is_read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_user_id_users_id_fk"
  FOREIGN KEY ("related_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
