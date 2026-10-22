-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "categoryEn" TEXT,
ADD COLUMN     "nameEn" TEXT;

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "titleEn" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "titleEn" TEXT;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "locationEn" TEXT,
ADD COLUMN     "roleEn" TEXT;

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "degreeEn" TEXT;

