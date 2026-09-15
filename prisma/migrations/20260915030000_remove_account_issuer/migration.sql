-- Reverts `20260824020624_add_account_issuer`.
--
-- Better Auth 1.7.3 undid the `issuer` column it asked for in 1.7.0: an account
-- is identified by `(providerId, accountId)` again, and the 1.7 upgrade guide
-- now says to drop the unique index and the column before upgrading. Left in
-- place, `issuer` is a NOT NULL column that nothing writes any more, so the
-- first sign-up or linked account would fail on it.
--
-- The other half of that migration stays: it also set `accountId` to the user's
-- own ID for password accounts, which is still what Better Auth's sign-up route
-- and `scripts/create-user.ts` write.

-- DropIndex
DROP INDEX "account_issuer_accountId_uidx";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "issuer";
