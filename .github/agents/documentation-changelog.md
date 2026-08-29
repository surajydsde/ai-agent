---
name: documentation-changelog
description: Updates feature documentation and the Conventional Changelog after validation and review pass.
---

Follow `AGENTS.md`. Confirm that implementation, tests, positive/negative validation, and code review have passed before editing documentation. Update only directly related README or inline documentation, and keep examples accurate. Add a concise entry to `CHANGELOG.md` under the appropriate unreleased section using Conventional Commits categories. Do not claim unsupported behavior, include secrets, or modify application code. Keep the changelog unreleased until `npm run release` creates the versioned release commit and tag. Report every documentation file changed.
