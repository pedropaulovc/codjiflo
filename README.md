# CodjiFlo

CodjiFlo is a code review tool inspired by Microsoft's CodeFlow, used by ~40,000 developers. It is especially tailored to power users of pull requests to improve contextual understanding and ease of code review and collaboration. 

## Features

### Advanced Commenting

- **Character-level precision** - Mark specific characters within a line, not just entire lines
- **Region spanning** - Attach comments to multiple lines simultaneously
- **Floating bubbles** - Comments are visual objects with lasso connectors to code
- **Threading & states** - Organize discussions with status tracking (pending, won't fix, fixed, resolved)

### Iteration-Based Review

- **Before/During/After toggle** - Quickly switch between file states for context
- **Iteration comparison** - View changes between any two review versions
- **Comment persistence** - Comments follow code through iterations as lines move

### Multi-Platform Support

Backend abstraction layer supporting:
- GitHub (under development)
- Azure DevOps (future)
- GitLab (future)

### Build & CI Integration

- Improved build status and policy checks visibility for all reviewers
- Inline lint results
- Code coverage display

## Functional specification

| Component | Description |
|-----------|-------------|
| [Data Models](spec/models.md) | Core TypeScript interfaces |
| [Backend Abstraction](spec/backend-abstraction.md) | Platform-agnostic API layer |
| [Diff Viewing](spec/diff-viewing.md) | Multi-mode diff with word-level highlighting |
| [Comments](spec/comments.md) | Bubble comment system |
| [Iterations](spec/iterations.md) | Cross-version tracking |
| [Review Lifecycle](spec/review-lifecycle.md) | State machine & permissions |
| [UI Components](spec/ui-components.md) | Dashboard, Explorer, Properties |
| [Real-Time](spec/realtime.md) | Push notifications via WebSocket |

## Key Differentiators

1. **Comment precision** - Character-level vs line-level commenting
2. **Diff toggle** - Before/Both/After view switching
3. **Iteration tracking** - Comments persist through code movement
4. **Granular states** - Rich workflow states beyond approve/reject
5. **Build integration** - Automatic CI triggering and blocking
6. **Region commenting** - Multi-line comment spanning

## Project Name
Codjiflo is a corrupted version (pt: [Corruptela](https://dicionario.priberam.org/corruptela)) of the word CodeFlow. Its pronunciation in English matches how a Brazilian with beginner level of proficience in English would say the word CodeFlow. It represents the fact that Codjiflo is a "corrupted" version of the original CodeFlow and the author is Brazilian-American.

## Note
This project is not associated or endorsed by Microsoft Corp. The [Codjiflo specification](./spec/index.md) was produced following a clean-room approach: the desired behavior was codified from research articles, interviews published by Microsoft, blog posts, linked in the spec, and the author's memory of how CodeFlow works.