---
name: write-release-notes
description: Draft concise, user-facing release notes in English from verified Git tags, commits, pull requests, and diffs. Use when asked to write, prepare, update, or review release notes, changelogs, GitHub Release descriptions, or a summary of changes between application versions.
---

# Write Release Notes

Create accurate English release notes from repository evidence. Do not infer shipped behavior from filenames or unfinished work.

## Workflow

1. Read repository instructions and release configuration before running commands.
2. Inspect the current branch, working tree, package version, tags, and tag-triggered workflows.
3. Identify the previous released tag and the exact target commit or tag. If the target is not specified, use `HEAD` and state that assumption.
4. Review commits and diffs between the previous release and target. Inspect relevant code when commit messages are vague.
5. Keep committed target changes separate from staged, unstaged, and untracked work. Never describe uncommitted work as shipped.
6. Run the repository's required checks when asked to prepare a release or when claiming release readiness. Report blockers without hiding them.
7. Draft the notes in English using the format below.
8. Do not create tags, push, publish, or edit a GitHub Release unless the user explicitly requests that action.

Prefer repository-native commands and existing release tooling. Use `git` for local evidence and the connected GitHub tooling or `gh` only when remote release state is relevant.

## Content Rules

- Write for users, not commit authors.
- Lead with product impact and use active voice.
- Group related changes; omit merge commits, version bumps, formatting, generated files, and internal refactors unless they materially affect users.
- Label breaking changes, migrations, compatibility requirements, and known issues clearly.
- Mention fixes only when the evidence identifies the broken behavior and its resolution.
- Do not claim performance, security, or reliability improvements without evidence.
- Preserve issue or pull-request links when available.
- Use SemVer terminology only when the repository follows SemVer.
- If there are no user-facing changes, say so plainly instead of inventing highlights.

## Output Format

```markdown
## What's New

- <Most important user-facing change>

## Improvements

- <Notable improvement>

## Fixes

- <User-visible fix>

## Upgrade Notes

- <Breaking change, migration step, compatibility note, or known issue>
```

Remove empty sections. Keep each bullet to one or two sentences. Add a comparison line such as `Changes since v1.2.3` only when the base version is verified.

When the user asks for a GitHub Release body, return only the ready-to-paste Markdown unless they also request analysis.
