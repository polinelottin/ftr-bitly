-- Convert id column from uuid to text (for UUIDv7 support)
ALTER TABLE "links" ALTER COLUMN "id" TYPE text USING "id"::text;
ALTER TABLE "links" ALTER COLUMN "id" DROP DEFAULT;