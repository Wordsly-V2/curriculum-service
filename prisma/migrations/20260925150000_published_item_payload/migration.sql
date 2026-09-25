-- Store each published item's view, so /path/items/hydrate reads it directly.
ALTER TABLE "published_items" ADD COLUMN "payload" JSONB;

-- Backfill releases published before this column: every published item is
-- linked to at least one lesson, whose snapshot carries its view plus `role`.
UPDATE "published_items" AS pi
SET "payload" = src.item - 'role'
FROM (
    SELECT DISTINCT ON (pl."release_id", item->>'id')
        pl."release_id", item
    FROM "published_lessons" AS pl,
        jsonb_array_elements(pl."payload"->'items') AS item
) AS src
WHERE src."release_id" = pi."release_id"
    AND src.item->>'id' = pi."item_id"::text;

ALTER TABLE "published_items" ALTER COLUMN "payload" SET NOT NULL;
