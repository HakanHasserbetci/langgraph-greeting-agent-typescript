/**
 * Unit tests for the LangGraph Greeting Agent (TypeScript).
 *
 * Tests verify that the agent correctly accepts a name as input
 * and returns a greeting message containing that name.
 */

import { describe, it, expect } from 'vitest';
import { createGreetingGraph, greetingNode, GreetingState } from '../src/index';

describe('GreetingNode', () => {
  describe('Return Type', () => {
    it('should return an object', () => {
      const state = { name: 'Alice', greeting: '' };
      const result = greetingNode(state);

      expect(result).toBeTypeOf('object');
      expect(result).not.toBeNull();
    });

    it('should contain greeting field', () => {
      const state = { name: 'Alice', greeting: '' };
      const result = greetingNode(state);

      expect(result).toHaveProperty('greeting');
    });
  });

  describe('Greeting Content', () => {
    it('should include the name in the greeting', () => {
      const state = { name: 'Alice', greeting: '' };
      const result = greetingNode(state);

      expect(result.greeting).toContain('Alice');
    });

    it('should include "Welcome" in the greeting', () => {
      const state = { name: 'Alice', greeting: '' };
      const result = greetingNode(state);

      expect(result.greeting).toContain('Welcome');
    });

    it('should return only delta (greeting field)', () => {
      const state = { name: 'Bob', greeting: '' };
      const result = greetingNode(state);

      // Should only return the greeting field, not the name
      expect(result).toHaveProperty('greeting');
      expect(result).not.toHaveProperty('name');
      expect(Object.keys(result)).toHaveLength(1);
    });
  });

  describe('Different Names', () => {
    const testNames = ['Alice', 'Bob', 'Charlie', 'Zara', 'John Doe'];

    testNames.forEach((name) => {
      it(`should create greeting for ${name}`, () => {
        const state = { name, greeting: '' };
        const result = greetingNode(state);

        expect(result.greeting).toContain(name);
        expect(result.greeting).toContain('Welcome');
      });
    });
  });

  describe('Greeting Format', () => {
    it('should follow the expected format', () => {
      const testCases = [
        { name: 'Alice', expected: 'Hello, Alice! Welcome!' },
        { name: 'Bob', expected: 'Hello, Bob! Welcome!' },
        { name: 'Charlie', expected: 'Hello, Charlie! Welcome!' },
      ];

      testCases.forEach(({ name, expected }) => {
        const state = { name, greeting: '' };
        const result = greetingNode(state);

        expect(result.greeting).toBe(expected);
      });
    });
  });
});

describe('GreetingGraph', () => {
  describe('Graph Creation', () => {
    it('should create graph successfully', () => {
      const app = createGreetingGraph();
      expect(app).toBeDefined();
      expect(app).not.toBeNull();
    });
  });

  describe('Graph Execution', () => {
    it('should execute with a name', async () => {
      const app = createGreetingGraph();
      const result = await app.invoke({ name: 'Alice' });

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('greeting');
      expect(result.name).toBe('Alice');
      expect(result.greeting).toContain('Alice');
    });

    it('should handle multiple invocations', async () => {
      const app = createGreetingGraph();
      const names = ['Alice', 'Bob', 'Charlie'];

      for (const name of names) {
        const result = await app.invoke({ name });

        expect(result.name).toBe(name);
        expect(result.greeting).toContain(name);
        expect(result.greeting).toContain('Welcome');
      }
    });

    it('should preserve input state', async () => {
      const app = createGreetingGraph();
      const inputState = { name: 'Bob' };
      const result = await app.invoke(inputState);

      // Original input should not be modified
      expect(inputState).toEqual({ name: 'Bob' });

      // Result should have both fields
      expect(result.name).toBe('Bob');
      expect(result).toHaveProperty('greeting');
    });
  });

  describe('Output Format', () => {
    it('should return correct output structure', async () => {
      const app = createGreetingGraph();
      const result = await app.invoke({ name: 'Alice' });

      // Check type
      expect(result).toBeTypeOf('object');

      // Check fields
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('greeting');

      // Check value types
      expect(result.name).toBeTypeOf('string');
      expect(result.greeting).toBeTypeOf('string');
    });

    it('should produce correct greetings', async () => {
      const app = createGreetingGraph();
      const testCases = [
        { name: 'Alice', expected: 'Hello, Alice! Welcome!' },
        { name: 'Bob', expected: 'Hello, Bob! Welcome!' },
        { name: 'Charlie', expected: 'Hello, Charlie! Welcome!' },
      ];

      for (const { name, expected } of testCases) {
        const result = await app.invoke({ name });
        expect(result.greeting).toBe(expected);
      }
    });
  });

  describe('No LLM Required', () => {
    it('should work without LLM API keys', async () => {
      // Temporarily remove any LLM-related env vars
      const llmKeys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'LANGCHAIN_API_KEY'];
      const originalValues: Record<string, string | undefined> = {};

      for (const key of llmKeys) {
        originalValues[key] = process.env[key];
        delete process.env[key];
      }

      try {
        // Should work without any API keys
        const app = createGreetingGraph();
        const result = await app.invoke({ name: 'Test' });

        expect(result).toHaveProperty('greeting');
        expect(result.greeting).toContain('Test');
      } finally {
        // Restore original values
        for (const [key, value] of Object.entries(originalValues)) {
          if (value !== undefined) {
            process.env[key] = value;
          }
        }
      }
    });
  });
});

describe('Edge Cases', () => {
  describe('Special Inputs', () => {
    it('should handle empty name', async () => {
      const app = createGreetingGraph();
      const result = await app.invoke({ name: '' });

      expect(result).toHaveProperty('greeting');
      expect(result.greeting).toContain('Welcome');
    });

    it('should handle name with spaces', async () => {
      const app = createGreetingGraph();
      const result = await app.invoke({ name: 'John Doe' });

      expect(result.greeting).toContain('John Doe');
    });

    it('should handle names with special characters', async () => {
      const app = createGreetingGraph();
      const names = ['José', 'François', 'Müller', "O'Brien"];

      for (const name of names) {
        const result = await app.invoke({ name });
        expect(result.greeting).toContain(name);
      }
    });
  });

  describe('State Management', () => {
    it('should not mutate input state', async () => {
      const app = createGreetingGraph();
      const inputState = { name: 'Alice' };
      const originalInput = { ...inputState };

      await app.invoke(inputState);

      // Input should remain unchanged
      expect(inputState).toEqual(originalInput);
    });

    it('should work with partial state', async () => {
      const app = createGreetingGraph();
      // Only providing name, not greeting
      const result = await app.invoke({ name: 'Bob' });

      expect(result.name).toBe('Bob');
      expect(result.greeting).toBe('Hello, Bob! Welcome!');
    });
  });
});

describe('Performance', () => {
  it('should execute quickly (no LLM delays)', async () => {
    const app = createGreetingGraph();
    const start = Date.now();

    await app.invoke({ name: 'Test' });

    const elapsed = Date.now() - start;

    // Should complete in under 100ms (no API calls)
    expect(elapsed).toBeLessThan(100);
  });

  it('should handle concurrent invocations', async () => {
    const app = createGreetingGraph();
    const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];

    // Run all invocations concurrently
    const promises = names.map((name) => app.invoke({ name }));
    const results = await Promise.all(promises);

    // Verify all results
    results.forEach((result, index) => {
      expect(result.name).toBe(names[index]);
      expect(result.greeting).toContain(names[index]);
    });
  });
});
