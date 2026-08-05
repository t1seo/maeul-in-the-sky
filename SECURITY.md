# Security policy

## Supported versions

Security fixes are applied to the latest release and the `main` branch. Upgrade to the latest published version before reporting a version-specific problem.

## Report a vulnerability

Please use [GitHub private vulnerability reporting](https://github.com/t1seo/maeul-in-the-sky/security/advisories/new). Do not open a public issue for a vulnerability that could put users or tokens at risk.

Include the affected version, impact, reproduction steps, and any suggested mitigation. You should receive an initial response within five business days. The report will stay private while it is assessed and fixed.

## Token safety

Maeul in the Sky reads a GitHub token from the Action input, CLI option, or `GITHUB_TOKEN` environment variable. Never commit tokens, paste them into generated SVGs, or include them in issue logs. Use the minimum permissions required for the task.
