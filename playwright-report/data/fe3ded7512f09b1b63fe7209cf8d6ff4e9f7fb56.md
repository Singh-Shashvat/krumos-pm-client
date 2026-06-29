# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Workspace Routing Guards >> login page elements render correctly
- Location: tests\auth.spec.ts:18:3

# Error details

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

```

```
Error: browserContext.close: Target page, context or browser has been closed
```