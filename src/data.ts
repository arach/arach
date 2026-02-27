import type { Bio, Project, TechItem, Account, Site, Agent, CardData } from "./types.js";

// Mutable store — hydrated from remote before commands run, bundled defaults as fallback.

export let bio: Bio = {
  name: "Arach Tchoupani",
  location: "San Francisco / Montreal",
  summary: [
    "Engineer, founder, builder. San Francisco / Montreal.",
    "15 years shipping product across 4 venture-backed companies.",
    "Currently building voice-first tools and exploring what happens",
    "when AI gives one person the leverage of twenty.",
  ],
  stats: [
    { key: "years", val: "15+" },
    { key: "ventures", val: "4" },
    { key: "exit", val: "1" },
    { key: "raised", val: "$15M" },
  ],
};

export let career: string[] = [
  "Co-founded Breathe Life — InsurTech, acquired by Zinnia (2022)",
  "Engineering Manager at Meta — Creators, the blue app",
  "CTO at Primary.com — employee #2, built eng from zero",
  "4x CTO across venture-backed companies in NY and Montreal",
];

export let projects: Project[] = [
  {
    name: "Talkie",
    href: "https://usetalkie.com",
    desc: "Native voice-to-action. Push-to-talk, on-device Whisper, multi-provider LLM routing.",
    stack: "Swift · SwiftUI · local Whisper · Claude/OpenAI/Groq",
  },
  {
    name: "HUD",
    href: "https://hud.arach.dev",
    desc: "Chrome-style UI components for canvas apps. Pan/zoom, panels, command palette, terminal drawer.",
    stack: "React · TypeScript · canvas rendering · component library",
  },
  {
    name: "Devmux",
    href: "https://devmux.arach.dev",
    desc: "Claude Code + dev server in tmux. Auto-detects stack, session persistence, menu bar companion.",
    stack: "Shell · tmux · Bun · macOS menu bar",
  },
  {
    name: "SpeakEasy",
    desc: "Unified TTS library. ElevenLabs, OpenAI, Groq, Gemini, system voices — one CLI.",
    stack: "TypeScript · Node.js · multi-provider abstraction",
  },
  {
    name: "Fabric",
    desc: "Agentic compute fabric. Isolated sandboxes for AI agents with snapshots and state persistence.",
    stack: "Kubernetes · Terraform · container orchestration",
  },
];

export let tech: TechItem[] = [
  { k: "languages", v: "TypeScript, Swift, Go, Rust, Python" },
  { k: "frontend", v: "React, Next.js, Astro, TailwindCSS, SwiftUI" },
  { k: "backend", v: "Node.js, Bun, Hono, PostgreSQL, Redis" },
  { k: "native", v: "Swift, Tauri v2, WebRTC, Whisper" },
  { k: "ai/ml", v: "Claude, OpenAI, Groq, Gemini, ElevenLabs, RLHF" },
  { k: "infra", v: "Kubernetes, Terraform, AWS, GCP, Vercel" },
];

export let accounts: Account[] = [
  { name: "GitHub", handle: "@arach", href: "https://github.com/arach" },
  { name: "X / Twitter", handle: "@arach", href: "https://twitter.com/arach" },
  { name: "LinkedIn", handle: "in/arach", href: "https://linkedin.com/in/arach" },
  { name: "Instagram", handle: "@arach", href: "https://instagram.com/arach" },
  { name: "Email", handle: "arach@tchoupani.com", href: "mailto:arach@tchoupani.com" },
];

export let sites: Site[] = [
  { name: "arach.io", href: "https://arach.io", desc: "Blog, resume, writing" },
  { name: "arach.dev", href: "https://arach.dev", desc: "Portfolio, specs, all projects" },
  { name: "usetalkie.com", href: "https://usetalkie.com", desc: "Talkie app" },
  { name: "hud.arach.dev", href: "https://hud.arach.dev", desc: "HUD components" },
  { name: "devmux.arach.dev", href: "https://devmux.arach.dev", desc: "Devmux" },
  { name: "tchoupani.com", href: "https://tchoupani.com", desc: "Personal" },
];

export let agents: Agent[] = [
  {
    title: "AI-Driven Web Automation: Building the Action Layer",
    href: "https://arach.io/posts/web-for-agents",
    summary: "Introduces robot-a11y — accessibility for AI agents. Retrofitting existing sites and building new frameworks so AI can act on the web.",
  },
  {
    title: "Enhancing Automation and Integration in the AI-driven Era",
    href: "https://arach.io/posts/api-for-the-ai-age",
    summary: "Why static APIs are insufficient for AI automation. Dynamic discovery, adaptive security, and AI-native platform design.",
  },
  {
    title: "AI Theater vs. Real Transformation",
    href: "https://arach.io/posts/ai-theater-vs-real-transformation",
    summary: "A framework to distinguish companies doing real AI transformation from those performing efficiency theater.",
  },
];

export let remotePortrait: string | null = null;
export let motd: string | null = null;

/** Hydrate the store with remote data. Partial updates are fine — only truthy keys overwrite. */
export function hydrate(remote: Partial<CardData>): void {
  if (remote.bio) bio = remote.bio;
  if (remote.career?.length) career = remote.career;
  if (remote.projects?.length) projects = remote.projects;
  if (remote.tech?.length) tech = remote.tech;
  if (remote.accounts?.length) accounts = remote.accounts;
  if (remote.sites?.length) sites = remote.sites;
  if (remote.agents?.length) agents = remote.agents;
  if (remote.portrait) remotePortrait = remote.portrait;
  if (remote.motd) motd = remote.motd;
}
