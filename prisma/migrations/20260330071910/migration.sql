/*
  Warnings:

  - The values [NEEDS_ATTENTION] on the enum `BehaviorStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BehaviorStatus_new" AS ENUM ('EXCEPTIONAL', 'NORMAL', 'NEEDS_IMPROVEMENT');
ALTER TABLE "public"."WeeklyReport" ALTER COLUMN "behaviorStatus" DROP DEFAULT;
ALTER TABLE "WeeklyReport" ALTER COLUMN "behaviorStatus" TYPE "BehaviorStatus_new" USING ("behaviorStatus"::text::"BehaviorStatus_new");
ALTER TYPE "BehaviorStatus" RENAME TO "BehaviorStatus_old";
ALTER TYPE "BehaviorStatus_new" RENAME TO "BehaviorStatus";
DROP TYPE "public"."BehaviorStatus_old";
ALTER TABLE "WeeklyReport" ALTER COLUMN "behaviorStatus" SET DEFAULT 'NORMAL';
COMMIT;
