# LangGraph Greeting Agent (TypeScript)

A simple single-node LangGraph agent that demonstrates state management and graph execution **without using any LLM**. This agent accepts a user's name as input and returns a personalized greeting message.

## Features

- **No LLM Required**: Pure state transformation logic
- **Proper Graph Structure**: START → greetingNode → END
- **Type-Safe State Schema**: Uses LangGraph's Annotation system
- **Clean Architecture**: Follows LangGraph best practices

## Prerequisites

- Node.js 18 or higher
- [pnpm](https://pnpm.io/) package manager

## Installation

1. Clone this repository:
```bash
git clone https://github.com/HakanHasserbetci/langgraph-greeting-agent-typescript.git
cd langgraph-greeting-agent-typescript
```

2. Install dependencies using pnpm:
```bash
pnpm install
```

This will:
- Install all required dependencies including @langchain/langgraph
- Set up TypeScript and development tools

## Usage

### Running the Agent

You can run the agent in several ways:

**Option 1: Using pnpm start (recommended)**
```bash
pnpm start
```

**Option 2: Development mode with auto-reload**
```bash
pnpm dev
```

**Option 3: Build and run compiled version**
```bash
pnpm build
node dist/index.js
```

### Using in Your Code

```typescript
import { createGreetingGraph } from './index';

// Create the graph
const app = createGreetingGraph();

// Invoke with a name
const result = await app.invoke({ name: "Alice" });
console.log(result.greeting);  // Output: Hello, Alice! Welcome!
```

## Project Structure

```
langgraph-typescript/
├── src/
│   └── index.ts                 # Main agent implementation
├── package.json                  # Project configuration and dependencies
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # This file
├── dev-history.md               # Development history and process
└── .gitignore                   # Git ignore rules
```

## How It Works

### State Schema

The agent uses LangGraph's Annotation system for type-safe state management:
```typescript
const GreetingState = Annotation.Root({
  name: Annotation<string>,      // Input: user's name
  greeting: Annotation<string>,  // Output: greeting message
});
```

### Graph Structure

```
[START]
   │
   ▼
[greetingNode] ← Reads state.name
   │              Writes state.greeting
   ▼
[END] ← Returns final state
```

### The Greeting Node

The `greetingNode` function:
1. Reads the `name` from the current state
2. Generates a greeting message: `"Hello, {name}! Welcome!"`
3. Returns only the delta (the `greeting` field) to update the state

This follows LangGraph best practices of returning partial state updates rather than the full state.

## Development

### Building the Project

```bash
pnpm build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Running Tests

```bash
pnpm test
```

### Code Style

The code follows TypeScript best practices:
- Strict type checking enabled
- Full type annotations for functions
- JSDoc comments for documentation
- ES2020 target with ESNext modules

## Technical Details

- **Package Manager**: pnpm (fast, disk space efficient)
- **LangGraph Version**: 1.0.4
- **TypeScript Version**: 5.9.3
- **Runtime**: tsx for development, compiled JavaScript for production
- **No LLM Dependencies**: This agent intentionally does not use any language models

## Scripts

- `pnpm start` - Run the agent using tsx (fast, no build step)
- `pnpm dev` - Run in watch mode with auto-reload
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm test` - Run tests (placeholder for now)

## License

This project is created for educational purposes as part of a technical assessment.

## Resources

- [LangGraph TypeScript Documentation](https://langchain-ai.github.io/langgraphjs/)
- [pnpm Documentation](https://pnpm.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
