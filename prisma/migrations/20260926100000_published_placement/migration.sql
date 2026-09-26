-- CreateTable
CREATE TABLE "published_placements" (
    "release_id" UUID NOT NULL,
    "placement_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "published_placements_pkey" PRIMARY KEY ("release_id")
);

-- AddForeignKey
ALTER TABLE "published_placements" ADD CONSTRAINT "published_placements_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

