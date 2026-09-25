-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "stages" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "cefr" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "description_vi" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content_hash" TEXT NOT NULL,
    "seed_hash" TEXT,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "stage_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "description_vi" TEXT,
    "can_do" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content_hash" TEXT NOT NULL,
    "seed_hash" TEXT,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "unit_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "estimated_minutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content_hash" TEXT NOT NULL,
    "seed_hash" TEXT,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_steps" (
    "id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "lesson_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learn_items" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "unit_id" UUID,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "meaning_vi" TEXT NOT NULL,
    "ipa" TEXT,
    "audio_url" TEXT,
    "examples" JSONB NOT NULL DEFAULT '[]',
    "pattern" JSONB,
    "grammar" JSONB,
    "collocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note_vi" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content_hash" TEXT NOT NULL,
    "seed_hash" TEXT,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "learn_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_items" (
    "lesson_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "lesson_items_pkey" PRIMARY KEY ("lesson_id","item_id")
);

-- CreateTable
CREATE TABLE "dialogues" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "unit_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "situation_vi" TEXT NOT NULL,
    "lines" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content_hash" TEXT NOT NULL,
    "seed_hash" TEXT,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "dialogues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkpoints" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "unit_id" UUID NOT NULL,
    "pass_percent" INTEGER NOT NULL,
    "questions" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content_hash" TEXT NOT NULL,
    "seed_hash" TEXT,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_tests" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content_hash" TEXT NOT NULL,
    "seed_hash" TEXT,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "placement_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releases" (
    "id" UUID NOT NULL,
    "version" SERIAL NOT NULL,
    "note" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "published_trees" (
    "release_id" UUID NOT NULL,
    "tree" JSONB NOT NULL,

    CONSTRAINT "published_trees_pkey" PRIMARY KEY ("release_id")
);

-- CreateTable
CREATE TABLE "published_lessons" (
    "release_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "published_lessons_pkey" PRIMARY KEY ("release_id","lesson_id")
);

-- CreateTable
CREATE TABLE "path_state" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "active_release_id" UUID,
    "updated_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "path_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "user_login_id" UUID NOT NULL,
    "start_unit_id" UUID,
    "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("user_login_id")
);

-- CreateTable
CREATE TABLE "lesson_completions" (
    "id" UUID NOT NULL,
    "user_login_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "release_id" UUID,
    "times_completed" INTEGER NOT NULL DEFAULT 1,
    "best_score" INTEGER,
    "last_client_request_id" TEXT,
    "first_completed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_completed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkpoint_attempts" (
    "id" UUID NOT NULL,
    "user_login_id" UUID NOT NULL,
    "checkpoint_id" UUID NOT NULL,
    "release_id" UUID,
    "client_request_id" TEXT NOT NULL,
    "score_percent" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkpoint_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_results" (
    "id" UUID NOT NULL,
    "user_login_id" UUID NOT NULL,
    "placement_test_id" UUID NOT NULL,
    "release_id" UUID,
    "client_request_id" TEXT NOT NULL,
    "score_percent" INTEGER NOT NULL,
    "placed_unit_id" UUID,
    "skipped_unit_ids" UUID[],
    "answers" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stages_slug_key" ON "stages"("slug");

-- CreateIndex
CREATE INDEX "stages_order_idx" ON "stages"("order");

-- CreateIndex
CREATE UNIQUE INDEX "units_slug_key" ON "units"("slug");

-- CreateIndex
CREATE INDEX "units_stage_id_order_idx" ON "units"("stage_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- CreateIndex
CREATE INDEX "lessons_unit_id_order_idx" ON "lessons"("unit_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_steps_lesson_id_order_key" ON "lesson_steps"("lesson_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "learn_items_slug_key" ON "learn_items"("slug");

-- CreateIndex
CREATE INDEX "learn_items_unit_id_idx" ON "learn_items"("unit_id");

-- CreateIndex
CREATE INDEX "learn_items_status_idx" ON "learn_items"("status");

-- CreateIndex
CREATE INDEX "lesson_items_item_id_idx" ON "lesson_items"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "dialogues_slug_key" ON "dialogues"("slug");

-- CreateIndex
CREATE INDEX "dialogues_unit_id_idx" ON "dialogues"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoints_slug_key" ON "checkpoints"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoints_unit_id_key" ON "checkpoints"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "placement_tests_slug_key" ON "placement_tests"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "releases_version_key" ON "releases"("version");

-- CreateIndex
CREATE INDEX "published_lessons_release_id_unit_id_idx" ON "published_lessons"("release_id", "unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_completions_user_login_id_lesson_id_key" ON "lesson_completions"("user_login_id", "lesson_id");

-- CreateIndex
CREATE INDEX "checkpoint_attempts_user_login_id_checkpoint_id_passed_idx" ON "checkpoint_attempts"("user_login_id", "checkpoint_id", "passed");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoint_attempts_user_login_id_client_request_id_key" ON "checkpoint_attempts"("user_login_id", "client_request_id");

-- CreateIndex
CREATE INDEX "placement_results_user_login_id_created_at_idx" ON "placement_results"("user_login_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "placement_results_user_login_id_client_request_id_key" ON "placement_results"("user_login_id", "client_request_id");

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_steps" ADD CONSTRAINT "lesson_steps_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learn_items" ADD CONSTRAINT "learn_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_items" ADD CONSTRAINT "lesson_items_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_items" ADD CONSTRAINT "lesson_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "learn_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoints" ADD CONSTRAINT "checkpoints_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "published_trees" ADD CONSTRAINT "published_trees_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "published_lessons" ADD CONSTRAINT "published_lessons_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoint_attempts" ADD CONSTRAINT "checkpoint_attempts_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_results" ADD CONSTRAINT "placement_results_placement_test_id_fkey" FOREIGN KEY ("placement_test_id") REFERENCES "placement_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

