import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

// Simple math utility to test
const add = (a: number, b: number) => a + b;

describe('Math Utils', () => {
    it('adds two numbers correctly', () => {
        expect(add(2, 3)).toBe(5);
    });
});

// We can add component tests later, but this verifies the runner works
