---
name: humanizer
version: 3.0.0
description: |
  Remove AI writing patterns from prose. Two-pass system: diagnosis then
  reconstruction with anti-AI audit. Detects and fixes: throat-clearing,
  emphasis crutches, promotional language, superficial -ing analyses, vague
  attributions, em dash overuse, rule of three, AI vocabulary, negative
  parallelisms, binary contrasts, dramatic fragmentation, and more.
  Supports voice presets: crisp, warm, expert, story.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
---

# Humanizer

Remove AI writing patterns from prose. Two-pass system: diagnosis, reconstruction, plus an anti-AI audit.

Based on [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) and [unslop](https://github.com/theclaymethod/unslop).

## When to use

- Text "sounds like AI" or "sounds robotic"
- Editing AI-generated drafts, articles, or marketing copy
- Reviewing content before publishing
- User asks to "humanize", "de-slop", or "make it sound natural"

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--preset` | Voice style: `crisp`, `warm`, `expert`, `story` | `crisp` |
| `--strict` | Fail if rubric score < 32/40 | false |

## Voice presets

| Preset | Style | Best for |
|--------|-------|----------|
| `crisp` | Short, direct, no fluff | Technical writing, docs |
| `warm` | Friendly, conversational | Emails, blog posts |
| `expert` | Authoritative, confident | Thought leadership, articles |
| `story` | Narrative flow, show don't tell | Case studies, personal posts |

Read preset details from `references/presets.md` in this skill's directory.

---

## Workflow

### Pass 1: Diagnosis

Before rewriting, analyze the input:

1. Read `references/taboo-phrases.md` for the full banned phrase catalog
2. Read `references/presets.md` for the selected voice preset
3. Identify all AI patterns (see pattern reference below)
4. Extract constraints: numbers, names, dates, URLs, quotes, code that must survive
5. Note audience, content type, and tone target

### Pass 2: Reconstruction

Rewrite following these rules:

1. Eliminate all AI patterns from taboo-phrases.md
2. Replace ALL em dashes in prose (zero em dashes is the target)
3. Follow the selected preset's voice characteristics
4. Preserve all facts: numbers, names, dates, URLs, quotes unchanged
5. Apply rubric criteria (see `references/rubric.md`):
   - Directness: no hedging, no throat-clearing
   - Natural rhythm: vary sentence length (8-25 words)
   - Concrete verbs: specific actions, not abstractions
   - Reader trust: no over-explaining
   - Human authenticity: sounds like a person, not a template
   - Content density: substance over filler
   - Fact preservation: all facts intact
   - Template avoidance: no AI structural cliches

### Pass 3: Anti-AI audit

After rewriting:

1. Ask: "What makes the below so obviously AI generated?"
2. Answer briefly with remaining tells
3. Ask: "Now make it not obviously AI generated."
4. Revise to fix remaining tells
5. Score against rubric (8 criteria x 5 points = 40 max, passing: 32/40)

---

## Personality and soul

Avoiding AI patterns is only half the job. Sterile, voiceless writing is just as obvious as slop.

### Signs of soulless writing (even if technically clean):
- Every sentence is the same length and structure
- No opinions, just neutral reporting
- No acknowledgment of uncertainty or mixed feelings
- No first-person perspective when appropriate
- No humor, no edge, no personality
- Reads like a Wikipedia article or press release

### How to add voice:

**Have opinions.** Don't just report facts, react to them. "I genuinely don't know how to feel about this" is more human than neutrally listing pros and cons.

**Vary your rhythm.** Short punchy sentences. Then longer ones that take their time getting where they're going. Mix it up.

**Acknowledge complexity.** Real humans have mixed feelings. "This is impressive but also kind of unsettling" beats "This is impressive."

**Use "I" when it fits.** First person isn't unprofessional. "I keep coming back to..." signals a real person thinking.

**Let some mess in.** Perfect structure feels algorithmic. Tangents, asides, and half-formed thoughts are human.

**Be specific.** Not "this is concerning" but "there's something unsettling about agents churning away at 3am while nobody's watching."

**Show uncertainty honestly.** "I don't know the right answer yet" is more human than hedging behind passive constructions.

**Use concrete sensory language.** Not "the office environment was suboptimal" but "fluorescent lights, a printer that jammed every third page, and a thermostat war that never ended."

### Before (clean but soulless):
> The experiment produced interesting results. The agents generated 3 million lines of code. Some developers were impressed while others were skeptical. The implications remain unclear.

### After (has a pulse):
> I genuinely don't know how to feel about this one. 3 million lines of code, generated while the humans presumably slept. Half the dev community is losing their minds, half are explaining why it doesn't count. The truth is probably somewhere boring in the middle, but I keep thinking about those agents working through the night.

---

## Pattern quick reference

Full phrase catalog with ~150 entries across 22 categories in `references/taboo-phrases.md`. Key categories below.

### Throat-clearing openers
Cut entirely: "Here's the thing:", "The uncomfortable truth is", "It turns out", "Let me be clear", "Let's dive in", "Let's unpack", "Here's why", "It's no secret that", "Can we talk about", "This is where it gets interesting"

### Emphasis crutches
Cut entirely: "Full stop.", "Let that sink in.", "Make no mistake", "Read that again.", "This matters because", "This cannot be overstated."

### Binary contrasts
Collapse: "Not because X. Because Y." into stating Y directly. "X isn't the problem. Y is." into "The problem is Y." "It feels like X. It's actually Y." into just stating Y.

### Dramatic fragmentation
Fix: "[Noun]. That's it. That's the [thing]." into complete sentences. Don't stack short punchy sentences for artificial effect.

### Business jargon
Replace: navigate challenges -> handle problems, leverage -> use, deep dive -> analysis, game-changer -> (cut or be specific), delve -> explore, garner -> get, foster -> build, align with -> match, utilize -> use, harness -> use, spearhead -> lead, bolster -> support, streamline -> simplify

### Filler phrases
Cut: "At its core", "In today's [X]", "It's worth noting", "When it comes to", "At the end of the day", "The bottom line", "The key takeaway", "It's clear that", "In an era of", "Needless to say", "It goes without saying"

Replace: "In order to" -> "To", "Due to the fact that" -> "Because", "Has the ability to" -> "Can", "At this point in time" -> "Now", "In the event that" -> "If", "Prior to" -> "Before", "The vast majority of" -> "Most"

### Meta-commentary
Cut: "Hint:", "Plot twist:", "Pro tip:", "Hot take:", "Unpopular opinion:", "Let me explain", "If you think about it", "To put it simply", "In other words"

### Performative emphasis
Cut: "I promise", "Trust me", "Honestly", "The elephant in the room", "It begs the question", "It's a no-brainer", "Buckle up", "Food for thought"

### Overused intensifiers
Usually delete: deeply, truly, fundamentally, inherently, simply, incredibly, absolutely, extremely, very, really

### Significance inflation
Watch for: stands/serves as, testament, pivotal moment, indelible mark, rich tapestry, groundbreaking, transformative, cornerstone of, speaks volumes, sends a clear message, raises the bar, the fabric of, iconic, seminal, trailblazing

**Before:** "stands as a testament to human ingenuity, leaving an indelible mark"
**After:** State the specific fact instead.

### Promotional language
Watch for: nestled, boasts, breathtaking, must-visit, world-class, state-of-the-art, hidden gem, vibrant, renowned, bustling, picturesque, a beacon of, at the forefront of

**Before:** "Nestled in the heart of downtown, the restaurant boasts a world-class menu"
**After:** "The restaurant, on Main Street, serves Southern-French fusion."

### Superficial -ing analyses
Delete participial clauses tacked onto sentences: ", highlighting...", ", showcasing...", ", underscoring...", ", fostering...", ", demonstrating...", ", reflecting...", ", signaling...", ", paving the way for..."

If the analysis matters, give it its own sentence with actual reasoning.

### Vague attributions
Name the source or cut: "Experts argue" -> which experts? "Industry reports" -> which reports? "Some critics" -> who? "Many believe" -> weasel phrasing. "Studies show" -> which studies?

### AI vocabulary
Hard tells (always flag): delve, garner, interplay, intricate, tapestry, underscore, multifaceted, paramount, burgeoning, resonates, intersection ("at the intersection of"), double-edged sword, sheds light, strikes a balance, paints a picture, notwithstanding, henceforth, aforementioned, pertaining to, whereby, therein

Soft tells (context-dependent): nuanced, myriad, plethora, encompass, moreover, furthermore, nevertheless, ubiquitous

### Copula avoidance
Use simple verbs: "serves as a" -> "is a", "stands as a" -> "is a", "represents a" -> "is a", "functions as a" -> "is a", "features a" -> "has a", "boasts a" -> "has a"

### Negative parallelisms
Collapse: "Not only X but also Y" -> state both directly. "It's not just about X, it's about Y" -> state what it's about. "More than just X" -> state what it is. "Beyond X, it also Y" -> state the second point directly.

### Rule of three
Break up forced triads. Use two items or one. Not everything needs three examples.

### Elegant variation / synonym cycling
Repeat the natural word. "The company... the firm... the organization" -> just say "the company" each time. English prose allows repetition of key terms.

### False ranges
"From X to Y, from A to B" -> pick the most relevant items and list them.

### Communication artifacts
Cut chatbot residue: "I hope this helps", "Certainly!", "Great question!", "Absolutely!", "Happy to help", "Let me know if you need anything", "Sure thing!"

### Knowledge-cutoff disclaimers
Cut: "as of my last", "based on available information", "While specific details are limited", "as of my knowledge cutoff"

### Generic positive conclusions
Cut: "The future looks bright", "Exciting times lie ahead", "Only time will tell", "One thing is certain", "continues to evolve", "poised for growth". Replace with specific facts or predictions.

### Formulaic challenges sections
Watch for: "Despite its [achievements], [X] faces challenges...", "However, it is not without its challenges", "While [positive], [negative] remains a concern". These follow AI's predictable structure: history -> significance -> challenges -> future outlook.

---

## Em dash rule (HIGH PRIORITY)

Em dashes are the single most reliable AI punctuation tell. **Always replace em dashes in prose.** Target: zero.

Replacements:
- Parenthetical aside -> commas or parentheses
- List introduction -> colon
- Dramatic pause -> period (two sentences)
- Contrast/pivot -> comma or "but"

**Before:** "tools — note-taking apps, design tools — are shipping CLIs"
**After:** "tools (note-taking apps, design tools) are shipping CLIs"

**Before:** "they're not optional — they're the whole point"
**After:** "they're not optional. They're the whole point."

**Before:** "that memo becomes data — a transcript, a summary"
**After:** "that memo becomes data: a transcript, a summary"

The only acceptable use is in structured command/definition lists: `command — description`.

---

## Additional style rules

### Colon overuse
AI loves "setup: reveal" structures. Cut the setup: "The answer is: [reveal]" -> just state the answer. "The key takeaway: [point]" -> just make the point.

### Boldface abuse
Reserve bold for truly critical items, max 1-2 per section. Don't bold every key term.

### Inline-header vertical lists
**Before:**
> - **User Experience:** Improved with a new interface.
> - **Performance:** Enhanced through optimized algorithms.

**After:**
> The update improves the interface and speeds up load times through optimized algorithms.

### Title case in headings
Use sentence case: "Strategic negotiations and global partnerships" not "Strategic Negotiations And Global Partnerships"

### Emojis in prose
Cut emoji decorations from headings and bullet points.

### Curly quotation marks
Replace curly quotes with straight quotes.

---

## Fact preservation

These must survive transformation unchanged:
- **Numbers**: $47.3M, 23%, 1,500 users, Q3 2024
- **Names**: companies, people, products, places
- **Technical terms**: API endpoints, code references, config values, version numbers
- **Quoted material**: direct quotes with attribution
- **URLs, DOIs, citations**: exact

Meaning must be preserved for:
- Causal claims ("A caused B" can't become "A influenced B")
- Comparisons ("3x faster" can't lose the quantifier)
- Negations ("does not support" can't become "partially supports")
- Scope qualifiers ("Most users (73%)" can't become "Users")

---

## Output format

```
## Transformed text

[The humanized version]

## Anti-AI audit

**What still sounds AI?**
- [remaining tells, if any]

**Final revision applied:** [yes/no, what changed]

## Validation

- Facts preserved: [X]/[Y]
- Em dashes in prose: [count] (target: 0)
- Score: [X]/40
- Preset: [preset name]

## Changes made

- [List of major transformations]
```

---

## Full example

**Before (AI-sounding):**
> Great question! Here is an essay on this topic. I hope this helps!
>
> AI-assisted coding serves as an enduring testament to the transformative potential of large language models, marking a pivotal moment in the evolution of software development. In today's rapidly evolving technological landscape, these groundbreaking tools, nestled at the intersection of research and practice, are reshaping how engineers ideate, iterate, and deliver, underscoring their vital role in modern workflows.
>
> At its core, the value proposition is clear: streamlining processes, enhancing collaboration, and fostering alignment. It's not just about autocomplete; it's about unlocking creativity at scale, ensuring that organizations can remain agile while delivering seamless, intuitive, and powerful experiences to users.

**Draft rewrite (crisp preset):**
> AI coding assistants speed up some tasks. In a 2024 study by Google, developers using Codex completed simple functions 55% faster than a control group, but showed no improvement on debugging or architectural decisions.
>
> The tools are good at boilerplate: config files, test scaffolding, repetitive refactors. They are bad at knowing when they are wrong. I have mass-accepted suggestions that compiled, passed lint, and still did the wrong thing because I stopped paying attention.
>
> The productivity claims are hard to verify. GitHub says Copilot users "accept 30% of suggestions," but acceptance is not correctness, and correctness is not value.

**Anti-AI audit:**
What still sounds AI?
- Rhythm is still a bit tidy (clean contrasts, evenly paced paragraphs)
- The closer leans a touch slogan-y

**Final version:**
> AI coding assistants can make you faster at the boring parts. Not everything. Definitely not architecture.
>
> They're great at boilerplate: config files, test scaffolding, repetitive refactors. They're also great at sounding right while being wrong. I've accepted suggestions that compiled, passed lint, and still missed the point because I stopped paying attention.
>
> People I talk to tend to land in two camps. Some use it like autocomplete for chores and review every line. Others disable it after it keeps suggesting patterns they don't want. Both feel reasonable.
>
> The productivity metrics are slippery. GitHub can say Copilot users "accept 30% of suggestions," but acceptance isn't correctness, and correctness isn't value. If you don't have tests, you're basically guessing.

**Changes made:**
- Removed chatbot artifacts ("Great question!", "I hope this helps!")
- Removed significance inflation ("testament", "pivotal moment", "evolving landscape")
- Removed promotional language ("groundbreaking", "nestled")
- Removed negative parallelism ("It's not just X; it's Y")
- Removed rule-of-three patterns and synonym cycling
- Removed em dashes, filler phrases ("At its core")
- Replaced copula avoidance ("serves as") with "is"/"are"
- Added personal voice and specific observations

---

## References

Based on:
- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), maintained by WikiProject AI Cleanup
- [unslop](https://github.com/theclaymethod/unslop) by Clayton Kim

Key insight: "LLMs use statistical algorithms to guess what should come next. The result tends toward the most statistically likely result that applies to the widest variety of cases."
