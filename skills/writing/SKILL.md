---
name: writing
version: 1.1.0
description: |
  Write and edit in Arach's preferred voice. Route technical documentation,
  procedures, implementation briefs, acceptance criteria, and product help
  through Arach Technical English, a living controlled-language standard for
  software and product work. Keep articles, essays, marketing, and
  conversational copy natural rather than forcing controlled language across
  every form of writing.
---

# Arach writing

Write clear prose that matches the job. Preserve facts, distinguish current
behavior from planned behavior, and make the important claim easy to find.

## Choose the writing mode

Before drafting, classify the text:

1. **Technical**: procedures, specifications, implementation briefs,
   acceptance criteria, troubleshooting, product help, and safety text.
   Read `references/arach-technical-english.md` and apply it.
2. **Editorial**: articles, essays, launch posts, marketing pages, and emails.
   Use natural English with concrete details and a recognizable point of view.
   Do not force ASD-STE100 vocabulary or procedural rhythm onto the whole text.
3. **Mixed**: product articles and design documents that contain a technical
   contract. Use editorial prose for the argument and technical English for the
   contract, requirements, instructions, and failure behavior.

If the user asks for strict compliance with another standard, use that standard
directly. Do not describe Arach Technical English as ASD-STE100 compliant.

## Baseline rules

- Lead with the outcome or main claim.
- Use concrete subjects and verbs.
- Keep one important idea in each sentence.
- Prefer exact names, numbers, paths, states, and error conditions.
- Define a term once and then use the same term consistently.
- Separate verified current behavior from proposals, plans, and assumptions.
- Name the source for external facts. Do not use vague attribution.
- Remove filler, inflated claims, and generic conclusions.
- Preserve meaningful uncertainty instead of hiding it behind vague language.
- Use sentence-case headings.
- Avoid em dashes in prose.

## Workflow

1. Identify the audience and the decision or action the text must support.
2. Extract facts and constraints that must survive editing.
3. Select technical, editorial, or mixed mode.
4. Draft the shortest complete version.
5. Verify names, numbers, links, status claims, and current-versus-future tense.
6. Audit technical passages with `references/arach-technical-english.md`.
7. Read the result aloud and remove mechanical or AI-shaped phrasing.

## Product and engineering briefs

A useful brief must state:

- the user-visible outcome;
- the existing system that must remain intact;
- the behavior to add or change;
- failure behavior and recovery;
- explicit exclusions;
- acceptance checks that can prove the claim.

Write requirements so an engineer can implement them and a reviewer can test
them. Avoid aspirational language inside the product contract.

## Articles about unfinished product work

- Say what exists now.
- Say what is being built next.
- Do not make future behavior sound shipped.
- Explain the product boundary as clearly as the opportunity.
- Keep implementation detail only when it makes the product claim credible.
- Use the technical standard for embedded requirements, not for the article's
  entire voice.
