---
alwaysApply: true
scene: git_message
---
- Les messages de commit doivent etre toujours en Français
## Format

Use Conventional Commits: `<type>(<scope>): <subject>`

- Subject: imperative mood, sentence case, no period, max 72 chars
- Scope: one lowercase noun — the module, file, or domain touched
- Body (optional): explain *why*, not what — wrap at 72 chars
- Footer (optional): `Closes #123`, `BREAKING CHANGE: <desc>`

## Types

| Type     | When to use                                      |
|----------|--------------------------------------------------|
| feat     | New user-facing feature                          |
| fix      | Bug fix                                          |
| refactor | Code change with no behavior change              |
| perf     | Performance improvement                          |
| style    | Formatting, whitespace — no logic change         |
| test     | Add or update tests                              |
| docs     | Documentation only                               |
| chore    | Build, tooling, dependencies, CI config          |
| revert   | Revert a previous commit                         |

## Rules

1. One logical change per commit — never bundle unrelated changes
2. Subject answers: "If applied, this commit will …"
3. Never mention file names in the subject (they are in the diff)
4. Never use vague verbs: update, change, modify, fix things, misc
5. Prefer specific verbs: add, remove, replace, extract, rename,
   expose, hide, simplify, validate, cache, skip, reorder
6. Breaking changes: add `!` after type — `feat(api)!: …`
   and always add a `BREAKING CHANGE:` footer


## Examples

```
feat(auth): add OAuth2 login with GitHub provider

Replaces the legacy username/password flow.
Users are redirected to /dashboard after consent.

Closes #88
```

```
fix(cart): prevent duplicate items on rapid double-click
```

```
refactor(logger): extract formatter into standalone module
```

```
chore(deps): upgrade Vite to 5.2 and align Rollup peer deps
```

```
perf(search): cache autocomplete results for 60 s in Redis
```

## Anti-patterns (never generate these)

- `fix: bug fix`
- `update: various changes`
- `feat: add new feature to the application`
- `WIP: not finished yet`
- `fix(auth.ts): update auth.ts`
