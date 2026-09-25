import type {
    ContentCorpus,
    ItemSeed,
    LessonSeed,
    Question,
    UnitFile,
} from './content.schema';

/**
 * Rules across records that zod cannot see from one file. Returns one message
 * per problem (empty = valid), each prefixed with where it is.
 *
 * - slugs are unique per kind across the whole corpus
 * - a unit's stage exists, and unit order is unique within a stage
 * - every item is defined in exactly one unit and introduced by exactly one
 *   lesson of that unit; a RECYCLE comes after the lesson that introduced it
 * - steps only use items linked to their lesson, and dialogues of their unit
 * - questions reference existing items
 */
export function checkContentRefs(corpus: ContentCorpus): string[] {
    const errors: string[] = [];
    const stageOrder = new Map(corpus.stages.map((s) => [s.slug, s.order]));

    reportDuplicates(
        errors,
        'stage',
        corpus.stages.map((s) => s.slug),
    );
    reportDuplicates(
        errors,
        'unit',
        corpus.units.map((u) => u.slug),
    );
    reportDuplicates(
        errors,
        'lesson',
        corpus.units.flatMap((u) => u.lessons.map((l) => l.slug)),
    );
    reportDuplicates(
        errors,
        'item',
        corpus.units.flatMap((u) => u.items.map((i) => i.slug)),
    );
    reportDuplicates(
        errors,
        'dialogue',
        corpus.units.flatMap((u) => u.dialogues.map((d) => d.slug)),
    );
    reportDuplicates(
        errors,
        'checkpoint',
        corpus.units.flatMap((u) => (u.checkpoint ? [u.checkpoint.slug] : [])),
    );

    const unitPositions = new Map<string, string>();
    for (const unit of corpus.units) {
        if (!stageOrder.has(unit.stage)) {
            errors.push(`unit ${unit.slug}: unknown stage ${unit.stage}`);
        }
        const key = `${unit.stage}#${unit.order}`;
        const other = unitPositions.get(key);
        if (other) {
            errors.push(
                `unit ${unit.slug}: order ${unit.order} already used by ${other}`,
            );
        }
        unitPositions.set(key, unit.slug);
    }

    const items = new Map<string, ItemSeed>();
    for (const unit of corpus.units) {
        for (const item of unit.items) items.set(item.slug, item);
    }

    // Lessons in learning order, so "introduced before" is a position compare.
    const ordered = [...corpus.units]
        .sort(
            (a, b) =>
                (stageOrder.get(a.stage) ?? 0) -
                    (stageOrder.get(b.stage) ?? 0) || a.order - b.order,
        )
        .flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })));

    const introducedAt = new Map<string, number>();
    ordered.forEach(({ unit, lesson }, position) => {
        for (const link of lesson.items) {
            if (link.role !== 'INTRODUCE') continue;
            const where = `lesson ${lesson.slug}`;
            if (introducedAt.has(link.item)) {
                errors.push(`${where}: item ${link.item} is introduced twice`);
            } else if (!unit.items.some((i) => i.slug === link.item)) {
                errors.push(
                    `${where}: introduces ${link.item}, which unit ${unit.slug} does not define`,
                );
            }
            introducedAt.set(link.item, position);
        }
    });

    for (const unit of corpus.units) {
        for (const item of unit.items) {
            if (!introducedAt.has(item.slug)) {
                errors.push(
                    `unit ${unit.slug}: item ${item.slug} is never introduced`,
                );
            }
        }
    }

    ordered.forEach(({ unit, lesson }, position) => {
        const where = `lesson ${lesson.slug}`;
        const linked = new Set<string>();
        for (const link of lesson.items) {
            if (linked.has(link.item)) {
                errors.push(`${where}: item ${link.item} is linked twice`);
            }
            linked.add(link.item);
            if (!items.has(link.item)) {
                errors.push(`${where}: unknown item ${link.item}`);
                continue;
            }
            const introduced = introducedAt.get(link.item);
            if (
                link.role === 'RECYCLE' &&
                (introduced === undefined || introduced >= position)
            ) {
                errors.push(
                    `${where}: recycles ${link.item} before it is introduced`,
                );
            }
        }
        checkSteps(errors, unit, lesson, linked, items);
    });

    for (const unit of corpus.units) {
        if (unit.checkpoint) {
            checkQuestions(
                errors,
                `checkpoint ${unit.checkpoint.slug}`,
                unit.checkpoint.questions,
                items,
            );
        }
    }

    return errors;
}

function checkSteps(
    errors: string[],
    unit: UnitFile,
    lesson: LessonSeed,
    linked: Set<string>,
    items: Map<string, ItemSeed>,
): void {
    const introduced = new Set(
        lesson.items.filter((l) => l.role === 'INTRODUCE').map((l) => l.item),
    );

    lesson.steps.forEach((step, index) => {
        const where = `lesson ${lesson.slug} step ${index} (${step.type})`;
        const requireIn = (
            slugs: string[] | undefined,
            allowed: Set<string>,
            what: string,
        ) => {
            for (const slug of slugs ?? []) {
                if (!allowed.has(slug)) {
                    errors.push(`${where}: item ${slug} is not ${what}`);
                }
            }
        };
        const requireLinked = (slugs: string[] | undefined) =>
            requireIn(slugs, linked, 'linked to the lesson');

        switch (step.type) {
            case 'INTRO':
                requireIn(
                    step.payload.items,
                    introduced,
                    'introduced by the lesson',
                );
                break;
            case 'EXPLAIN':
            case 'PRACTICE':
                requireLinked(step.payload.items);
                break;
            case 'PATTERN_DRILL': {
                const pattern = items.get(step.payload.pattern);
                requireLinked([step.payload.pattern]);
                if (pattern && pattern.type !== 'PATTERN') {
                    errors.push(
                        `${where}: ${step.payload.pattern} is not a PATTERN item`,
                    );
                }
                const slots = new Set(
                    pattern?.pattern?.slots.map((s) => s.name) ?? [],
                );
                step.payload.prompts.forEach((prompt, i) => {
                    for (const name of Object.keys(prompt.slots)) {
                        if (pattern?.pattern && !slots.has(name)) {
                            errors.push(
                                `${where}: prompt ${i} fills unknown slot ${name}`,
                            );
                        }
                    }
                });
                break;
            }
            case 'DIALOGUE':
                if (
                    !unit.dialogues.some(
                        (d) => d.slug === step.payload.dialogue,
                    )
                ) {
                    errors.push(
                        `${where}: dialogue ${step.payload.dialogue} is not in unit ${unit.slug}`,
                    );
                }
                break;
            case 'QUIZ':
                checkQuestions(errors, where, step.payload.questions, items);
                break;
            case 'WARMUP':
            case 'SPEAK':
                break;
        }
    });
}

function checkQuestions(
    errors: string[],
    where: string,
    questions: Question[],
    items: Map<string, ItemSeed>,
): void {
    questions.forEach((q, i) => {
        if (q.item && !items.has(q.item)) {
            errors.push(`${where}: question ${i} tests unknown item ${q.item}`);
        }
    });
}

function reportDuplicates(
    errors: string[],
    kind: string,
    slugs: string[],
): void {
    const seen = new Set<string>();
    for (const slug of slugs) {
        if (seen.has(slug)) errors.push(`${kind} ${slug}: duplicate slug`);
        seen.add(slug);
    }
}
