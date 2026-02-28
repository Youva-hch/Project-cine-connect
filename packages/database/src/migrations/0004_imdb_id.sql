ALTER TABLE "films" ADD COLUMN IF NOT EXISTS "imdb_id" text;--> statement-breakpoint
ALTER TABLE "films" ADD CONSTRAINT "films_imdb_id_unique" UNIQUE("imdb_id");
