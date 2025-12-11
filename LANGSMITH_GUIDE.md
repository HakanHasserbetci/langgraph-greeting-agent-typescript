# LangSmith Setup Guide - TypeScript Implementation

This guide walks you through setting up LangSmith for the LangGraph Greeting Agent to enable visualization, tracing, and debugging.

## Table of Contents
1. [What is LangSmith?](#what-is-langsmith)
2. [Creating a LangSmith Account](#creating-a-langsmith-account)
3. [Getting Your API Key](#getting-your-api-key)
4. [Configuration](#configuration)
5. [Running with LangSmith](#running-with-langsmith)
6. [Graph Visualization](#graph-visualization)
7. [Troubleshooting](#troubleshooting)

---

## What is LangSmith?

**LangSmith** is a platform for debugging, testing, and monitoring LangGraph and LangChain applications. It provides:

- **Tracing**: See every step of your agent's execution
- **Visualization**: View your graph structure visually
- **Debugging**: Inspect state changes and node executions
- **Monitoring**: Track performance and errors

**Key Features for This Project**:
- Visualize the START → greetingNode → END flow
- See state transformations in real-time
- Verify that no LLM calls are made
- Debug any issues with graph execution

---

## Creating a LangSmith Account

### Step 1: Sign Up

1. Go to **https://smith.langchain.com**

2. Click **"Sign Up"** (top-right corner)

3. Choose your sign-up method:
   - **GitHub** (recommended for developers)
   - **Google**
   - **Email**

4. Complete the registration process

5. Verify your email (if using email sign-up)

### Step 2: Create a Project (Optional)

Once logged in:

1. Click **"New Project"** or use the default project

2. **Project Name**: `langgraph-greeting-agent-typescript` (or your choice)

3. **Description**: "Simple LangGraph agent that greets users without LLM"

4. Click **"Create"**

---

## Getting Your API Key

### Step 1: Navigate to Settings

1. Click your **profile icon** (top-right)

2. Select **"Settings"**

3. Go to **"API Keys"** tab

### Step 2: Create an API Key

1. Click **"Create API Key"**

2. **Name**: `LangGraph Greeting Agent` (or your choice)

3. **Description**: "For local development of greeting agent"

4. Click **"Create"**

5. **IMPORTANT**: Copy the API key immediately
   - It starts with `lsv2_pt_...` or `ls__...`
   - You won't be able to see it again!

6. Save it securely (we'll use it in configuration)

---

## Configuration

### Method 1: Environment Variables File (Recommended)

Create a `.env` file in the project root:

```bash
# Navigate to project directory
cd /path/to/langgraph-typescript

# Create .env file
cat > .env << 'EOF'
# LangSmith Configuration
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_api_key_here
LANGCHAIN_PROJECT=langgraph-greeting-agent-typescript
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
EOF
```

**Replace `your_api_key_here`** with your actual API key from LangSmith.

**Verify .env is in .gitignore**:
```bash
grep -q "\.env" .gitignore && echo "✓ .env is ignored" || echo "✗ Add .env to .gitignore!"
```

### Method 2: Install and Use dotenv

For automatic .env loading:

```bash
# Install dotenv
pnpm add -D dotenv

# Create .env file (as above)
```

Then update your code to load it:

```typescript
// At the top of src/index.ts
import 'dotenv/config';

// Rest of your code...
```

### Method 3: Export in Terminal

For temporary use (current session only):

```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your_api_key_here
export LANGCHAIN_PROJECT=langgraph-greeting-agent-typescript
export LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
```

### Method 4: Shell Configuration File

Add to `~/.bashrc` or `~/.zshrc` for permanent configuration:

```bash
# LangSmith configuration
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your_api_key_here
export LANGCHAIN_PROJECT=langgraph-greeting-agent-typescript
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

---

## Running with LangSmith

### Verify Configuration

Create a test script to verify LangSmith is configured:

```typescript
// test-langsmith.ts
const requiredVars = [
  "LANGCHAIN_TRACING_V2",
  "LANGCHAIN_API_KEY",
  "LANGCHAIN_PROJECT"
];

console.log("LangSmith Configuration Check:");
console.log("-".repeat(40));

for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value) {
    // Mask API key
    const display = varName.includes("API_KEY") && value.length > 10
      ? value.substring(0, 10) + "..."
      : value;
    console.log(`✓ ${varName}: ${display}`);
  } else {
    console.log(`✗ ${varName}: NOT SET`);
  }
}

console.log("-".repeat(40));
```

Run with:
```bash
pnpm tsx test-langsmith.ts
```

### Run the Agent

Once configured, simply run the agent as normal:

```bash
pnpm start
```

**What happens**:
- Agent runs normally
- Execution is automatically traced to LangSmith
- No code changes needed!

### View Traces

1. Go to **https://smith.langchain.com**

2. Select your project: `langgraph-greeting-agent-typescript`

3. Click **"Runs"** tab

4. You'll see your agent execution with:
   - Execution time
   - Input/output
   - State transitions
   - No LLM calls (verify!)

---

## Graph Visualization

### Using LangGraph Studio (Recommended)

LangGraph Studio provides the best visualization experience:

#### Step 1: Install LangGraph CLI

```bash
pnpm add -D @langchain/langgraph-cli
```

Or install globally:
```bash
npm install -g @langchain/langgraph-cli
```

#### Step 2: Create langgraph.json

Create a configuration file for the graph:

```bash
cat > langgraph.json << 'EOF'
{
  "dependencies": ["."],
  "graphs": {
    "greeting_agent": "./src/index.ts:createGreetingGraph"
  },
  "env": ".env"
}
EOF
```

#### Step 3: Start LangGraph Dev Server

```bash
# If installed locally
pnpm langgraph dev

# If installed globally
langgraph dev

# Or use npx
npx langgraph dev
```

This will:
- Start a local server (usually http://localhost:8123)
- Open LangGraph Studio in your browser
- Show your graph structure visually

#### Step 4: Interact with the Graph

In LangGraph Studio:

1. **See the graph**:
   ```
   [START] → [greetingNode] → [END]
   ```

2. **Test execution**:
   - Input: `{"name": "Alice"}`
   - Watch state flow through nodes
   - See output: `{"name": "Alice", "greeting": "Hello, Alice! Welcome!"}`

3. **Capture screenshot**:
   - Use your OS screenshot tool
   - Capture the graph visualization
   - Save as `langsmith-graph-typescript.png`

### Alternative: LangSmith Web UI

If LangGraph Studio doesn't work:

1. Run the agent with tracing enabled

2. Go to **https://smith.langchain.com**

3. Find your run in the **Runs** tab

4. Click on a run to see details

5. The **"Graph"** view shows execution flow

6. Take a screenshot of this view

---

## Adding Screenshot to README

Once you have the screenshot:

### Step 1: Add to Repository

```bash
# Create images directory
mkdir -p images

# Copy your screenshot
cp /path/to/screenshot.png images/langsmith-graph.png
```

### Step 2: Update README.md

Add after the "How It Works" section:

```markdown
## Graph Visualization

Here's the graph structure visualized in LangSmith:

![LangGraph Greeting Agent Visualization](images/langsmith-graph.png)

The visualization shows:
- **START** node (entry point)
- **greetingNode** (processes name and generates greeting)
- **END** node (returns final state)
- **State flow** (name input → greeting output)
```

### Step 3: Commit

```bash
git add images/ README.md
git commit -m "docs: add LangSmith graph visualization screenshot"
git push origin main
```

---

## Troubleshooting

### Issue: "API key not found"

**Error**:
```
LangSmithConnectionError: API key must be provided
```

**Solution**:
1. Verify API key is set:
   ```bash
   echo $LANGCHAIN_API_KEY
   ```

2. If empty, export it:
   ```bash
   export LANGCHAIN_API_KEY=your_key_here
   ```

3. Or create `.env` file and use dotenv (see Configuration section)

---

### Issue: Environment variables not loading

**Symptoms**: Agent runs but LangSmith doesn't trace

**Solutions**:

1. **Install dotenv**:
   ```bash
   pnpm add -D dotenv
   ```

2. **Load .env in your code**:
   ```typescript
   // src/index.ts - Add at the very top
   import 'dotenv/config';

   // Rest of imports...
   import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
   ```

3. **Or export manually**:
   ```bash
   export LANGCHAIN_TRACING_V2=true
   export LANGCHAIN_API_KEY=your_key
   pnpm start
   ```

---

### Issue: "Project not found"

**Error**:
```
Project 'xyz' not found
```

**Solution**:
1. Create the project in LangSmith web UI first

2. Or use a different project name:
   ```bash
   export LANGCHAIN_PROJECT=default
   ```

---

### Issue: Traces not appearing

**Symptoms**: Agent runs but no traces in LangSmith

**Solutions**:

1. **Check tracing is enabled**:
   ```bash
   echo $LANGCHAIN_TRACING_V2
   # Should output: true
   ```

2. **Verify internet connection**: LangSmith needs network access

3. **Check API key is valid**:
   - Go to https://smith.langchain.com
   - Settings → API Keys
   - Verify your key is active

4. **Wait a few seconds**: Traces may take 5-10 seconds to appear

5. **Refresh the page**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

### Issue: "langgraph dev" not working

**Error**:
```
command not found: langgraph
```

**Solution**:
```bash
# Install globally
npm install -g @langchain/langgraph-cli

# Or use locally
pnpm add -D @langchain/langgraph-cli
pnpm langgraph dev

# Or use npx
npx langgraph dev
```

---

### Issue: TypeScript compilation errors with dotenv

**Error**:
```
Cannot find module 'dotenv' or its corresponding type declarations
```

**Solution**:
```bash
# Install both dotenv and its types
pnpm add -D dotenv @types/dotenv
```

---

### Issue: Graph doesn't show in Studio

**Symptoms**: LangGraph Studio opens but shows no graph

**Solutions**:

1. **Check langgraph.json exists** and has correct path:
   ```bash
   cat langgraph.json
   ```

2. **Verify the export**:
   ```typescript
   // src/index.ts must export the function
   export { createGreetingGraph };
   ```

3. **Check for TypeScript errors**:
   ```bash
   pnpm build
   # Look for compilation errors
   ```

4. **Try restarting**:
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   pnpm langgraph dev
   ```

---

## Verifying No LLM Usage

### In LangSmith Traces

When viewing a trace:

1. Look at **"Model Calls"** section
   - Should be **0** or **empty**

2. Check **"Tokens"** section
   - Should show **0 tokens used**

3. Verify **execution time**
   - Should be < 100ms (no API calls)

### Proof Points

For your submission, you can show:
- Screenshot with "0 model calls"
- Fast execution time (< 100ms)
- No LLM API keys needed (except LangSmith for tracing)

---

## Example Configuration

Complete working example:

**Directory Structure**:
```
langgraph-typescript/
├── .env                         # LangSmith config (git-ignored)
├── langgraph.json              # Graph configuration
├── mcp.json                    # MCP server config
├── images/
│   └── langsmith-graph.png     # Screenshot
├── src/
│   └── index.ts                # Agent code
├── package.json                # Updated with dotenv
└── README.md                   # Updated with screenshot
```

**.env file**:
```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_abc123xyz789...
LANGCHAIN_PROJECT=langgraph-greeting-agent-typescript
```

**langgraph.json file**:
```json
{
  "dependencies": ["."],
  "graphs": {
    "greeting_agent": "./src/index.ts:createGreetingGraph"
  },
  "env": ".env"
}
```

**package.json (add dotenv)**:
```json
{
  "devDependencies": {
    "dotenv": "^16.0.0",
    "@types/dotenv": "^8.2.0",
    "@langchain/langgraph-cli": "^latest"
  }
}
```

**src/index.ts (add import)**:
```typescript
// Load environment variables first
import 'dotenv/config';

// Then other imports
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

// Rest of code...
```

**Run commands**:
```bash
# Install dependencies
pnpm add -D dotenv @types/dotenv

# Start visualization
pnpm langgraph dev

# Or just run with tracing
pnpm start
```

---

## Summary Checklist

- [ ] Created LangSmith account
- [ ] Generated API key
- [ ] Configured environment variables (.env file)
- [ ] Installed dotenv for automatic loading
- [ ] Ran agent and verified traces appear
- [ ] Started `langgraph dev` for visualization
- [ ] Captured screenshot of graph
- [ ] Added screenshot to README
- [ ] Verified 0 LLM calls in traces
- [ ] Committed and pushed changes

---

## Additional Resources

- **LangSmith Docs**: https://docs.smith.langchain.com/
- **LangGraph TypeScript Docs**: https://langchain-ai.github.io/langgraphjs/
- **LangGraph Studio**: https://github.com/langchain-ai/langgraph-studio
- **LangSmith Support**: support@langchain.com
- **dotenv**: https://www.npmjs.com/package/dotenv

---

**Last Updated**: December 11, 2025
