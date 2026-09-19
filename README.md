# Arach

This repository contains Arach's public profile CLI and reusable agent skills.
GitHub is the source of truth for installing the skills across Codex, Claude
Code, and other agents supported by the [Skills CLI](https://skills.sh/).

## Agent skills

| Skill | Purpose |
| --- | --- |
| [`arach`](skills/arach/SKILL.md) | Personal project context, conventions, and workflow routing |
| [`writing`](skills/writing/SKILL.md) | Arach's technical, editorial, and mixed writing system |
| [`humanizer`](skills/humanizer/SKILL.md) | Anti-AI-pattern diagnosis and prose reconstruction |
| [`dewey-docs`](skills/dewey-docs/SKILL.md) | Dewey documentation and agent-readiness workflows |

List the published skills without installing them:

```bash
npx skills add arach/arach --list
```

Install every skill globally for every supported agent on the current
operating-system account:

```bash
npx skills add arach/arach --all --global
```

Install a selected set:

```bash
npx skills add arach/arach \
  --skill arach writing \
  --agent '*' \
  --global \
  --yes
```

Update globally installed skills from their recorded GitHub sources:

```bash
npx skills update --global --yes
```

Global installation is local to an operating-system account. Run the install
command on each machine or separate operating-system account that should have
the skills. Signing into another agent account does not copy local skill files.

## Skill development

Each skill lives at `skills/<name>/SKILL.md`. Supporting material stays inside
that skill's directory so a GitHub install remains self-contained.

Run the repository checks before publishing:

```bash
bun run validate:skills
bun run build
npx skills add . --list
```

The skill validator checks frontmatter, directory names, relative references,
portable paths, Markdown whitespace, and the public README catalog. GitHub
Actions runs the same checks for pull requests and pushes to `main`.

## Profile CLI

Run the public profile card:

```bash
npx @arach/arach
```

From this checkout, Bun is the local command:

```bash
cd ~/dev/arach
bun arach                 # intro card
bun arach ghostty         # theme preview
bun arach ghostty apply lacquer
bun ghostty               # same as arach ghostty
```

Available commands:

```text
npx @arach/arach projects     # Featured projects
npx @arach/arach stack        # Tech stack
npx @arach/arach accounts     # Social links
npx @arach/arach sites        # Web properties
npx @arach/arach agents       # Agent writing and experiments
npx @arach/arach ghostty      # Ghostty themes and named flavors
npx @arach/arach --help       # Usage information
```

## Links

- [arach.io](https://arach.io): writing and resume
- [arach.dev](https://arach.dev): portfolio, specifications, and projects
- [GitHub](https://github.com/arach)
- [X](https://x.com/arach)
- [LinkedIn](https://linkedin.com/in/arach)

## License

[MIT](LICENSE)
