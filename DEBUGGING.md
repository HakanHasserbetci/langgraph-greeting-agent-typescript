# Debugging Guide - TypeScript Implementation

This document provides detailed troubleshooting steps for common issues you might encounter when working with this LangGraph greeting agent.

## Table of Contents
1. [Environment Setup Issues](#environment-setup-issues)
2. [Dependency Problems](#dependency-problems)
3. [TypeScript Compilation Issues](#typescript-compilation-issues)
4. [Runtime Errors](#runtime-errors)
5. [Testing and Validation](#testing-and-validation)
6. [Common Gotchas](#common-gotchas)
7. [Advanced Debugging](#advanced-debugging)

---

## Environment Setup Issues

### Issue: `pnpm` command not found

**Symptoms**:
```bash
$ pnpm --version
bash: pnpm: command not found
```

**Diagnosis**: pnpm is not installed or not in PATH

**Solutions**:

1. **Check if pnpm is installed**:
```bash
ls -la ~/.local/share/pnpm
```

2. **Install pnpm**:
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

3. **Add pnpm to PATH**:
```bash
# Add to ~/.bashrc or ~/.zshrc
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Reload
source ~/.bashrc  # or source ~/.zshrc
```

4. **Verify installation**:
```bash
pnpm --version
```

5. **Alternative: Use npm to install pnpm globally** (if you have npm):
```bash
npm install -g pnpm
```

---

### Issue: Node.js version mismatch

**Symptoms**:
```
error: The engine "node" is incompatible with this module
Expected version ">=18.0.0". Got "16.14.0"
```

**Diagnosis**: Node.js version is too old

**Solutions**:

1. **Check current Node.js version**:
```bash
node --version
```

2. **Install Node.js 18 or higher**:
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# On Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# On macOS with Homebrew
brew install node@18
```

3. **Verify installation**:
```bash
node --version  # Should be v18.x.x or higher
```

---

### Issue: Permission errors during installation

**Symptoms**:
```
EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Diagnosis**: Trying to install globally without proper permissions

**Solutions**:

1. **Use pnpm instead of npm** (pnpm doesn't have this issue):
```bash
pnpm install
```

2. **Don't use sudo** - pnpm installs to user directory

3. **If using npm, configure npm prefix**:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

---

## Dependency Problems

### Issue: Cannot find module '@langchain/langgraph'

**Symptoms**:
```typescript
Error: Cannot find module '@langchain/langgraph'
Module not found: Error: Can't resolve '@langchain/langgraph'
```

**Diagnosis**: Dependencies not installed

**Solutions**:

1. **Install dependencies**:
```bash
pnpm install
```

2. **Check if node_modules exists**:
```bash
ls -la node_modules/@langchain/langgraph
```

3. **Reinstall dependencies**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

4. **Verify installation**:
```bash
pnpm list @langchain/langgraph
```

---

### Issue: Package version conflicts

**Symptoms**:
```
WARN Issues with peer dependencies found
✗ @langchain/core@1.1.4 is incompatible with @langchain/langgraph@1.0.4
```

**Diagnosis**: Incompatible package versions

**Solutions**:

1. **Update all dependencies**:
```bash
pnpm update
```

2. **Check for peer dependency issues**:
```bash
pnpm why @langchain/core
```

3. **Use exact versions in package.json**:
```json
{
  "dependencies": {
    "@langchain/langgraph": "1.0.4",
    "@langchain/core": "1.1.4"
  }
}
```

4. **Clear cache and reinstall**:
```bash
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### Issue: Module resolution errors

**Symptoms**:
```
error TS2307: Cannot find module '@langchain/langgraph' or its corresponding type declarations
```

**Diagnosis**: TypeScript can't find the module or its types

**Solutions**:

1. **Ensure dependencies are installed**:
```bash
pnpm install
```

2. **Check TypeScript configuration** (tsconfig.json):
```json
{
  "compilerOptions": {
    "moduleResolution": "node",  // Important!
    "esModuleInterop": true,
    "skipLibCheck": true  // Skip checking .d.ts files
  }
}
```

3. **Restart TypeScript server** (if using VS Code):
   - Cmd/Ctrl + Shift + P
   - "TypeScript: Restart TS Server"

---

## TypeScript Compilation Issues

### Issue: Type errors in strict mode

**Symptoms**:
```typescript
error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'
```

**Diagnosis**: TypeScript strict mode catching potential undefined values

**Solutions**:

1. **Use non-null assertion** (if you're sure it's defined):
```typescript
const name = state.name!;  // ! asserts non-null
```

2. **Use optional chaining and nullish coalescing**:
```typescript
const name = state.name ?? "Guest";
```

3. **Add proper type guards**:
```typescript
if (state.name) {
  const greeting = `Hello, ${state.name}!`;
}
```

4. **Adjust strict settings** (not recommended):
```json
{
  "compilerOptions": {
    "strict": false  // Disables all strict checks
  }
}
```

---

### Issue: Cannot find name 'require'

**Symptoms**:
```typescript
error TS2304: Cannot find name 'require'
```

**Diagnosis**: Using CommonJS require in ES modules context

**Solutions**:

1. **Add @types/node**:
```bash
pnpm add -D @types/node
```

2. **Ensure correct module type** in package.json:
```json
{
  "type": "commonjs"  // or "module" depending on your setup
}
```

3. **Update tsconfig.json**:
```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

---

### Issue: Cannot use import statement outside a module

**Symptoms**:
```
SyntaxError: Cannot use import statement outside a module
```

**Diagnosis**: Mixing ES modules and CommonJS

**Solutions**:

1. **Use tsx** (already configured):
```bash
pnpm start  # Uses tsx which handles both
```

2. **Or set package.json type**:
```json
{
  "type": "module"
}
```

3. **Use .mjs extension** for ES modules:
```bash
mv src/index.ts src/index.mts
```

---

## Runtime Errors

### Issue: StateGraph initialization error

**Symptoms**:
```typescript
TypeError: StateGraph is not a constructor
```

**Diagnosis**: Incorrect import or usage

**Solution**:
```typescript
// ❌ Wrong - missing 'new' keyword
const workflow = StateGraph(GreetingState);

// ✅ Correct
import { StateGraph } from "@langchain/langgraph";
const workflow = new StateGraph(GreetingState);
```

---

### Issue: Annotation.Root is undefined

**Symptoms**:
```typescript
TypeError: Cannot read property 'Root' of undefined
```

**Diagnosis**: Incorrect import

**Solution**:
```typescript
// ❌ Wrong import
import { Annotation } from "@langchain/core";

// ✅ Correct import (for LangGraph v1.0+)
import { Annotation } from "@langchain/langgraph";

// Alternative: Use object-based state
import { StateGraph } from "@langchain/langgraph";

const workflow = new StateGraph<{
  name: string;
  greeting: string;
}>({});
```

---

### Issue: Promise not awaited

**Symptoms**:
```typescript
[object Promise] instead of actual result
```

**Diagnosis**: Forgot to await async function

**Solution**:
```typescript
// ❌ Wrong - missing await
const result = app.invoke({ name: "Alice" });
console.log(result);  // Prints: Promise { <pending> }

// ✅ Correct
const result = await app.invoke({ name: "Alice" });
console.log(result);  // Prints: { name: "Alice", greeting: "..." }

// Or use .then()
app.invoke({ name: "Alice" }).then(result => {
  console.log(result);
});
```

---

### Issue: Node function type mismatch

**Symptoms**:
```typescript
Type 'string' is not assignable to type 'Partial<GreetingState>'
```

**Diagnosis**: Node function returning wrong type

**Solution**:
```typescript
// ❌ Wrong - returns string
function greetingNode(state: typeof GreetingState.State): string {
  return "Hello!";
}

// ✅ Correct - returns Partial<State>
function greetingNode(
  state: typeof GreetingState.State
): Partial<typeof GreetingState.State> {
  return { greeting: `Hello, ${state.name}! Welcome!` };
}
```

---

### Issue: Graph not compiled

**Symptoms**:
```typescript
TypeError: workflow.invoke is not a function
```

**Diagnosis**: Forgot to compile the graph

**Solution**:
```typescript
// ❌ Wrong
const workflow = new StateGraph(GreetingState);
workflow.addNode("greetingNode", greetingNode);
const result = await workflow.invoke({ name: "Alice" });  // Error!

// ✅ Correct
const workflow = new StateGraph(GreetingState);
workflow.addNode("greetingNode", greetingNode);
workflow.addEdge(START, "greetingNode");
workflow.addEdge("greetingNode", END);
const app = workflow.compile();  // Must compile!
const result = await app.invoke({ name: "Alice" });
```

---

## Testing and Validation

### Verify Installation

**Create test-installation.ts**:
```typescript
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

console.log("Node version:", process.version);
console.log("Node executable:", process.execPath);

// Test basic graph creation
const TestState = Annotation.Root({
  value: Annotation<string>,
});

function testNode(state: typeof TestState.State) {
  return { value: "test" };
}

async function test() {
  try {
    const workflow = new StateGraph(TestState);
    workflow.addNode("test", testNode);
    workflow.addEdge(START, "test");
    workflow.addEdge("test", END);
    const app = workflow.compile();

    const result = await app.invoke({ value: "input" });
    console.log("✓ Graph execution successful:", result);
  } catch (error) {
    console.error("✗ Graph execution failed:", error);
    process.exit(1);
  }

  console.log("\n✓ All tests passed!");
}

test();
```

**Run the test**:
```bash
pnpm tsx test-installation.ts
```

---

### Unit Testing with Vitest

**Install Vitest**:
```bash
pnpm add -D vitest
```

**Create tests/agent.test.ts**:
```typescript
import { describe, it, expect } from 'vitest';
import { createGreetingGraph, greetingNode, GreetingState } from '../src/index';

describe('Greeting Agent', () => {
  it('should generate greeting for a name', () => {
    const state = { name: "Alice", greeting: "" };
    const result = greetingNode(state);

    expect(result).toHaveProperty('greeting');
    expect(result.greeting).toContain('Alice');
    expect(result.greeting).toContain('Welcome');
  });

  it('should execute graph successfully', async () => {
    const app = createGreetingGraph();
    const result = await app.invoke({ name: "Bob" });

    expect(result.name).toBe("Bob");
    expect(result.greeting).toContain("Bob");
    expect(result.greeting).toContain("Welcome");
  });

  it('should handle multiple invocations', async () => {
    const app = createGreetingGraph();
    const names = ["Alice", "Bob", "Charlie"];

    for (const name of names) {
      const result = await app.invoke({ name });
      expect(result.greeting).toContain(name);
    }
  });

  it('should return only greeting field (delta)', () => {
    const state = { name: "Test", greeting: "" };
    const result = greetingNode(state);

    expect(result).toHaveProperty('greeting');
    expect(result).not.toHaveProperty('name');
  });
});
```

**Add test script to package.json**:
```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

**Run tests**:
```bash
pnpm test
```

---

## Common Gotchas

### 1. Forgetting 'new' Keyword

TypeScript uses classes, so you need `new`:
```typescript
// ❌ Wrong
const workflow = StateGraph(GreetingState);

// ✅ Correct
const workflow = new StateGraph(GreetingState);
```

---

### 2. Not Awaiting Async Functions

LangGraph operations are async:
```typescript
// ❌ Wrong - missing await
function main() {
  const app = createGreetingGraph();
  const result = app.invoke({ name: "Alice" });
  console.log(result);  // Promise!
}

// ✅ Correct
async function main() {
  const app = createGreetingGraph();
  const result = await app.invoke({ name: "Alice" });
  console.log(result);  // Actual result
}
```

---

### 3. Type Annotation Confusion

LangGraph TypeScript uses `Annotation.Root()`:
```typescript
// ❌ Wrong - Python style
interface GreetingState {
  name: string;
  greeting: string;
}
const workflow = new StateGraph<GreetingState>();

// ✅ Correct - LangGraph style
const GreetingState = Annotation.Root({
  name: Annotation<string>,
  greeting: Annotation<string>,
});
const workflow = new StateGraph(GreetingState);
```

---

### 4. Module Import Issues

Be careful with import syntax:
```typescript
// ❌ Wrong
const { StateGraph } = require("@langchain/langgraph");

// ✅ Correct
import { StateGraph } from "@langchain/langgraph";
```

---

### 5. CommonJS vs ES Modules

If using `require.main === module`:
```typescript
// ❌ Wrong in ES modules
if (require.main === module) {  // Error!
  main();
}

// ✅ Correct for CommonJS (package.json: "type": "commonjs")
if (require.main === module) {
  main().catch(console.error);
}

// ✅ Alternative for ES modules
import { fileURLToPath } from 'url';
if (import.meta.url === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}
```

---

### 6. TypeScript Configuration

Wrong tsconfig settings can cause issues:
```json
{
  "compilerOptions": {
    // Important settings:
    "moduleResolution": "node",  // Must be "node"
    "esModuleInterop": true,     // Helps with imports
    "skipLibCheck": true,        // Skip checking .d.ts
    "strict": true               // Recommended
  }
}
```

---

## Advanced Debugging

### Enable Debug Logging

```typescript
// Set environment variable before running
process.env.DEBUG = 'langgraph:*';

// Or set in terminal
// DEBUG=langgraph:* pnpm start
```

---

### Use Node.js Debugger

**Add to package.json**:
```json
{
  "scripts": {
    "debug": "node --inspect-brk -r tsx/cjs src/index.ts"
  }
}
```

**Run**:
```bash
pnpm debug
```

**Then open Chrome**: chrome://inspect

---

### TypeScript Source Maps

Source maps are enabled by default in tsconfig.json:
```json
{
  "compilerOptions": {
    "sourceMap": true  // Enables debugging TypeScript code
  }
}
```

---

### Inspect Compiled JavaScript

```bash
pnpm build
cat dist/index.js  # See compiled output
```

---

### Check Type Definitions

```bash
# See generated type definitions
pnpm build
cat dist/index.d.ts
```

---

### Profile Performance

```typescript
function greetingNode(state: typeof GreetingState.State) {
  const start = performance.now();

  const result = { greeting: `Hello, ${state.name}! Welcome!` };

  const elapsed = performance.now() - start;
  console.log(`Node execution took ${elapsed.toFixed(4)}ms`);

  return result;
}
```

---

### Interactive Debugging

Add debugger statements:
```typescript
function greetingNode(state: typeof GreetingState.State) {
  debugger;  // Breakpoint when running with --inspect
  const name = state.name;
  const greeting = `Hello, ${name}! Welcome!`;
  return { greeting };
}
```

---

### Check Package Dependencies

```bash
# See dependency tree
pnpm list --depth=2

# See why a package is installed
pnpm why @langchain/core
```

---

### Verify Node Modules

```bash
# Check if package is actually installed
ls -la node_modules/@langchain/langgraph

# Check package version
cat node_modules/@langchain/langgraph/package.json | grep version
```

---

## Getting Help

If you're still stuck:

1. **Check LangGraph docs**: https://langchain-ai.github.io/langgraphjs/
2. **LangChain Discord**: https://discord.gg/langchain
3. **GitHub Issues**: https://github.com/langchain-ai/langgraphjs/issues
4. **Stack Overflow**: Tag questions with `langgraph` and `typescript`
5. **pnpm docs**: https://pnpm.io/

---

## Quick Diagnostic Checklist

When something goes wrong, run through this checklist:

- [ ] Is Node.js 18+ installed?
- [ ] Is pnpm installed and in PATH?
- [ ] Did you run `pnpm install` to install dependencies?
- [ ] Is the tsconfig.json properly configured?
- [ ] Are you using `await` for async operations?
- [ ] Is the graph compiled before invoking?
- [ ] Do all nodes have edges to and from them?
- [ ] Are you using `new StateGraph()` (not just `StateGraph()`)?
- [ ] Are imports using ES module syntax?
- [ ] Have you checked the error message carefully?
- [ ] Did you restart the TypeScript server (if using VS Code)?

---

## Environment Variables Reference

Useful environment variables for debugging:

```bash
# Enable LangSmith tracing
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your-api-key
export LANGCHAIN_PROJECT=langgraph-greeting-agent

# Enable debug logging
export DEBUG=langgraph:*

# Node.js debugging
export NODE_OPTIONS="--inspect"

# TypeScript debugging
export TSX_TSCONFIG_PATH=./tsconfig.json
```

---

**Last Updated**: December 11, 2025
