# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Workspace Routing Guards >> unauthenticated user accessing root should be redirected to login page
- Location: tests\auth.spec.ts:4:3

# Error details

```
Error: page.goto: net::ERR_ABORTED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

```
Error: browserContext.close: Target page, context or browser has been closed
```