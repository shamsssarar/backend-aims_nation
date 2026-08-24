-- Migration: add cloudinaryPublicId to StudyMaterial
-- Generated: 2026-08-22T16:54:00+06:00

BEGIN;

-- Add nullable column to store Cloudinary public_id for asset deletion
ALTER TABLE "StudyMaterial"
ADD COLUMN "cloudinaryPublicId" text;

COMMIT;
