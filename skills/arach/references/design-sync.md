# Design sync

Use `/design-sync` to push a repository's component library to a
`claude.ai/design` project. The design agent must build with the real component
system instead of a generic substitute.

## Ownership

`/design-sync` owns only these design-system artifacts at the remote project
root:

- `components/**`
- `_preview/**`
- `_vendor/**`
- `tokens/**`
- `fonts/**`
- `guidelines/**`
- `_ds_bundle.js`
- `_ds_bundle.css`
- `styles.css`
- `README.md`
- `_ds_sync.json`
- `_ds_needs_recompile`

Designs and hand-authored files outside those paths must survive every sync.

## Source ownership

Make durable changes in the repository's committed `.design-sync/` directory.
Do not hand-edit generated remote files.

| Input | Owns |
| --- | --- |
| `config.json` | Component map, prop contracts, overrides, glob scopes, and project pin |
| `conventions.md` | Usage guidance read by the design agent |
| `previews/<Name>.tsx` | Hand-authored preview cards |
| `*.head.css` | Brand tokens and fonts injected at `:root` |
| `NOTES.md` | Repository-specific risks and re-sync notes |

If a generated artifact is wrong, fix its repository source and synchronize
again.

## Workflow

1. Run `/design-sync .` from a settled repository state. The first sync creates
   and pins a project.
2. Build designs in the pinned `claude.ai/design` project.
3. Re-run `/design-sync` after component or token changes. Review the proposed
   writes and deletions before approval.
4. Commit the `.design-sync/` inputs that reproduce the remote component
   system.

Run one sync session per project at a time. A mid-refactor checkout uploads
work in progress. A crash before the anchor update leaves the project
unanchored; the next sync must verify and upload again.

`check_design_system` can report Tailwind `--tw-*` internals as unclassified
tokens. Treat this as advisory upstream noise unless the design-sync tool
changes its contract.
