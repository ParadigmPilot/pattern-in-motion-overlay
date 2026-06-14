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
version: "1.2"
created: "2026-06-10"
updated: "2026-06-14"
owner: Sam R. Harkreader

# === DESCRIPTION FIELDS ===
purpose: Central index for pattern-in-motion-overlay backlog items

# === RELATIONSHIP FIELDS ===
depends_on:
  - products/hopper/engineering/foundation/document-schemas/backlog-composite/backlog-item/backlog-_item-archetype.md
related: []

# === INDEX EXTENSION FIELDS ===
next_id: 13
total_count: 12
collection_type: backlog   # ai-practice Anti-Pattern 6 (lowercase) — see note 2
---

# Pattern in Motion Overlay Backlog

**Total Items:** 12  
**Next ID:** BL-13  
**Last Updated:** 2026-06-14

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
> "validated backlog" pass**, not done here. `next_id` 10→13. (Discharges the
> cycle-315-baseline v1.3 directive to record BL-5 superseded + BL-6 Option-C.)

---

## Summary by Status

| Status | Count |
|--------|-------|
| Captured | 10 |
| Triaged | 0 |
| Ready | 0 |
| Scheduled | 0 |
| Complete | 0 |
| Rejected | 2 |
| **Total** | **12** |

---

## Captured

| ID | Name | Priority | Source |
|----|------|----------|--------|
| BL-1 | Eliminate additive Trace accumulation — finished turns stack and grow, pushing the live area (overlay + ready strip) down and away from Send; replace stack-and-grow with single-turn / replace-in-place. Sub-note: "New turn" intro copy says "archive and start fresh" but behavior stacks turns | High | Cycle 314.4–314.6 |
| BL-2 | Configure Render preview-deploy for the overlay repo (BD-313.6-2) — stand up now so BL-3/BL-4 can be verified on real devices, not just local `npm run dev` | Medium | Cycle 313.6 |
| BL-3 | Compact Trace variant — keep the six-step sequence but fix it to a small height so Send is reachable without scrolling on any device (single-row chips / state dots; sublabels hidden at strip level). The no-scroll lever. Verdict pending read of `Trace.css` vs `tokens.css` | High | Cycle 314.6 |
| BL-4 | Composed-view redesign **(expanded 315.4 — owner composed-view vision)**. **(a) Control-surface split:** **Send** submits the intake and reveals **step 01** (`take_the_order`) — the visitor's submit *is* Take the Order (D-WS1-12); a dedicated **Next Step** control advances the Manual walk across **steps 02–06**. **(b) Surface the Pin** in the composed view, **unlabeled** — its icon matches the active Trace pill, so it self-explains; **supersedes** the prior "fold out / remove the Pin" intent. **(c)** Debug summary drops "Pin renderer" → **"Debug · Event log"** (Pin no longer nested; Event log unchanged). **(d) Order:** Trace (six pills) → Send / Next Step controls → Manual overlay. Absorbs the empty-header check (BL-9). **Canon dependency:** reverses D-WS2-23 (Send-only) → station-arch **D-WS2-26** (authored 315.4) gates the build. Touches #3's GOLD role. Automatic-toggle fate decided at build. | Medium | Cycle 314.6; expanded 315.4 |
| BL-6 | **Served-response disposition — resolved Option C (315.6; complete).** ~~Repurpose the ready-strip into a warm-amber served-response callout.~~ Superseded at 315.6: the served answer is **host-owned** (overlay #6 returns `null` at Step 05, `responseProse` retired — PR #44; the host renders the answer as its own plain `.msg-assistant` bubble, identical to archived answers — PR #45). Emphasis moved to the **Trace** (amber); the answer reads plain (the recognition beat + recognition line). Response-ready strip (#7) stays **retired** in the composed view. Canon: station-arch **D-WS2-27** (supersedes the D-WS2-13 swap; D-WS2-14 moot). | Medium | Cycle 314.6; resolved 315.6 |
| BL-7 | Resolve token-vocab debt — 4 `tokens.css` reference mismatches (disposition: fix WO references, per 312.7). Independent — anytime | Low | Cycle 310.6 / 312.7 |
| BL-8 | Add a "data landed" moment after Stock the Pantry (persistence signal — "now in the database"). Deferred to Cycle 316, gated on the persistence layer (#8–#10). **Sub-note (315.4):** an **interim copy-only** line at step 06 (e.g. "Behind the scenes — saving this turn to your recent history") can ship in the 315 composed-view pass to give the 05→06 transition a visible, honest change; the true "now in the database" signal stays gated on #8–#10 (Cycle 316). _(Interim line shipped 315.5, PR #41.)_ | Medium | Cycle 314.6 |
| BL-10 | Idle **welcome surface** before `at_the_table` — replaces the empty-state hint removed in 315.5 (the placeholder now carries interim guidance). First-run copy for the composed view; the idle teaching beat before a turn starts. Host-only (`example/*`). | Medium | Cycle 315.5 (split from BL-4); planned 315.6 |
| BL-11 | **Stacked header + collapsible Event-log trigger.** The single-row header breaks for longer (third-party) app titles. Stack it: **host app name = `h1` title**; **"Pattern in Motion · composed preview" = subtitle** on the next line (title = host, subtitle = overlay — the guest announces itself beneath the host; mnemonic hierarchy applied to the chrome). On narrow viewports the "Event log" text button collapses to a **chevron/triangle affordance**; the full "Event log" stays the drawer heading; `aria-label` keeps the control legible to screen readers. Host-only (`example/main.jsx` + `example.css`); zero new tokens. | Medium | Cycle 315.6 (owner eyes-on) |
| BL-12 | **Teaching-panel tier separation (#6).** The six-line panel reads flat — uniform gaps flatten three natural tiers: **identity** (step + title + tech peg), **explanation** (plain-English + IN CODE), **continuity** (just-finished + up-next). Group them: hairline between tiers; continuity pair as a quiet muted footer; subtle left-accent on the IN CODE line to mark the technical register. Overlay **`src`** pass (`src/overlay/manual-overlay.css`); existing tokens only. Exact spec pending Sarah Chen. | Medium | Cycle 315.6 (owner eyes-on) |

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
| — | No items migrated yet (done items reconciled at OBJ-3 / cycle closure) | — | — |

---

## Rejected

| ID | Name | Reason |
|----|------|--------|
| BL-5 | Rename "Trace renderer" → "Service Steps" | Dropped as stale at 315.6 — no "Trace renderer" / dev-facing renderer label exists in the shipped composed view (retired by the 315.5 redesign). Nothing to rename. (Recorded per cycle-315-baseline v1.3.) |
| BL-9 | Suppress renderer section headers when empty | Absorbed into BL-4 — the composed redesign retires the standalone renderer headers (BL-5) and removes the Pin, so no empty header survives; the "no header over empty space" check folds into BL-4's acceptance criteria |

---

_Index maintained by: Sam R. Harkreader_  
_Last updated: 2026-06-14_
