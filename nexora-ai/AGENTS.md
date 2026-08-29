# Nexora AI agent workflow

This repository uses the following ordered workflow for feature work:

1. `feature-builder` reads the repository before editing and implements the requested feature.
2. `test-engineer` adds focused positive and negative test cases.
3. `quality-validator` runs the tests and checks that both success and failure paths behave as expected.
4. `code-reviewer` reviews the complete diff for correctness, security, regressions, and maintainability.
5. `documentation-changelog` updates related documentation and the unreleased changelog.
6. `release-builder` runs the production build only after the preceding stages pass.
7. `release-publisher` pushes only after explicit approval and a clean, validated worktree.

Each stage is a hard gate. A failed stage may be retried up to three times, including the original attempt. Retries must address the reported failure rather than blindly repeating the same command. After the third failure, stop the workflow and report the stage, command, and failure.

Commits must follow Conventional Commits (`type(scope): description`, for example
`feat(chat): add model selector`). The local `commit-msg` hook enforces this, and
`npm run release` uses `standard-version` to calculate the next semantic version,
update the changelog, create the release commit, and tag it.

## Guardrails

- Read the relevant files, folder structure, package scripts, and existing tests before changing code.
- Keep changes scoped to the requested feature. Do not rewrite unrelated code or remove user changes.
- Never expose, commit, or print credentials, tokens, `.env` values, private keys, or local model data.
- Do not disable tests, lint rules, type checks, security checks, or branch protection to make a stage pass.
- Validate all external input at the boundary and preserve existing authorization and privacy behavior.
- Do not use destructive git commands such as `reset --hard`, force-push, or broad deletion.
- Do not commit or push directly to protected/default branches unless the user explicitly requests it and repository policy allows it.
- Before pushing, show the commit range and destination and require explicit confirmation.
- If requirements are ambiguous or a destructive/security-sensitive choice is required, stop and ask for clarification.

The GitHub Actions implementation is in `.github/workflows/feature-pipeline.yml`. It is intentionally manual and does not run agent prompts itself; invoke the named profiles in order through the agent host, then use the workflow as the deterministic quality and release gate.
