# AGENTS.md

## Project

**Name:** Slime
**Type:** 2D puzzle web game
**Stack:** TypeScript, Vite, HTML5 Canvas 2D
**Deployment:** Static site, compatible with GitHub Pages

---

## Objective

Build a clean, deterministic, maintainable puzzle game prototype inspired by Dungeon Slime.

Priorities, in order:

1. Correct gameplay behavior
2. Deterministic simulation
3. Clear level authoring
4. Readable and maintainable code
5. Simple rendering with solid colors
6. Easy future extension

Do not optimize for visual polish before the gameplay loop is correct.

---

## Core Engineering Rules

### 1. Keep gameplay deterministic

* Same input sequence must always produce the same result.
* Do not use non-deterministic logic in movement, collisions, hazards, or level state.
* Avoid hidden side effects.
* Keep game rules independent from frame rate.

### 2. Separate simulation from rendering

* Game rules must not depend on Canvas drawing code.
* Rendering must only read state and display it.
* Never mix collision logic into rendering modules.
* Never store authoritative gameplay state inside visual components.

### 3. Prefer simple systems over clever systems

* Use grid/tile logic, not physics.
* Use explicit state transitions.
* Use small pure functions where possible.
* Avoid abstraction layers that do not clearly reduce complexity.

### 4. Avoid premature generalization

* Implement only what the current game needs.
* Keep extension points where they are cheap and obvious.
* Do not build speculative systems for future features.

---

## Architecture Rules

### Required high-level separation

Keep the project split into clear areas:

* `core/` → rules, state, collisions, movement, level logic
* `render/` → canvas drawing only
* `input/` → keyboard input mapping
* `content/` → level JSON files and static content
* `app/` → bootstrap and game loop
* `util/` → generic helpers only

### Forbidden coupling

* `render/` must not mutate gameplay state.
* `content/` must not contain executable logic.
* `input/` must not resolve rules directly.
* `util/` must not become a dumping ground for game logic.

---

## TypeScript Standards

### General

* Use strict TypeScript.
* Prefer explicit types on public APIs.
* Avoid `any`.
* Avoid unsafe casts unless unavoidable and documented.
* Prefer discriminated unions for game states and tile/entity kinds.
* Prefer `readonly` where useful for safety.

### Functions

* Keep functions small and focused.
* Prefer pure functions for rule evaluation.
* Make mutation explicit.
* Return early on invalid conditions.
* Do not overload functions with multiple unrelated responsibilities.

### State

* Use a single authoritative gameplay state object.
* All game updates should flow through explicit state transition functions.
* Never duplicate authoritative state across modules.
* Avoid implicit synchronization problems.

### Naming

* Use clear English names.
* Prefer domain names over generic names.
* Good: `tryMovePlayer`, `resolveHazards`, `loadLevelData`
* Bad: `handleStuff`, `processData`, `doLogic`

---

## Gameplay Rules for Implementation

### Simulation model

* The game is grid-based.
* Movement is discrete.
* Collisions are discrete.
* Player shape is logical state, not only visual state.
* Narrow passages must validate occupied cells, not only origin position.

### Required behavior

* Restart must fully reset the level.
* Undo must restore a valid previous gameplay snapshot.
* Hazards must resolve consistently.
* Exit conditions must be validated against the final state.
* Every rule should be testable without rendering.

### Do not do this

* Do not add physics-based movement.
* Do not add smoothing that changes authoritative logic.
* Do not make hitboxes approximate if exact grid occupancy is available.
* Do not encode important rules only in animation code.

---

## Rendering Rules

### Prototype scope

* Use solid colors only.
* Use simple geometric drawing.
* No textures in the prototype.
* No visual feature may alter gameplay outcome.

### Rendering behavior

* Keep draw order explicit and stable.
* Keep rendering stateless where practical.
* Separate transient animation state from gameplay state.
* Use interpolation only for visuals, never for rule resolution.

---

## Level Content Rules

* Levels must be data-driven.
* Store levels as JSON.
* Keep one file per level.
* Do not hardcode level geometry in TypeScript except for temporary debug levels.
* Validate level data on load.
* Fail loudly on invalid level content.

### Level design principles

* Each level should teach or test one main idea.
* Keep rooms readable.
* Keep progression incremental.
* Avoid introducing multiple new mechanics at once.

---

## Bug Prevention Rules

### Always guard against

* out-of-bounds tile access
* invalid occupancy checks
* stale entity references
* accidental shared-object mutation
* inconsistent restart state
* inconsistent undo snapshots
* transition states accepting input when they should not

### Required practices

* Validate all movement targets before commit.
* Keep snapshot creation explicit.
* Clone mutable state when storing history.
* Add assertions for impossible states.
* Prefer small helper functions for collision and occupancy checks.

---

## Testing Expectations

At minimum, keep the code easy to verify for these cases:

* player cannot move through walls
* player shape transitions correctly on blocked movement
* passages reject invalid shapes
* hazards kill immediately
* undo restores exact previous state
* restart restores exact initial state
* level completion only occurs in a valid goal state
* pushing blocks works only when destination is free

If adding a feature makes these rules harder to verify, the design is getting worse.

---

## Code Style

* Favor clarity over brevity.
* Keep files reasonably small.
* Avoid deep nesting.
* Avoid long parameter lists.
* Prefer constants over magic numbers.
* Document non-obvious rules briefly.
* Do not add redundant comments for obvious code.

### Comments

Write comments for:

* puzzle-rule edge cases
* non-obvious invariants
* important assumptions
* temporary workarounds

Do not write comments that just restate the code.

---

## Performance Guidance

* Optimize only after correctness.
* This project does not need premature micro-optimization.
* Prefer simple loops and predictable data access.
* Avoid expensive allocations in hot paths only if profiling shows a real issue.

---

## Git and Change Discipline

* Keep changes focused.
* Do not mix refactors with new features without a reason.
* Preserve working behavior while refactoring.
* When changing rules, update all affected systems consistently.
* Do not leave partial dead code behind.

---

## Decision Heuristics

When multiple implementations are possible, prefer the one that is:

1. easier to reason about
2. more deterministic
3. easier to test
4. easier to author levels for
5. easier to extend without rewriting core systems

---

## Non-Goals for Current Phase

Do not prioritize:

* textures
* advanced particles
* audio polish
* menu-heavy UI
* mobile controls
* procedural generation
* unnecessary engine-like abstractions

---

## Final Standard

Every change should leave the project in a state where:

* gameplay is still deterministic
* code is easier or at least not harder to understand
* level content remains data-driven
* rendering stays separate from rules
* future contributors can extend the game without guessing hidden assumptions
