# Design iteration loop

Use this loop to improve a rendered component, screen, theme, or landing page.
The loop is bounded: ideate, scope, execute, judge, and decide.

## Frame the loop

Define these values before editing:

- `goal`: the observable improvement;
- `rubric`: explicit criteria such as hierarchy, spacing, legibility, brand
  adherence, restraint, and fit with the product goal;
- `render`: the command or route that produces comparable pixels;
- `budget`: maximum rounds, parallel attempts, or elapsed time.

The rubric and render are required. Judge the rendered result, not only the
diff.

## Run the loop

1. Inspect the current render. Propose two to four directions with a reason tied
   to the goal.
2. Remove weak directions before implementation.
3. Work inline for one local direction. Use isolated branches or worktrees when
   independent directions touch the same files.
4. Render every credible direction in the same viewport and state.
5. Ask an independent judge to score the renders against the written rubric
   when the available agent supports delegation. The Scout review loop can
   provide an outside judge.
6. Ship the strongest direction, synthesize compatible strengths, or run one
   more bounded round with the judge's concrete findings.

Stop when the result clears the rubric, no candidate improves the current best
for two rounds, or the budget is spent. Preserve the existing visual system
unless the user explicitly authorizes a redesign.
