-- Better Auth 1.7 identifies an account by `(issuer, accountId)` rather than by
-- `(providerId, accountId)`, so `account` gains a required `issuer` column and a
-- unique index over the pair.
--
-- Written by hand, unlike every other migration here. `prisma migrate dev`
-- emits a single `ADD COLUMN "issuer" TEXT NOT NULL`, which Postgres rejects on
-- a table that already has rows, and no generated migration can know what the
-- value should be. Better Auth's 1.7 upgrade guide asks for this backfill.

-- AlterTable
ALTER TABLE "account" ADD COLUMN "issuer" TEXT;

-- Every row in this table is a password account written by
-- `scripts/create-user.ts`. `local:credential` is the issuer Better Auth's own
-- sign-up route stores for those, and its sign-in route now looks the account up
-- by that issuer together with the user's ID as `accountId` — which is what this
-- script has always written, so the second statement is a guard rather than a
-- change.
UPDATE "account" SET "issuer" = 'local:credential' WHERE "providerId" = 'credential';
UPDATE "account" SET "accountId" = "userId" WHERE "providerId" = 'credential' AND "accountId" <> "userId";

-- Anything that is not a password account needs the real issuer of whoever
-- vouches for it, and only whoever added it knows what that is. Stop with a
-- readable error instead of filling a required column with a guess.
DO $$
DECLARE
  remaining TEXT;
BEGIN
  SELECT string_agg(DISTINCT "providerId", ', ') INTO remaining FROM "account" WHERE "issuer" IS NULL;

  IF remaining IS NOT NULL THEN
    RAISE EXCEPTION 'account rows have no issuer for provider(s): %. Set one before applying this migration.', remaining;
  END IF;
END $$;

ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account"("issuer", "accountId");
