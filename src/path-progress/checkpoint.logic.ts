import type { CheckpointSnapshot, QuestionView } from '@/release/release.logic';

/**
 * Checkpoints are graded here, never on the client: the learner receives the
 * questions without their answers (`learnerQuestions`) and sends back one
 * response per question.
 *
 * Typed answers are compared loosely, the same way the lesson player's quiz
 * does (frontend `lib/path/quiz.ts`, keep the two in step).
 */

/** A question as the learner sees it: no answer, and no explanation yet. */
export type CheckpointQuestion = { itemId?: string } & (
    | {
          kind: 'choice';
          prompt: string;
          audioText?: string;
          options: string[];
      }
    | { kind: 'gap'; sentence: string; hintVi?: string }
    /** `tiles` are the answer's words, sorted; the client shuffles them. */
    | { kind: 'order'; vi: string; tiles: string[] }
);

/** Option index (choice), typed text (gap), words in order (order). */
export type CheckpointResponse = number | string | string[];

export interface QuestionResult {
    correct: boolean;
    /** The answer as the learner should read it; only once the checkpoint is passed. */
    correctAnswer?: string;
    explanationVi?: string;
}

export interface CheckpointGrade {
    scorePercent: number;
    passed: boolean;
    passPercent: number;
    results: QuestionResult[];
}

export function normalizeAnswer(value: string): string {
    return value
        .replace(/[’‘]/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[.!?,;:]+$/, '')
        .toLowerCase();
}

export function isCheckpointResponse(
    value: unknown,
): value is CheckpointResponse {
    return (
        (typeof value === 'number' && Number.isInteger(value)) ||
        (typeof value === 'string' && value.length <= 500) ||
        (Array.isArray(value) &&
            value.length <= 50 &&
            value.every((v) => typeof v === 'string' && v.length <= 100))
    );
}

/** The words of an order question's answer, punctuation attached. */
export function orderTiles(answer: string): string[] {
    return answer.split(/\s+/).filter(Boolean);
}

export function learnerQuestions(
    questions: QuestionView[],
): CheckpointQuestion[] {
    return questions.map((q): CheckpointQuestion => {
        const itemId = q.itemId ? { itemId: q.itemId } : {};
        switch (q.kind) {
            case 'choice':
                return {
                    kind: 'choice',
                    prompt: q.prompt,
                    ...(q.audioText ? { audioText: q.audioText } : {}),
                    options: q.options,
                    ...itemId,
                };
            case 'gap':
                return {
                    kind: 'gap',
                    sentence: q.sentence,
                    ...(q.hintVi ? { hintVi: q.hintVi } : {}),
                    ...itemId,
                };
            case 'order':
                return {
                    kind: 'order',
                    vi: q.vi,
                    tiles: orderTiles(q.answer).sort((a, b) =>
                        a.localeCompare(b),
                    ),
                    ...itemId,
                };
        }
    });
}

export function isCorrect(
    question: QuestionView,
    response: CheckpointResponse | undefined,
): boolean {
    switch (question.kind) {
        case 'choice':
            return response === question.answer;
        case 'gap': {
            if (typeof response !== 'string') return false;
            const typed = normalizeAnswer(response);
            return (
                typed.length > 0 &&
                question.answers.some((a) => normalizeAnswer(a) === typed)
            );
        }
        case 'order': {
            const words = Array.isArray(response) ? response.join(' ') : null;
            return (
                words !== null &&
                normalizeAnswer(words) === normalizeAnswer(question.answer)
            );
        }
    }
}

export function correctAnswerText(question: QuestionView): string {
    switch (question.kind) {
        case 'choice':
            return question.options[question.answer];
        case 'gap':
            return question.sentence.replace('___', question.answers[0]);
        case 'order':
            return question.answer;
    }
}

/**
 * Grades one attempt. Answers are revealed only when the checkpoint is
 * passed: after a failed attempt the learner sees which questions were wrong,
 * not what to answer next time.
 */
export function gradeCheckpoint(
    checkpoint: Pick<CheckpointSnapshot, 'passPercent' | 'questions'>,
    responses: readonly CheckpointResponse[],
): CheckpointGrade {
    const verdicts = checkpoint.questions.map((q, i) =>
        isCorrect(q, responses[i]),
    );
    const total = verdicts.length;
    const scorePercent =
        total === 0
            ? 100
            : Math.round((verdicts.filter(Boolean).length * 100) / total);
    const passed = scorePercent >= checkpoint.passPercent;

    return {
        scorePercent,
        passed,
        passPercent: checkpoint.passPercent,
        results: checkpoint.questions.map((q, i) =>
            passed
                ? {
                      correct: verdicts[i],
                      correctAnswer: correctAnswerText(q),
                      ...(q.explanationVi
                          ? { explanationVi: q.explanationVi }
                          : {}),
                  }
                : { correct: verdicts[i] },
        ),
    };
}
