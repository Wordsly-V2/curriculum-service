-- CreateTable
CREATE TABLE "published_items" (
    "release_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,

    CONSTRAINT "published_items_pkey" PRIMARY KEY ("release_id","item_id")
);

-- CreateTable
CREATE TABLE "published_checkpoints" (
    "release_id" UUID NOT NULL,
    "checkpoint_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "published_checkpoints_pkey" PRIMARY KEY ("release_id","checkpoint_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "published_checkpoints_release_id_unit_id_key" ON "published_checkpoints"("release_id", "unit_id");

-- AddForeignKey
ALTER TABLE "published_items" ADD CONSTRAINT "published_items_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "published_checkpoints" ADD CONSTRAINT "published_checkpoints_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

