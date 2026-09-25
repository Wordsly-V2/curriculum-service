import type { QuestionView } from '@/release/release.logic';
import {
    gradeCheckpoint,
    isCheckpointResponse,
    isCorrect,
    learnerQuestions,
} from './checkpoint.logic';

const choice: QuestionView = {
    kind: 'choice',
    prompt: 'Pick one',
    options: ['a', 'b', 'c'],
    answer: 1,
    explanationVi: 'vì b',
    itemId: 'i1',
};
const gap: QuestionView = {
    kind: 'gap',
    sentence: 'She ___ a doctor.',
    hintVi: 'là',
    answers: ['is', "'s"],
};
const order: QuestionView = {
    kind: 'order',
    vi: 'Tôi là sinh viên.',
    answer: 'I am a student.',
};

describe('learnerQuestions', () => {
    it('strips answers and explanations', () => {
        const out = learnerQuestions([choice, gap, order]);
        expect(out).toEqual([
            {
                kind: 'choice',
                prompt: 'Pick one',
                options: ['a', 'b', 'c'],
                itemId: 'i1',
            },
            { kind: 'gap', sentence: 'She ___ a doctor.', hintVi: 'là' },
            {
                kind: 'order',
                vi: 'Tôi là sinh viên.',
                tiles: ['a', 'am', 'I', 'student.'],
            },
        ]);
        expect(JSON.stringify(out)).not.toMatch(/answer|explanation/);
    });
});

describe('isCorrect', () => {
    it('compares a choice by index', () => {
        expect(isCorrect(choice, 1)).toBe(true);
        expect(isCorrect(choice, 0)).toBe(false);
        expect(isCorrect(choice, '1')).toBe(false);
    });

    it('compares typed text loosely', () => {
        expect(isCorrect(gap, '  IS ')).toBe(true);
        expect(isCorrect(gap, '’s')).toBe(true);
        expect(isCorrect(gap, '')).toBe(false);
        expect(isCorrect(gap, 1)).toBe(false);
    });

    it('compares ordered words, ignoring the final punctuation', () => {
        expect(isCorrect(order, ['I', 'am', 'a', 'student.'])).toBe(true);
        expect(isCorrect(order, ['i', 'am', 'a', 'student'])).toBe(true);
        expect(isCorrect(order, ['am', 'I', 'a', 'student.'])).toBe(false);
        expect(isCorrect(order, 'I am a student.')).toBe(false);
    });

    it('counts a missing response as wrong', () => {
        expect(isCorrect(choice, undefined)).toBe(false);
    });
});

describe('isCheckpointResponse', () => {
    it('accepts the three shapes only', () => {
        expect(isCheckpointResponse(2)).toBe(true);
        expect(isCheckpointResponse('is')).toBe(true);
        expect(isCheckpointResponse(['a', 'b'])).toBe(true);
        expect(isCheckpointResponse(1.5)).toBe(false);
        expect(isCheckpointResponse(null)).toBe(false);
        expect(isCheckpointResponse([1])).toBe(false);
        expect(isCheckpointResponse({})).toBe(false);
    });
});

describe('gradeCheckpoint', () => {
    const checkpoint = { passPercent: 70, questions: [choice, gap, order] };

    it('passes at the threshold and reveals the answers', () => {
        const grade = gradeCheckpoint(checkpoint, [
            1,
            'is',
            ['I', 'am', 'a', 'student.'],
        ]);
        expect(grade).toMatchObject({
            scorePercent: 100,
            passed: true,
            passPercent: 70,
        });
        expect(grade.results[0]).toEqual({
            correct: true,
            correctAnswer: 'b',
            explanationVi: 'vì b',
        });
        expect(grade.results[1].correctAnswer).toBe('She is a doctor.');
    });

    it('fails below the threshold without revealing answers', () => {
        const grade = gradeCheckpoint(checkpoint, [1, 'are', []]);
        expect(grade.scorePercent).toBe(33);
        expect(grade.passed).toBe(false);
        expect(grade.results).toEqual([
            { correct: true },
            { correct: false },
            { correct: false },
        ]);
    });

    it('rounds the score', () => {
        const grade = gradeCheckpoint(checkpoint, [1, 'is', []]);
        expect(grade.scorePercent).toBe(67);
        expect(grade.passed).toBe(false);
    });
});
