# CodjiFlo Architecture & Implementation Standards

> **Critical Instruction for Agents**: This document is the source of truth for code structure. You MUST NOT deviate from these patterns without updating this document first. "Consistency is better than cleverness."

---

## 1. Global Code Structure Principles (The "Constitution")

### 1.1 "Feature-First" Directory Structure
We use a **Feature-based** folder structure. Do not group by file type (e.g., do NOT put all components in `src/components`). Group by **Domain Feature**.

**Allowed Directory Tree**:
```text
src/
├── api/                # Core API Clients (generic, not feature-specific)
├── components/         # SHARED, Dumb UI Components (Buttons, Inputs, Layouts)
│   ├── ui/             # Atomic design elements (Typography, Colors)
│   └── layout/         # App shells, Sidebars
├── features/           # FUNCTIONAL DOMAINS
│   ├── auth/           # Authentication Feature
│   │   ├── components/ # Auth-specific UI (LoginScreen)
│   │   ├── hooks/      # Auth-specific logic
│   │   ├── stores/     # Auth state (Zustand)
│   │   └── types.ts    # Auth types
│   ├── pr/             # Pull Request Data Feature
│   ├── diff/           # Diffing Logic Feature
│   ├── comments/       # Commenting System Feature
│   └── extension/      # Browser Extension Specifics (Bridge, Messaging)
├── lib/                # Third-party library wrappers (e.g., Octokit configuration)
├── utils/              # Pure utility functions (Date formatting, string manipulation)
├── hooks/              # Global shared hooks (useTheme, useDebounce)
├── types/              # Global shared types (Avoid overusing this, prefer feature types)
├── stores/             # GLOBAL CROSS-FEATURE STORES (Only if absolutely necessary, prefer feature stores)
└── App.tsx             # Root Orchestrator
```

### 1.2 State Management Rules (Zustand)
1.  **Scope**: Prefer small, feature-specific stores (e.g., `useAuthStore`, `useDiffStore`) over a single monolithic store.
2.  **Persistence**: configuration and auth tokens use `persist` middleware. UI state (scroll position) should generally be transient unless specified.
3.  **Actions**: Stores must contain actions (business logic) within them, or calls to API services. Components should call `store.login()` rather than calling `api.login()` and then `store.setToken()`.

### 1.3 Styling (TailwindCSS)
1.  **Utility-First**: Use Tailwind classes directly in JSX.
2.  **No Magic Numbers**: Use standard Tailwind spacing/colors. If a custom value is needed, add it to `tailwind.config.js`.
3.  **Encapsulation**: If a component's class string exceeds 80 chars, consider using `class-variance-authority` (CVA) or extracting parts to a variable, but generally inline is preferred for velocity.

### 1.4 Testing Strategy
1.  **Unit Tests (Vitest)**: Focus on logic in `utils/` and `stores/`. Code coverage goal: 70%.
2.  **E2E Tests (Playwright)**:
    - **Mocking**: Use MSW (Mock Service Worker) for network isolation during tests. Do NOT hit real GitHub API in CI.
    - **Coverage**: One E2E spec per User Story Acceptance Criteria set.

---

## 2. Milestone Architectural Plans

### Milestone 1: SPA Foundation
**Goal**: Establish the app shell and GitHub Data integration.
- **Scaffolding Needs**:
  - `src/api/github-client.ts`: The central HTTP/Rest adapter.
  - `src/features/auth`: State machine for PAT handling.
  - `src/features/pr`: Dashboard and Navigation logic.
  - `src/features/diff`: Basic "Unified Hacker View" renderer.
- **Critical Assumption**: We are building a **React SPA**. Routing is handled by `react-router-dom` (or simple conditional rendering if the scope remains small, but Router is better for deeplinking in the future). *Decision: Use React Router.*

### Milestone 2: Comments Engine
**Goal**: Inline commenting system.
- **Scaffolding Needs**:
  - `src/features/comments`:
    - `comments-store.ts`: specific store for normalizing comment threads.
    - `types.ts`: `ReviewComment` interface matching GitHub API.
- **Constraint**: Comments must be mapped to `diff-line-index`. The logic for "which line does this belong to" belongs in a pure function/helper in `src/features/diff/utils`.

### Milestone 3: Extension Bridge
**Goal**: Inject into GitHub.
- **Architecture**:
  - **Content Script**: Independent entry point `src/extension/content.tsx`.
  - **Shadow DOM**: The React App must be capable of mounting inside a `shadowRoot` to avoid style bleeding.
  - **Messaging**: Use `chrome.runtime.sendMessage` for auth updates if cookies are used (though M3 uses direct API calls).
- **Refactor Alert**: `App.tsx` might need to support a "Widget Mode" vs "Full Page Mode".

### Milestone 4: Advanced Diffing
**Goal**: Side-by-Side and Iterations.
- **Scaffolding Needs**:
  - `src/workers/diff-worker.ts`: Offload heavy text comparison (Myers Diff Algorithm) to a Web Worker to keep UI responsive.
  - `src/features/diff/components/SideBySideView.tsx`: new complex grid layout.

### Milestone 5: Canvas Layouts
**Goal**: Floating Bubbles (The "CodeFlow" feel).
- **Architecture**:
  - **Layering**: Code View is Layer 0. SVG Connector Layer is Layer 1. Comment Cloud is Layer 2.
  - **Layout Engine**: `src/features/comments/layout-engine.ts`. A pure logic class that takes a list of comments + scroll position and returns X/Y coordinates for bubbles.

### Milestone 6: Real-Time & Polish
**Goal**: Performance and Synchronization.
- **Architecture**:
  - `src/api/realtime.ts`: A polling manager (Interval based) that checks `ETag` or `Last-Modified` headers to fetch delta updates.

---

## 3. General Agent Rules
1.  **Do Not Delete Logic**: When refactoring, verify usage. Use "Find Usages".
2.  **Explicit Types**: No `any`. Use `unknown` if unsure, but prefer defined interfaces.
3.  **Errors**: Always handle API errors gracefully in the UI (Error Boundaries or Toast Notifications).
