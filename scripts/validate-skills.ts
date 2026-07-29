import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(repositoryRoot, "skills");
const errors: string[] = [];

function fail(file: string, message: string): void {
  errors.push(`${path.relative(repositoryRoot, file)}: ${message}`);
}

async function exists(file: string): Promise<boolean> {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await markdownFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }

  return files;
}

const entries = await readdir(skillsRoot, { withFileTypes: true });
const skillDirectories = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (skillDirectories.length === 0) {
  errors.push("skills: no skill directories found");
}

const readmePath = path.join(repositoryRoot, "README.md");
const readme = await readFile(readmePath, "utf8");

for (const directoryName of skillDirectories) {
  const directory = path.join(skillsRoot, directoryName);
  const skillPath = path.join(directory, "SKILL.md");

  if (!await exists(skillPath)) {
    fail(directory, "missing SKILL.md");
    continue;
  }

  const source = await readFile(skillPath, "utf8");
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) {
    fail(skillPath, "missing YAML frontmatter");
    continue;
  }

  const name = frontmatter[1].match(/^name:\s*([^\n]+)$/m)?.[1]?.trim();
  if (!name) {
    fail(skillPath, "frontmatter must contain a name");
  } else {
    if (name !== directoryName) {
      fail(skillPath, `name '${name}' must match directory '${directoryName}'`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
      fail(skillPath, "name must use lowercase letters, numbers, and hyphens");
    }
    if (name.length > 64) {
      fail(skillPath, "name exceeds 64 characters");
    }
  }

  if (!/^description:\s*(?:\||>\s*|\S.+)$/m.test(frontmatter[1])) {
    fail(skillPath, "frontmatter must contain a description");
  }

  if (!readme.includes(`skills/${directoryName}/SKILL.md`)) {
    fail(readmePath, `catalog does not link to '${directoryName}'`);
  }

  const referenceMatches = source.matchAll(/(?:\(|`)(references\/[^)`\s]+)(?:\)|`)/g);
  for (const match of referenceMatches) {
    const referencePath = path.join(directory, match[1]);
    if (!await exists(referencePath)) {
      fail(skillPath, `missing referenced file '${match[1]}'`);
    }
  }

  for (const markdownPath of await markdownFiles(directory)) {
    const markdown = await readFile(markdownPath, "utf8");
    if (markdown.includes("/Users/")) {
      fail(markdownPath, "contains a machine-specific /Users path");
    }
    if (!markdown.endsWith("\n")) {
      fail(markdownPath, "must end with one newline");
    }
    if (/\n\n$/.test(markdown)) {
      fail(markdownPath, "contains a blank line at end of file");
    }
    if (/[^\S\r\n]+$/m.test(markdown)) {
      fail(markdownPath, "contains trailing whitespace");
    }
  }
}

if (errors.length > 0) {
  console.error(`Skill validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${skillDirectories.length} skills: ${skillDirectories.join(", ")}`);
}
