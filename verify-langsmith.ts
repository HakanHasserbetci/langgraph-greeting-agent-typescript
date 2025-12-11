#!/usr/bin/env tsx
/**
 * LangSmith Configuration Verification Script
 *
 * This script checks if LangSmith is properly configured and helps diagnose issues.
 */

interface CheckResult {
  allGood: boolean;
  issues: string[];
}

function checkEnvVars(): CheckResult {
  const requiredVars: Record<string, string> = {
    LANGCHAIN_TRACING_V2: "Should be 'true'",
    LANGCHAIN_API_KEY: "Your LangSmith API key (starts with lsv2_pt_ or ls__)",
    LANGCHAIN_PROJECT: "Your project name (e.g., 'langgraph-greeting-agent-typescript')",
  };

  const optionalVars: Record<string, string> = {
    LANGCHAIN_ENDPOINT: "LangSmith API endpoint (default: https://api.smith.langchain.com)",
  };

  console.log("=".repeat(70));
  console.log("LangSmith Configuration Verification");
  console.log("=".repeat(70));
  console.log();

  let allGood = true;
  const issues: string[] = [];

  console.log("Required Environment Variables:");
  console.log("-".repeat(70));

  for (const [varName, description] of Object.entries(requiredVars)) {
    const value = process.env[varName];

    if (value) {
      // Mask API key for security
      const displayValue = varName.includes("API_KEY") && value.length > 15
        ? value.substring(0, 15) + "..."
        : value;

      console.log(`✓ ${varName}`);
      console.log(`  Value: ${displayValue}`);
      console.log(`  Description: ${description}`);

      // Validate specific values
      if (varName === "LANGCHAIN_TRACING_V2" && value.toLowerCase() !== "true") {
        console.log(`  ⚠️  WARNING: Should be 'true', got '${value}'`);
        issues.push(`${varName} should be 'true'`);
        allGood = false;
      }

      if (varName === "LANGCHAIN_API_KEY") {
        if (!value.startsWith("lsv2_pt_") && !value.startsWith("ls__")) {
          console.log(`  ⚠️  WARNING: API key format looks incorrect`);
          console.log(`     Expected to start with 'lsv2_pt_' or 'ls__'`);
          issues.push("API key format may be incorrect");
          allGood = false;
        }

        if (value.length < 20) {
          console.log(`  ⚠️  WARNING: API key seems too short`);
          issues.push("API key seems too short");
          allGood = false;
        }
      }
    } else {
      console.log(`✗ ${varName}`);
      console.log(`  Status: NOT SET`);
      console.log(`  Description: ${description}`);
      issues.push(`${varName} is not set`);
      allGood = false;
    }

    console.log();
  }

  console.log("Optional Environment Variables:");
  console.log("-".repeat(70));

  for (const [varName, description] of Object.entries(optionalVars)) {
    const value = process.env[varName];
    if (value) {
      console.log(`✓ ${varName}: ${value}`);
    } else {
      console.log(`  ${varName}: Using default`);
      console.log(`  Description: ${description}`);
    }
    console.log();
  }

  return { allGood, issues };
}

function testLangSmithImport(): boolean {
  console.log("Testing LangSmith Package:");
  console.log("-".repeat(70));

  try {
    // Try to import langsmith
    require("langsmith");
    console.log("✓ langsmith package installed");
    return true;
  } catch (e) {
    console.log(`✗ langsmith package not found: ${e}`);
    console.log("  Install with: pnpm add langsmith");
    return false;
  }
}

function testLangChainImport(): boolean {
  console.log("\nTesting LangChain/LangGraph Packages:");
  console.log("-".repeat(70));

  let success = true;

  try {
    require("@langchain/core");
    console.log("✓ @langchain/core installed");
  } catch {
    console.log("✗ @langchain/core not found");
    success = false;
  }

  try {
    require("@langchain/langgraph");
    console.log("✓ @langchain/langgraph installed");
  } catch {
    console.log("✗ @langchain/langgraph not found");
    success = false;
  }

  return success;
}

function createEnvTemplate(): void {
  console.log("\n" + "=".repeat(70));
  console.log("Creating .env Template");
  console.log("=".repeat(70));

  const template = `# LangSmith Configuration
# Get your API key from: https://smith.langchain.com/settings

# Enable tracing (must be 'true')
LANGCHAIN_TRACING_V2=true

# Your LangSmith API key (replace with your actual key)
# Get it from: https://smith.langchain.com/settings (click "Create API Key")
LANGCHAIN_API_KEY=your_api_key_here

# Project name (you can change this)
LANGCHAIN_PROJECT=langgraph-greeting-agent-typescript

# API endpoint (usually don't need to change this)
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
`;

  const fs = require("fs");
  const envPath = ".env.template";

  fs.writeFileSync(envPath, template);

  console.log(`✓ Created template at: ${envPath}`);
  console.log();
  console.log("Next steps:");
  console.log("1. Copy the template: cp .env.template .env");
  console.log("2. Edit .env and replace 'your_api_key_here' with your actual API key");
  console.log("3. Get your API key from: https://smith.langchain.com/settings");
  console.log("   - Click 'Create API Key'");
  console.log("   - Copy the key (starts with lsv2_pt_ or ls__)");
  console.log("   - Paste it in the .env file");
  console.log("4. Make sure to import dotenv in your code:");
  console.log("   import 'dotenv/config'; // Add at the top of src/index.ts");
}

function printNextSteps(allGood: boolean, issues: string[]): void {
  console.log("\n" + "=".repeat(70));
  console.log("Summary");
  console.log("=".repeat(70));

  if (allGood) {
    console.log("✓ All checks passed! LangSmith should be working.");
    console.log();
    console.log("To verify tracing:");
    console.log("1. Make sure dotenv is imported in src/index.ts:");
    console.log("   import 'dotenv/config';");
    console.log("2. Run your agent: pnpm start");
    console.log("3. Go to: https://smith.langchain.com");
    console.log("4. Check the 'Runs' tab in your project");
    console.log("5. You should see traces appearing within 5-10 seconds");
  } else {
    console.log("✗ Issues found:");
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log();
    console.log("How to fix:");
    console.log();
    console.log("Option 1: Create .env file");
    console.log("  1. Run: pnpm tsx verify-langsmith.ts --create-template");
    console.log("  2. Copy .env.template to .env");
    console.log("  3. Edit .env with your API key");
    console.log("  4. Install dotenv: pnpm add -D dotenv");
    console.log("  5. Add to src/index.ts: import 'dotenv/config';");
    console.log();
    console.log("Option 2: Export environment variables");
    console.log("  export LANGCHAIN_TRACING_V2=true");
    console.log("  export LANGCHAIN_API_KEY=your_key_here");
    console.log("  export LANGCHAIN_PROJECT=langgraph-greeting-agent-typescript");
    console.log();
    console.log("Get your API key:");
    console.log("  1. Go to: https://smith.langchain.com/settings");
    console.log("  2. Click 'Create API Key' button");
    console.log("  3. Copy the generated key");
    console.log("  4. Paste it in .env or export command");
  }
}

function main(): void {
  // Load dotenv if available
  try {
    require('dotenv/config');
  } catch {
    console.log("Note: dotenv not loaded (install with: pnpm add -D dotenv)");
    console.log();
  }

  // Check command line arguments
  if (process.argv.includes("--create-template")) {
    createEnvTemplate();
    return;
  }

  // Run all checks
  const { allGood, issues } = checkEnvVars();
  testLangSmithImport();
  testLangChainImport();

  // Print next steps
  printNextSteps(allGood, issues);

  // Exit with appropriate code
  process.exit(allGood ? 0 : 1);
}

main();
