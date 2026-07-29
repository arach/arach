---
standard: Arach Technical English
short_name: ATE
version: 2026.1
status: living
published: 2026-07-27
---

# Arach Technical English

Arach Technical English (ATE) is a controlled form of English for software and
product work. It helps a person or an agent turn text into the intended action
without guessing.

ATE values exact meaning over formal tone. It applies to specifications,
procedures, product help, interface text, implementation briefs, error messages,
and acceptance criteria. It does not govern essays, personal writing, or brand
voice unless the author chooses to use it there.

## Goals

ATE has four goals:

1. **Exactness**: one reasonable interpretation for each requirement.
2. **Actionability**: the reader can identify the next action.
3. **Truthfulness**: the text distinguishes fact, inference, and intent.
4. **Durability**: the text remains useful after the immediate conversation.

## Conformance

A technical passage conforms to ATE when it follows all rules that apply to its
content type. A document can contain both ATE passages and natural editorial
prose. Marking a whole document as ATE is optional.

Use these words precisely:

- **must**: a requirement necessary for correctness or acceptance;
- **must not**: a prohibited behavior;
- **should**: a recommendation with a valid reason to deviate;
- **may**: explicit permission;
- **can**: capability;
- **will**: a stated future action, not a requirement.

Do not use `may` to mean possibility. Use `can`, `might`, or name the condition.

## Core rules

### Meaning

**ATE-001: Write one main idea in each sentence.**

Split requirements that have independent conditions, outcomes, or failure
states.

**ATE-002: Use one term for one concept.**

Do not rotate synonyms for variety. If the interface calls it a `task`, do not
also call it a `thread`, `conversation`, or `session` unless those are different
concepts.

**ATE-003: Give each action an explicit actor when ownership matters.**

Write `Talkie sends the instruction to the Mac`, not `The instruction is sent`.

**ATE-004: Prefer concrete verbs.**

Write `validate`, `store`, `send`, `stop`, or `show`. Avoid verbs that hide the
operation, such as `handle`, `support`, `facilitate`, or `manage`, unless the
broader meaning is intentional.

**ATE-005: Put conditions before dependent actions.**

Write `If the task is active, steer the current turn.`

**ATE-006: Make references exact.**

Prefer a file name, control label, state name, version, or date over `this`,
`that`, `above`, `recent`, or `later` when the reference could be ambiguous.

### Truth and status

**ATE-010: Separate current behavior from planned behavior.**

Use present tense only for verified current behavior. Use future tense or an
explicit status label for work that is planned or in progress.

**ATE-011: Separate fact, inference, and recommendation.**

Name the evidence for a fact. Label an inference when the evidence does not
prove the conclusion. Use `should` for a recommendation.

**ATE-012: Do not turn partial success into total failure.**

If the primary action succeeds and a secondary action fails, preserve and
report the successful result. Example: a speech failure must not hide a
successful agent response.

**ATE-013: Do not claim a state before the system verifies it.**

A label such as `connected`, `locked`, `saved`, or `published` must correspond
to an observable state.

**ATE-014: State uncertainty at its source.**

Replace general hedging with the missing fact or unverified assumption. Write
`The build has not run on iOS 19` instead of `The change should probably work`.

### Procedures

**ATE-020: Put one action in each numbered step.**

A result check can remain in the same step when it immediately verifies the
action.

**ATE-021: Use the imperative for user instructions.**

Write `Select lane 2.` Do not write `The user should select lane 2.`

**ATE-022: Put prerequisites and warnings before the action.**

The reader must see a condition before reaching the action that depends on it.

**ATE-023: Name the expected result.**

After an action whose success is not obvious, state the visible or measurable
result.

**ATE-024: Give a recovery action for recoverable failure.**

Name the unavailable component, preserve safe state, and tell the reader what
to do next.

### Requirements and briefs

**ATE-030: Describe observable behavior.**

Replace intent such as `make the deck reliable` with the state transition or
failure behavior that proves reliability.

**ATE-031: Preserve the existing system boundary.**

Name the component that remains authoritative. State any prohibited fallback
that would violate that boundary.

**ATE-032: Give each requirement one strength.**

Do not mix `must`, `should`, and optional behavior in one requirement.

**ATE-033: State exclusions.**

An implementation brief must name adjacent work that is intentionally outside
the slice when a reader could reasonably include it.

**ATE-034: Make acceptance criteria executable.**

An acceptance criterion must include a setup, an action, and an observable
result. Do not use `works correctly` as a result.

### Interface and error text

**ATE-040: Use the product's exact nouns and state names.**

Interface text, documentation, logs, and tests should use the same term for the
same state.

**ATE-041: State the problem before the recovery action.**

Example: `The Mac is unavailable. Reconnect the paired Mac and try again.`

**ATE-042: Do not blame the user.**

Describe the invalid or unavailable state. Do not write `You failed to` or
`You entered the wrong value`.

**ATE-043: Keep an error proportional to its consequence.**

Do not use urgent or destructive language for a recoverable local problem.

### Style

**ATE-050: Prefer short sentences, but do not remove necessary conditions.**

Sentence length is a signal, not a conformance test. Split a sentence when it
contains more than one decision.

**ATE-051: Prefer active voice.**

Use passive voice only when the actor is unknown, irrelevant, or deliberately
hidden for security.

**ATE-052: Avoid decorative modifiers.**

Remove adjectives and adverbs that do not change the reader's action or model.

**ATE-053: Avoid ambiguous pronouns.**

Repeat the noun when `it`, `this`, `that`, or `they` can refer to more than one
thing.

**ATE-054: Avoid unnecessary noun clusters.**

Expand a cluster when a reader could group the nouns in more than one way.

**ATE-055: Use sentence-case headings.**

**ATE-056: Do not use em dashes in prose.**

Use a sentence, comma, colon, or parentheses to show the relationship.

## Document patterns

### Procedure

1. State the prerequisite.
2. Give one action.
3. State the expected result.
4. Give recovery guidance when failure is recoverable.

### Product contract

1. User-visible outcome.
2. Existing authoritative system.
3. Required state transitions.
4. Failure and recovery behavior.
5. Exclusions.
6. Acceptance criteria.

### Status report

1. Verified outcome.
2. Evidence or check performed.
3. Remaining uncertainty or blocker.
4. Next authorized action.

## Review checklist

Ask these questions for every technical passage:

1. Can the reader identify the actor, action, object, and condition?
2. Can a sentence have two reasonable interpretations?
3. Does one term refer to more than one concept?
4. Does a requirement describe behavior that a reviewer can observe?
5. Does failure text preserve any successful primary result?
6. Can a reviewer run the acceptance check without guessing?
7. Is every current-versus-planned claim in the correct tense?

## Influences

ATE is an original standard for Arach's software and product work. It draws on
the controlled-language tradition, especially ASD-STE100 Simplified Technical
English, and on common requirements-writing practice.

ASD-STE100 remains a separate copyrighted standard. ATE does not reproduce its
dictionary and must not be described as ASD-STE100 compliant.

- ASD-STE100 official site: https://www.asd-ste100.org/
- ASD-STE100 current-issue request: https://www.asd-ste100.org/STE_downloads.html

## Maintenance

Use the `YYYY.N` version format. Increment `N` for each published revision in a
calendar year. Start the next year at `.1`.

Keep rule IDs stable. Add a new rule with a new ID. If a rule changes meaning,
record the change in `CHANGELOG.md`. If a rule is removed, mark it retired in
the changelog and do not reuse its ID.
