# EL400 DRO Simulator

CodjiFlo is a code review tool tailored to power users of pull requests to improve contextual understanding and ease of code review and collaboration. 

## Commands

```bash
npm run dev              # Development server
npm run build            # Production build
npm run lint             # ESLint
npm run typecheck        # TypeScript type checking (tsc)
npm run test             # Unit and integration tests (Vitest)
npm run test:coverage    # Unit and integration tests with coverage, min 70% enforced
npm run test:storybook   # Storybook interaction tests
npm run test:e2e         # Playwright E2E
npm run test:all         # REQUIRED before push (lint + typecheck + coverage + e2e + storybook)
```

## Testing Exit Criteria

**All changes:** `npm run test:all` must pass
**New features:** 1-2 E2E tests + integration tests + unit tests

| Type | Pattern | Notes |
|------|---------|-------|
| Unit | `src/**/*.test.ts(x)` | Primary. Use Vitest + RTL |
| Integration | `*.integration.test.tsx` | Use `data-testid`, helpers in `src/tests/helpers/`. Test happy AND unhappy paths |
| E2E | `e2e/**/*.spec.ts` | Playwright. Critical flows only |
| Stories | `src/**/*.stories.tsx` | Visual docs only, no behavior tests |

## Tech Stack

React 18, TypeScript (strict), Vite, Tailwind CSS, Zustand, Vitest, Playwright, Storybook
