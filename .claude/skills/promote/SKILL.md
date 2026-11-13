---
name: promote
description: Take a fix from a client repo and apply a generic version to the local starter clone (added as a second working folder). Never commits or pushes.
disable-model-invocation: true
argument-hint: "[commit hash or description of the fix]"
---

# /promote

Moves a fix from this client repo into the starter so the next client does not rediscover it. Run it from the client project with the starter added as a second working folder:

```
claude --add-dir ../latz-starter-2027-v1
```

You are the only thing allowed to edit the starter. You never commit or push in either repo. You never touch any other client project.

## 1. Find both repos

- The **client** is the current working directory. Its `package.json` has `latzStarter: { version, commit }`: the starter version it began from.
- The **starter** is the additional working directory whose `package.json` `name` is `latz-starter`. If none is added, stop and say: "Add the starter: claude --add-dir ../latz-starter-2027-v1". If the current directory is itself the starter, stop: promote runs from a client.
- Read `CHANGELOG.md` and `package.json` in the starter, and check whether the starter's tree has uncommitted work (`git status --short` in the starter). If it does, tell Jordan which files, and keep your changes separate from his.

## 2. Identify the fix

`$ARGUMENTS` is a commit hash or a description. If empty, run `git log --oneline -15` and `git status --short` in the client, show them, and ask which change to promote. Read the actual diff (`git show <hash>` or `git diff`). Use a diff, not memory.

Check the starter first: is the fix already there (compare the starter file to the client's, read the CHANGELOG since `latzStarter.version`)? If so, say so and stop.

## 3. Make it generic

- Port only what is a **starter-level** fix: bugs, missing guards, better defaults, new reusable patterns, rule or lesson for `CLAUDE.md`. If it is client design or content (colors, copy, a custom section, a client-only schema), say it does not belong in the starter and stop.
- Strip client-specific values: names, domains, colors, copy, IDs, emails, URLs, `IMAGE_PRESETS` entries, `docs/` content, the CLAUDE.md "Client project" section. Replace with the starter's placeholders.
- Apply the change to the starter's matching file. The starter's file may differ from the client's (the client was themed or edited), so write the starter's version, do not copy the client's file over it. Keep the starter's conventions (`CLAUDE.md`).
- If the fix is a rule or lesson, add one short line to the right section of the starter's `CLAUDE.md`. Do not touch its "Client project" section.
- If it affects how `/schema`, `/section` or `/promote` work, update that skill in the starter.

## 4. Verify in the starter

Run `npm run build` and `npm run lint` in the starter folder. It must build with no Sanity project ID (that is how the starter runs). If `node_modules` is missing there, tell Jordan to run `npm ci` in the starter and stop. Fix what your change broke.

## 5. Version and changelog

- If the starter's `package.json` version or `CHANGELOG.md` already has an **uncommitted** change from an earlier promote (check `git diff` in the starter), append your line to that entry. Do not bump twice.
- Otherwise bump the **patch** version in `package.json` (a new feature is a minor bump: ask Jordan first) and add a new top entry in `CHANGELOG.md` in the existing format:

```
## 1.1.1 (YYYY-MM-DD)

### Fixed
- <generic one-line description>. Found in <client folder name>.
```

Use today's date. Do not run `npm install` to change the lockfile unless the fix is a dependency change.

## 6. Report

Say what changed in the starter (files), the new version, and anything in the client that should be updated too (that is a separate step, one project at a time: do not do it here). Tell Jordan to review with `git diff` in the starter, then commit and push it himself. Never run `git commit` or `git push`.
