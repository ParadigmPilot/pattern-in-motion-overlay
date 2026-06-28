---
# === IDENTITY FIELDS ===
name: Pattern in Motion Overlay Backlog Index
path: products/pattern-in-motion-overlay/product-management/backlog/backlog-_index.md
project: Hopper

# === CLASSIFICATION FIELDS ===
doctype: _Index
level: Operational
status: Active
quality: TBD
alignment: Partial

# === VERSIONING FIELDS ===
version: "1.7"
created: "2026-06-10"
updated: "2026-06-28"
owner: Sam R. Harkreader

# === DESCRIPTION FIELDS ===
purpose: Central index for pattern-in-motion-overlay backlog items

# === RELATIONSHIP FIELDS ===
depends_on:
  - products/hopper/engineering/foundation/document-schemas/backlog-composite/backlog-item/backlog-_item-archetype.md
related: []

# === INDEX EXTENSION FIELDS ===
next_id: 15
total_count: 14
collection_type: backlog   # ai-practice Anti-Pattern 6 (lowercase) — see note 2
---

# Pattern in Motion Overlay Backlog

**Total Items:** 14  
**Next ID:** BL-15  
**Last Updated:** 2026-06-28

> Index-row captures (per breakout 314.4.a): item names below are recorded as
> rows; individual item files are not yet created. All items target the Cycle
> 315 integration pass unless noted.
>
> BL IDs are assigned in **implementation order** (BL-1 first → BL-8 last), per
> owner direction — a deliberate deviation from the ai-practice priority-sort so
> the build sequence reads top-to-bottom.
>
> **v1.1 (2026-06-13):** BL-4 expanded to carry the Session 315.4 composed-view
> vision (control-surface split; Pin surfaced unlabeled; Send enacts step 01).
> The split **reverses** the Send-only surface (D-WS2-23) and is recorded in
> station-arch **D-WS2-26** (atomic amendment, authored 315.4). BL-8 gains an
> interim-signal sub-note. No new items; objectives unchanged.
>
> **v1.2 (2026-06-14):** Session 315.6 reconciliation. Captured **BL-10**
> (welcome surface — restored to the index; split from BL-4 at 315.5),
> **BL-11** (stacked header + collapsible Event-log trigger), and **BL-12**
> (teaching-panel tier separation) — all from 315.6 owner eyes-on. **BL-5**
> moved to Rejected (stale — nothing to rename). **BL-6** reframed to the
> resolved **Option C** disposition (host-owned served answer; station-arch
> **D-WS2-27**) and marked complete; it stays in Captured pending the bulk
> Complete-section migration. The full done-status migration (BL-1–BL-4, BL-6,
> BL-8 interim → Complete) is **deferred to the OBJ-3 / cycle closure
> "validated backlog" pass**, not done here. `next_id` 10->13. (Discharges the
> cycle-315-baseline v1.3 directive to record BL-5 superseded + BL-6 Option-C.)
>
> **v1.3 (2026-06-14):** Session 315.6 header arc + Event-log split. **BL-11**
> reframed to **as-built** (WOs 315.6c–g on PR #46): the line-2 element is the
> **applied-overlay badge** ("with [Pattern in Motion] · Preview"), not a
> subtitle, and the trigger is a **labeled "Event log" button** on that line —
> the interim "subtitle" wording and the narrow-viewport **chevron are retired**.
> Captured **BL-13** (Event-log disclosure redesign — non-modal, persistent
> through the walk, docked-on-wide / modal-on-narrow), which owns the log's
> open/close *behavior* (BL-11 owns only the trigger's placement/label). BL-13
> **subsumes** the wide-viewport "empty resting-state" finding (the dock fills
> that space). `next_id` 13->14; total 12->13. _(Still un-captured pending owner
> triage: the inert completed-turn replay control — shows but does nothing until
> Cycle 316 #10.)_
>
> **v1.4 (2026-06-14):** Session 315.6 close-out (validated-backlog, **session
> scope**). Migrated this session's completions to **Complete** with evidence:
> **BL-6** (Option C — PRs #44/#45, D-WS2-27), **BL-7** (overlay token vocab
> **verified conformant** — every `var(--…)` resolves; 312.7 residual is
> cross-repo, flagged for hopper/brand-canonical, no overlay change), **BL-10**
> (welcome — PR #48), **BL-11** (header GOLD — PR #46), **BL-12** (panel tiers —
> PR #47). The deferred **bulk** migration (BL-1–BL-4, BL-8 → Complete) remains
> for the **formal Cycle-315 closure** "validated backlog" pass — not this
> session checkpoint. **BL-13** stays Captured (parked for 315.7). Captured 11→6;
> Complete 0→5. `next_id`/total unchanged (14 / 13).
>
> **v1.5 (2026-06-15):** Session 315.7 — **BL-13** shipped and migrated to
> **Complete** (host-only WO-315.7a, PR #49): the composed-view Event log is now
> a **non-modal disclosure** — it persists through the walk (backdrop / Esc /
> click-outside close removed; toggled from the line-2 button with
> `aria-expanded`), **docks beside the walk** on wide (≥ 64rem, two-pane CSS-grid
> shell — fills the resting void) and stays a **slide-over peek** on narrow; zero
> new tokens; `src/**` untouched. Discharges BL-13's "subsumes the empty
> resting-state finding." Captured 6→5; Complete 5→6. The deferred **bulk**
> migration (BL-1–BL-4, BL-8 → Complete) remains for the **formal Cycle-315
> closure** validated-backlog pass (315.8). `next_id`/total unchanged (14 / 13).
>
> **v1.6 (2026-06-25):** Session 317.2 — captured **BL-14** (Event-log dock
> overflows the viewport bottom). The first full live walk on the merged
> WO-317.2a build surfaced it: the docked `.log-dock` / `#event-log` is not
> bounded to the viewport, so its content extends below the page edge instead of
> scrolling inside its panel. **CSS-only fix in `example.css`** (bound the
> `#event-log` scroll within the dock / fix the wide grid-row height); zero new
> tokens; `src/**` untouched (BL-13 `example/*` precedent). **P-9: overlay-repo
> item — a separate WO from any host WO.** Observed on the **pre-317.2a build**
> during the live walk; **re-confirm on the current deployed build.** Captured
> 5→6; total 13→14; `next_id` 14→15.

> **v1.7 (2026-06-28):** Session 317.4 — **BL-14 reframed (ownership correction).**
> The dock-overflow shares one root with the host footer-pin issue (intake-triager
> **BL-12**): on wide (≥64rem) the two-pane grid (`.composed-shell`) sets no
> `grid-template-rows`, so `height:100%` on the column / dock is indefinite and
> bottom-anchored content (footer **and** log) falls past the viewport. The
> deployed host renders **host `composed-view.css`** (post-BL-10 split), **not**
> the overlay's `example.css` — so BL-14's `example.css` framing targets a file
> the live build no longer uses. Resolution moved **host-side**: fixed by
> intake-triager **WO-317.4b** (wide grid-row bind), tracked under BL-12. BL-14
> stays **Captured pending the same live confirm**, then migrates to
> **Rejected-superseded (host-resolved)** — **no overlay change.** Counts
> unchanged (14 / 15).

---

## Summary by Status

| Status | Count |
|--------|-------|
| Captured | 6 |
| Triaged | 0 |
| Ready | 0 |
| Scheduled | 0 |
| Complete | 6 |
| Rejected | 2 |
| **Total** | **14** |

---

## Captured

| ID | Name | Priority | Source |
|----|------|----------|--------|
| BL-1 | Eliminate additive Trace accumulation — finished turns stack and grow, pushing the live area (overlay + ready strip) down and away from Send; replace stack-and-grow with single-turn / replace-in-place. Sub-note: "New turn" intro copy says "archive and start fresh" but behavior stacks turns | High | Cycle 314.4–314.6 |
| BL-2 | Configure Render preview-deploy for the overlay repo (BD-313.6-2) — stand up now so BL-3/BL-4 can be verified on real devices, not just local `npm run dev` | Medium | Cycle 313.6 |
| BL-3 | Compact Trace variant — keep the six-step sequence but fix it to a small height so Send is reachable without scrolling on any device (single-row chips / state dots; sublabels hidden at strip level). The no-scroll lever. Verdict pending read of `Trace.css` vs `tokens.css` | High | Cycle 314.6 |
| BL-4 | Composed-view redesign **(expanded 315.4 — owner composed-view vision)**. **(a) Control-surface split:** **Send** submits the intake and reveals **step 01** (`take_the_order`) — the visitor's submit *is* Take the Order (D-WS1-12); a dedicated **Next Step** control advances the Manual walk across **steps 02–06**. **(b) Surface the Pin** in the composed view, **unlabeled** — its icon matches the active Trace pill, so it self-explains; **supersedes** the prior "fold out / remove the Pin" intent. **(c)** Debug summary drops "Pin renderer" → **"Debug · Event log"** (Pin no longer nested; Event log unchanged). **(d) Order:** Trace (six pills) → Send / Next Step controls → Manual overlay. Absorbs the empty-header check (BL-9). **Canon dependency:** reverses D-WS2-23 (Send-only) → station-arch **D-WS2-26** (authored 315.4) gates the build. Touches #3's GOLD role. Automatic-toggle fate decided at build. | Medium | Cycle 314.6; expanded 315.4 |
| BL-8 | Add a "data landed" moment after Stock the Pantry (persistence signal — "now in the database"). Deferred to Cycle 316, gated on the persistence layer (#8–#10). **Sub-note (315.4):** an **interim copy-only** line at step 06 (e.g. "Behind the scenes — saving this turn to your recent history") can ship in the 315 composed-view pass to give the 05→06 transition a visible, honest change; the true "now in the database" signal stays gated on #8–#10 (Cycle 316). _(Interim line shipped 315.5, PR #41.)_ | Medium | Cycle 314.6 |
| BL-14 | **Event-log dock overflows the viewport bottom.** In the composed view, the docked Event log (`.log-dock` / `#event-log`) is not bounded to the viewport — its content extends **below the page edge** instead of scrolling inside its own panel. `.log-dock #event-log` sets `max-height: none` and relies on the flex/grid parent to bound height; when the column height does not establish (the wide two-pane grid row not stretching to `calc(100vh - 4rem)`), the log grows unbounded. Likely the **same height-establishment root** as the footer-pin issue BL-4 closed. Fix is **CSS-only in `example.css`** (bound `#event-log` scroll within the dock / fix the grid-row height) — **zero new tokens** (Robin Malfait Rule); `src/**` untouched (BL-13 `example/*` precedent). **P-9: overlay-repo item — separate WO from any host WO.** Observed on the **pre-317.2a-merge build** during the 316/317 live walk; **re-confirm on the current deployed build.** Overlay-owned (`example/example.css`). **Reframed 317.4:** root = the wide grid-row height in **host** `composed-view.css` (not `example.css`); resolved host-side by intake-triager **WO-317.4b** under **BL-12**; migrates to Rejected-superseded on confirm. No overlay change. | Medium | Cycle 317.2 (live walk eyes-on) |

---

## Triaged

| ID | Name | Priority | Estimate | Owner |
|----|------|----------|----------|-------|
| — | No items yet | — | — | — |

---

## Ready

| ID | Name | Priority | Estimate | Owner |
|----|------|----------|----------|-------|
| — | No items ready | — | — | — |

---

## Scheduled

| ID | Name | Priority | Cycle | Owner |
|----|------|----------|-------|-------|
| — | No items scheduled | — | — | — |

---

## Complete

| ID | Name | Completed | Cycle |
|----|------|-----------|-------|
| BL-6 | Served-response disposition — host-owned served answer (Option C); overlay #6 returns `null` at Step 05; host renders the plain `.msg-assistant` answer; emphasis on the amber Trace. Canon: station-arch **D-WS2-27** | 315.6 (PRs #44/#45) | 315 |
| BL-7 | Token-vocab debt — overlay **verified conformant**: every `var(--…)` in overlay CSS resolves in `tokens.css`; zero undefined refs. The 312.7 residual (`--container-prose`/`--color-stone-light`/`--color-parchment-warm` + WO-template refs) is **cross-repo** (hopper / brand-canonical), not an overlay change | 315.6 (verify) | 315 |
| BL-10 | Idle **welcome surface** before the first turn — guarded `.composed-welcome` block (lens-framed copy) at the top of `.chat`, shown only when idle; clears when a turn starts. Host-only | 315.6 (PR #48) | 315 |
| BL-11 | **Composed-view header — GOLD.** Stacked host `h1` title; line 2 = applied-overlay label (`with` + amber **"Pattern in Motion"** badge + separated muted **`Preview`**); pill polish (separator, baseline, spacing, title/label gap); **labeled "Event log" button** on line 2 (chevron retired); fits at 380px. Host-only; zero new tokens. _Event-log open/close behavior = BL-13._ | 315.6 (PR #46) | 315 |
| BL-12 | **Teaching-panel tier separation (#6).** Three tiers (identity / explanation / continuity) set off by stone `color-mix` hairlines + a step of space (between-separation; no sub-`--space-3` token); amber left-accent on the IN CODE line; continuity as a muted footer. No reorder (D-WS2-11). Overlay `src`; existing tokens only | 315.6 (PR #47) | 315 |
| BL-13 | **Event-log disclosure — non-modal.** Modal drawer → non-modal disclosure: persists through the walk (backdrop / Esc / click-outside close removed; toggled from the line-2 button, `aria-expanded` reflects state, `aria-controls="event-log-panel"`); **docks beside the walk** on wide (≥ 64rem, two-pane CSS-grid shell — fills the resting void); **slide-over peek** on narrow. Host-only (`example/*`); zero new tokens; `src/**` untouched. Owner sign-off preceded the build (BL-12 precedent). | 315.7 (PR #49) | 315 |

---

## Rejected

| ID | Name | Reason |
|----|------|--------|
| BL-5 | Rename "Trace renderer" → "Service Steps" | Dropped as stale at 315.6 — no "Trace renderer" / dev-facing renderer label exists in the shipped composed view (retired by the 315.5 redesign). Nothing to rename. (Recorded per cycle-315-baseline v1.3.) |
| BL-9 | Suppress renderer section headers when empty | Absorbed into BL-4 — the composed redesign retires the standalone renderer headers (BL-5) and removes the Pin, so no empty header survives; the "no header over empty space" check folds into BL-4's acceptance criteria |

---

_Index maintained by: Sam R. Harkreader_  
_Last updated: 2026-06-28_
