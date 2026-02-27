import { parseArgs } from "node:util";

import { showCard } from "./commands/index.js";
import { showProjects } from "./commands/projects.js";
import { showStack } from "./commands/stack.js";
import { showAccounts } from "./commands/accounts.js";
import { showSites } from "./commands/sites.js";
import { showAgents } from "./commands/agents.js";
import { hydrate, hasData } from "./data.js";
import { fetchCardData, ping } from "./remote.js";
import { c } from "./colors.js";

const commands: Record<string, () => void> = {
  projects: showProjects,
  stack: showStack,
  accounts: showAccounts,
  sites: showSites,
  agents: showAgents,
};

function showHelp(): void {
  const lines = [
    "",
    `  ${c.bold}${c.white}arach${c.reset} — who is Arach Tchoupani?`,
    "",
    `  ${c.bold}Usage:${c.reset}`,
    `    ${c.cyan}npx @arach/arach${c.reset}              Full introduction card`,
    `    ${c.cyan}npx @arach/arach projects${c.reset}     Featured projects`,
    `    ${c.cyan}npx @arach/arach stack${c.reset}        Tech stack`,
    `    ${c.cyan}npx @arach/arach accounts${c.reset}     Social links`,
    `    ${c.cyan}npx @arach/arach sites${c.reset}        Web properties`,
    `    ${c.cyan}npx @arach/arach agents${c.reset}       AI agent writing & experiments`,
    "",
    `  ${c.bold}Options:${c.reset}`,
    `    ${c.cyan}--help${c.reset}, ${c.cyan}-h${c.reset}            Show this help`,
    `    ${c.cyan}--version${c.reset}, ${c.cyan}-v${c.reset}         Show version`,
    "",
    `  ${c.dim}https://arach.io${c.reset}  ·  ${c.dim}https://arach.dev${c.reset}  ·  ${c.dim}https://github.com/arach${c.reset}`,
    "",
  ];
  console.log(lines.join("\n"));
}

function showVersion(): void {
  console.log("arach 0.0.3");
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });

  if (values.help) return showHelp();
  if (values.version) return showVersion();

  // Fetch data from arach.io
  const remote = await fetchCardData();
  if (remote) {
    hydrate(remote);
  }

  if (!hasData()) {
    console.log(`\n  ${c.dim}Could not reach arach.io — try again in a moment.${c.reset}`);
    console.log(`  ${c.dim}https://arach.io/agents${c.reset}\n`);
    process.exit(1);
  }

  const sub = positionals[0];
  ping("run", { command: sub || "card" });

  if (sub) {
    const cmd = commands[sub];
    if (cmd) {
      console.log();
      cmd();
      console.log();
    } else {
      console.error(`Unknown command: ${sub}\n`);
      showHelp();
      process.exit(1);
    }
  } else {
    console.log();
    showCard();
    console.log();
  }
}

main().catch(() => {
  showHelp();
});
