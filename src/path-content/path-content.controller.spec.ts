import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { contentId } from '@/content/content-id';
import { ItemIdsDto, MAX_ITEM_IDS } from './dto/path-items.dto';
import { PathContentController } from './path-content.controller';

const ITEM = contentId('item', 'hello');

function setup(release: { id: string; version: number } | null) {
    const releases = { activeRelease: jest.fn(() => Promise.resolve(release)) };
    const published = {
        tree: jest.fn(() =>
            Promise.resolve({ snapshotVersion: 1, stages: [] }),
        ),
        filterPublished: jest.fn((_r: string, ids: string[]) =>
            Promise.resolve(ids.slice(0, 1)),
        ),
        hydrate: jest.fn(() => Promise.resolve([{ id: ITEM }])),
    };
    return {
        controller: new PathContentController(
            releases as never,
            published as never,
        ),
        published,
    };
}

describe('PathContentController', () => {
    it('serves the active tree, or 404 before the first publish', async () => {
        await expect(
            setup({ id: 'r1', version: 1 }).controller.tree(),
        ).resolves.toMatchObject({ stages: [] });
        await expect(setup(null).controller.tree()).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it('filters ids against the active release', async () => {
        const { controller, published } = setup({ id: 'r1', version: 1 });
        await expect(
            controller.filterPublished({ itemIds: [ITEM, 'x'] }),
        ).resolves.toEqual({ itemIds: [ITEM] });
        expect(published.filterPublished).toHaveBeenCalledWith('r1', [
            ITEM,
            'x',
        ]);
    });

    it('publishes nothing before the first release', async () => {
        const { controller, published } = setup(null);
        await expect(
            controller.filterPublished({ itemIds: [ITEM] }),
        ).resolves.toEqual({ itemIds: [] });
        await expect(controller.hydrate({ itemIds: [ITEM] })).resolves.toEqual(
            [],
        );
        expect(published.filterPublished).not.toHaveBeenCalled();
    });
});

describe('ItemIdsDto', () => {
    const errors = (itemIds: unknown) =>
        validateSync(plainToInstance(ItemIdsDto, { itemIds }));

    it('accepts content ids (uuid v5)', () => {
        expect(errors([ITEM])).toEqual([]);
    });

    it('rejects non-uuids and oversized lists', () => {
        expect(errors(['nope'])).not.toEqual([]);
        expect(
            errors(Array.from({ length: MAX_ITEM_IDS + 1 }, () => ITEM)),
        ).not.toEqual([]);
    });
});
