# Security Policy

## Supported Versions

This is a template repository for `@teqbench` npm packages. The latest version on `main` is the only supported version.

| Version | Supported |
| ------- | --------- |
| latest  | ✅        |
| older   | ❌        |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

<!-- TODO when cloning: update the advisory URL below to point to your repository's Security Advisory page -->

To report a vulnerability, open a [GitHub Security Advisory](https://github.com/teqbench/teqbench.dev.templates.tbx-package/security/advisories/new) via the **Security** tab of this repository. This keeps the report private until a fix is available.

Include as much of the following as possible:

- Type of vulnerability (e.g. XSS, dependency with known CVE, credential exposure)
- File(s) and line number(s) relevant to the issue
- Steps to reproduce or proof-of-concept
- Potential impact

You will receive a response within **5 business days**. If the vulnerability is confirmed, a fix will be prioritised and a coordinated disclosure timeline agreed upon.

## Dependency Vulnerabilities

This project runs `npm audit --audit-level=high` on every CI run. High and critical severity vulnerabilities in dependencies will fail the build and must be resolved before merging.

To check locally:

```bash
npm audit --audit-level=high
```

If you discover a vulnerability in a transitive dependency that `npm audit` does not flag, please report it via the advisory process above.
