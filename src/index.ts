/**
 * LangGraph Greeting Agent - A simple single-node agent that greets users.
 * This agent does NOT use any LLM, demonstrating LangGraph's state management
 * and graph execution without AI models.
 */

import 'dotenv/config';

import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

/**
 * Define the state schema with input (name) and output (greeting) fields
 */
const GreetingState = Annotation.Root({
  name: Annotation<string>,
  greeting: Annotation<string>,
});

/**
 * Node function that generates a greeting message.
 *
 * This function reads the name from the state and returns a greeting.
 * Returns only the delta (greeting field), not the full state.
 *
 * @param state - Current state containing the user's name
 * @returns Object with the greeting field to update the state
 */
function greetingNode(state: typeof GreetingState.State): Partial<typeof GreetingState.State> {
  const name = state.name;
  const greetingMessage = `Hello, ${name}! Welcome!`;

  // Return only the delta - the greeting field to update
  return { greeting: greetingMessage };
}

/**
 * Create and compile the greeting graph.
 *
 * Graph structure: START → greetingNode → END
 *
 * @returns Compiled StateGraph ready for execution
 */
function createGreetingGraph() {
  // Initialize the graph with the state schema
  const workflow = new StateGraph(GreetingState)
    .addNode("greetingNode", greetingNode)
    .addEdge(START, "greetingNode")
    .addEdge("greetingNode", END);

  // Compile the graph
  const app = workflow.compile();

  return app;
}

/**
 * Main entry point for the greeting agent
 */
async function main() {
  // Create the graph
  const app = createGreetingGraph();

  console.log("LangGraph Greeting Agent (No LLM)");
  console.log("=".repeat(40));

  // Test with a sample name
  let inputState = { name: "Alice" };
  let result = await app.invoke(inputState);

  console.log(`Input: ${inputState.name}`);
  console.log(`Output: ${result.greeting}`);
  console.log();

  // Test with another name
  inputState = { name: "Bob" };
  result = await app.invoke(inputState);

  console.log(`Input: ${inputState.name}`);
  console.log(`Output: ${result.greeting}`);
}

// Export functions for use in other modules
export { createGreetingGraph, greetingNode, GreetingState };

// Run main if this is the entry point
if (require.main === module) {
  main().catch(console.error);
}
