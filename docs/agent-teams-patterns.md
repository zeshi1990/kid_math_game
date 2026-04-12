# Agent Teams: Patterns, Gaps & Use Cases

> Produced by a 3-agent doc review team (Researcher + Strategist + Critic).
> Companion to `agent-teams-reference.md`.

---

## Part 1 — Gaps & Underdocumented Areas in the Reference Doc

The following gaps were identified after a structured analysis of `agent-teams-reference.md`. Each item is either undocumented, ambiguous, or a potential footgun.

### 1. Cost & Billing Model

No billing documentation exists for agent teams. Each teammate is a full Claude session, so a 5-teammate team with a 10-turn task multiplies token cost by 5×. There are no guardrails, no cost caps, and no documented thresholds. Broadcast messages (`*`) amplify cost linearly with team size.

**Implication:** cost should be an explicit factor in team size decisions; use smaller teams and targeted messaging over broadcasts.

### 2. Crash & Error Recovery

The reference doc has one troubleshooting entry for a stopped teammate but describes no recovery mechanism. If a teammate crashes mid-task, that task remains stuck in `in_progress` with no automated handoff. There is no documented way for the system to detect a crashed teammate and reassign its work.

**Implication:** for critical single-reviewer roles (e.g., a Safety Auditor), design a manual recovery path: Lead monitors for stalled tasks and spawns a replacement with the in-progress task description.

### 3. Worktree Isolation

Subagents support `isolation: "worktree"` to give each agent its own git worktree, preventing file conflicts at the system level. Agent teams have no equivalent. File conflict prevention is entirely advisory ("each teammate should own a different set of files"). Two teammates editing the same file will silently overwrite each other's changes.

**Implication:** enforce file ownership through task design, not tooling. Assign files explicitly in spawn prompts and task descriptions.

### 4. `TeammateIdle` Trigger Semantics

The reference doc states `TeammateIdle` fires when a "teammate is about to go idle" but does not define what triggers this. There are at least three plausible interpretations:

- Teammate's message queue is empty and it has no pending tasks
- Teammate explicitly signals it is done with its current work unit
- Teammate has not produced output within a timeout window

The distinction matters significantly for hook-based workflows. A hook relying on interpretation #1 will behave very differently under interpretation #3.

**Implication:** test `TeammateIdle`-dependent workflows in isolation before relying on them. Do not assume any specific trigger semantic.

### 5. Hook Exit Codes — Incomplete Documentation

The reference doc only documents exit code `2` (block with feedback). The behavior of exit codes `0` and `1` is not described:

- `0`: presumably allows the action to proceed
- `1`: behavior unknown — may be treated as an error, or may silently allow

**Implication:** follow the broader Claude Code hook convention (0 = allow, 1 = error/block without feedback, 2 = block with feedback), but verify — the agent teams hooks may not follow the same convention.

### 6. `skills` and `mcpServers` Frontmatter Silently Dropped

When using a subagent definition as a teammate, the `skills` and `mcpServers` fields in the definition's frontmatter are **not applied**. The doc mentions this as a limitation but does not highlight that it is silent — no warning is issued when a teammate starts without its expected skills or MCP servers.

**Workaround:** configure `skills` and `mcpServers` at the project level (`CLAUDE.md` or project config) instead of in definition frontmatter. They will then be available to all teammates automatically.

### 7. Broadcast Scope — Two Unanswered Questions

The `*` broadcast target is documented but two behaviors are unspecified:

- Does `*` include the Lead, or only teammates?
- Can teammates initiate a broadcast, or only the Lead?

Both have practical implications for coordination patterns. A teammate broadcasting to `*` expecting to reach only peers may unintentionally wake the Lead.

### 8. Permission Change Mechanism

The reference doc states permissions can be changed after spawning ("change after spawning if needed") but does not describe how. There is no documented command, message type, or UI flow for updating a running teammate's permission mode.

### 9. Model Selection Per Teammate — Interaction With Definition Frontmatter

The reference doc shows that a model can be specified in natural language ("Use Sonnet for each teammate") and that subagent definitions honor the `model` frontmatter field. It does not document what happens when both are specified, or how per-teammate model overrides interact with definition defaults.

### 10. Maximum Team Size — No Quantified Guidance

The "3–5 teammates" recommendation is advisory only. The doc offers one qualitative signal — "three focused teammates often outperform five scattered ones" — but does not quantify:

- What coordination overhead looks like above 5 teammates
- Whether there is a system-imposed ceiling
- At what team size context management or task-list polling becomes a bottleneck
- Cost implications of scaling up

---

## Part 2 — Cross-Cutting Pitfalls

These pitfalls apply broadly across agent team workflows and are not specific to any single use case.

### Crash Recovery Leaves Tasks Stuck

A crashed or force-terminated teammate leaves its owned tasks in `in_progress` indefinitely. The system does not detect this. Plan for it in any workflow where a single teammate owns a blocking task.

**Pattern:** have the Lead poll task status periodically for long-running workflows; nudge or replace a teammate if a task hasn't progressed.

### `TeammateIdle` Hook — Test Before You Trust

All three hook types (`TeammateIdle`, `TaskCreated`, `TaskCompleted`) have undocumented edge cases. `TeammateIdle` in particular has ambiguous trigger semantics. Any workflow that depends on hooks for correctness (not just quality) should be validated with a small test team before full deployment.

### File Conflicts Are Advisory-Only

There is no system-level file locking for teammate file writes. Two teammates writing to the same file will produce a last-write-wins outcome with no warning. This is especially dangerous in parallel implementation workflows.

**Pattern:** in the spawn prompt, explicitly state which files each teammate owns. Never assign overlapping file sets.

### Hook Debounce Is Not Native

The hooks system has no built-in debounce. If a hook script needs to avoid firing repeatedly in rapid succession (e.g., `TeammateIdle` firing multiple times as a teammate cycles through short tasks), debounce must be implemented manually using a timestamp file in the shell script.

```bash
#!/bin/bash
DEBOUNCE_FILE="/tmp/teammate_idle_last_fire"
NOW=$(date +%s)
LAST=$(cat "$DEBOUNCE_FILE" 2>/dev/null || echo 0)
if (( NOW - LAST < 30 )); then exit 0; fi
echo "$NOW" > "$DEBOUNCE_FILE"
# ... hook logic here
```

---

## Part 3 — 10 Real-World Use Cases

Each use case identifies why agent teams outperform subagents or a single session, recommends a team structure, and calls out pitfalls specific to that scenario.

---

### 1. Tiered Support Ticket Triage

**Scenario:** A software team receives 200+ support tickets per week. Most are duplicates or low-severity; a small fraction require deep engineering investigation.

**Why agent teams beat alternatives:** A single agent processes all tickets at full model cost. Subagents don't communicate, so a Haiku pre-screener can't hand off a nuanced ticket with its own assessment attached. Agent teams allow a cost-tiered pipeline where Haiku agents triage at scale, pass findings forward, and Opus engages only on confirmed high-severity issues.

**Team structure:**
- 3× Triage Agents (Haiku) — classify, deduplicate, assign severity; tools restricted to read-only access
- 1× Investigation Lead (Sonnet) — deep-dives on medium-severity escalations
- 1× Escalation Reviewer (Opus) — handles confirmed high-severity issues only

**Workflow:** Triage Agents claim tickets from the task list, classify, and mark complete with a severity tag. Investigation Lead picks up medium-severity completions. Escalation Reviewer is notified only when Investigation Lead explicitly creates a high-severity task.

**Pitfalls:**
- Triage Agents running in parallel may classify the same duplicate ticket independently — deduplicate before creating tasks, or use a TaskCreated hook to detect and block duplicate task creation.
- Crash recovery: if the Escalation Reviewer crashes mid-investigation, the high-severity task stalls. Lead should monitor and spawn a replacement.

---

### 2. Zero-Downtime Database Schema Migration

**Scenario:** Migrating a production database schema across multiple stages (add column → backfill → add constraint → drop old column). Each stage must be verified before the next proceeds.

**Why agent teams beat alternatives:** A single session can't maintain an accumulating cross-stage risk model — it loses context between stages. Subagents report back independently with no shared state. An agent team with a persistent Safety Auditor accumulates observations across all stages and can flag compounding risks that only become visible in combination.

**Team structure:**
- 1× Migration Engineer — writes and executes migration scripts per stage
- 1× Safety Auditor (read-only tools) — reviews each stage and maintains a running risk log
- 1× Rollback Planner — prepares rollback scripts in parallel with each migration stage

**Workflow:** Engineer completes a stage and marks the task complete. TaskCompleted hook triggers a Safety Auditor review before the next stage is unblocked. Auditor approves or blocks. Rollback Planner works in parallel, always one stage ahead.

**Pitfalls:**
- TaskCompleted hook semantics: exit code 2 blocks the completion — verify this is the intended behavior and not a race condition with the next stage task being claimed.
- The Auditor's read-only tools restriction must be set after spawning; cannot be configured at spawn time.

---

### 3. Adversarial API Design

**Scenario:** Designing a new public API where multiple consumer teams have conflicting requirements (mobile app, third-party integrators, internal data pipeline).

**Why agent teams beat alternatives:** A single agent produces a design that satisfies the first requirements it considers. Subagents produce independent designs with no cross-challenge. Agent teams can run structured adversarial debate — each Advocate argues for their consumer's requirements, challenges others' proposals, and forces the Lead to synthesize tradeoffs explicitly.

**Team structure:**
- 3× Consumer Advocates — each represents one consumer type; all route challenges through the Lead
- 1× API Architect (Lead) — synthesizes proposals, adjudicates conflicts, maintains a living tradeoff log

**Workflow:** Lead shares a draft API spec. Each Advocate reviews and sends objections to Lead. Lead synthesizes, updates draft, shares again. Repeat until Advocates' objections are resolved or explicitly overridden with rationale logged.

**Pitfalls:**
- Advocates must route through Lead, not message each other directly — direct peer debate without a moderator tends to loop without convergence.
- Tradeoff log must be a file owned exclusively by the Lead to avoid overwrites.

---

### 4. Red Team / Blue Team Security Audit

**Scenario:** Auditing the security of a new authentication module before release.

**Why agent teams beat alternatives:** A single agent alternating between attack and defense loses the adversarial dynamic — it knows what it just found and defends against it too specifically. Subagents don't share findings in real time. Agent teams allow a genuine adversarial loop where Blue Team doesn't know what Red Team found until Red Team reports it.

**Team structure:**
- 2× Red Team agents — attempt to find vulnerabilities; full read access, no write access to source
- 1× Blue Team agent (read-only tools) — proposes mitigations; read-only prevents accidental application of patches during the audit
- 1× Lead — coordinates finding disclosure timing and maintains the final report

**Workflow:** Red Team agents work in parallel on different attack surfaces. Lead collects findings and discloses to Blue Team in batches. Blue Team proposes mitigations. Red Team reviews mitigations and attempts to bypass them.

**Pitfalls:**
- Blue Team's read-only restriction must be enforced after spawning — it cannot be set at spawn time.
- Red Team agents working in parallel may find the same vulnerability — deduplicate in the Lead before disclosing to Blue Team.

---

### 5. Scientific Literature Synthesis with Idle-Based Rebalancing

**Scenario:** Synthesizing 50+ papers across 5 research domains into a unified literature review.

**Why agent teams beat alternatives:** Papers per domain vary widely — some domains have 3 papers, others have 15. A fixed subagent-per-domain assignment leaves fast-finishing agents idle while slow ones bottleneck. Agent teams with a `TeammateIdle` hook allow the Lead to detect idle agents and assign them overflow work from overloaded teammates.

**Team structure:**
- 5× Domain Analysts — each starts with one domain's paper set
- 1× Lead — monitors progress, reassigns on idle, synthesizes final review

**Workflow:** Analysts claim their domain task. When an Analyst finishes early, `TeammateIdle` fires and alerts the Lead. Lead checks task list for remaining work and assigns overflow papers to the idle Analyst.

**Pitfalls:**
- `TeammateIdle` trigger semantics are ambiguous — test whether the hook fires correctly before relying on it for rebalancing.
- The Lead must act on the idle notification; the hook does not auto-reassign. Lead must be prompted or instructed to check the task list on idle alerts.

---

### 6. Incident Post-Mortem

**Scenario:** Conducting a post-mortem for a production incident that spanned 6 hours and involved 4 teams.

**Why agent teams beat alternatives:** Post-mortems require parallel workstreams (timeline reconstruction, impact assessment, contributing factors, action items) that must share findings in real time. A single agent context-switches and loses thread. Subagents produce siloed reports that the lead then reconciles without the benefit of cross-workstream synthesis.

**Team structure:**
- 1× Timeline Reconstructor — assembles chronological event log from logs/alerts
- 1× Impact Assessor — quantifies customer and system impact
- 1× Contributing Factors Analyst — identifies root causes and contributing conditions
- 1× Action Items Owner — drafts preventive measures based on others' findings
- 1× Lead — coordinates handoffs, resolves conflicts, produces final report

**Workflow:** Timeline Reconstructor and Impact Assessor work in parallel first. When complete, Contributing Factors Analyst and Action Items Owner claim their tasks (which depend on the first two). If Timeline Reconstructor stalls (logs incomplete), `TeammateIdle` alerts Lead, who diagnoses and unblocks.

**Pitfalls:**
- Task dependencies must be set correctly — Contributing Factors must be blocked on both Timeline and Impact tasks completing.
- `TeammateIdle` detecting a blocked Timeline Reconstructor: the hook fires, but Lead must determine whether the block is a data problem (get more logs) or a task design problem (split the task).

---

### 7. Financial Narrative Fact-Checking

**Scenario:** Verifying that the qualitative claims in a financial report narrative match the underlying quantitative data.

**Why agent teams beat alternatives:** A single agent reads the narrative and then checks the data, but may rationalize inconsistencies it finds. Two agents with different priors — one starting from the narrative, one from the numbers — and then challenging each other's interpretation surfaces inconsistencies more reliably.

**Team structure:**
- 1× Narrative Analyst — reads the report text, extracts all quantitative claims
- 1× Numbers Auditor (read-only tools) — independently analyzes the underlying data
- 1× Lead — manages the challenge loop and produces a discrepancy report

**Workflow:** Narrative Analyst and Numbers Auditor work in parallel. Lead collects both sets of findings and routes them to each other for challenge. Each agent must explicitly address discrepancies identified by the other. Lead produces a final discrepancy report with severity ratings.

**Pitfalls:**
- Numbers Auditor's read-only restriction is integrity-critical — it must not be able to modify source data during the audit. Verify restriction is applied correctly after spawning.
- Challenge loop can cycle without resolution — Lead should set a maximum round count and escalate unresolved discrepancies to human review.

---

### 8. Adaptive Curriculum Builder

**Scenario:** Building a structured learning curriculum where units must be created in dependency order — foundational concepts before advanced applications.

**Why agent teams beat alternatives:** A single agent may generate units out of order as ideas surface. A `TaskCreated` hook gives the team a guardrail: any task (curriculum unit) being created out of dependency order is blocked before it lands in the task list.

**Team structure:**
- 3× Content Creators — each owns a subject area; creates unit tasks and writes content
- 1× Curriculum Sequencer — validates unit ordering and manages the dependency graph
- 1× Lead — oversees the TaskCreated hook logic and resolves sequencing conflicts

**Workflow:** Content Creators propose new units by creating tasks. TaskCreated hook fires for each new task — a validation script checks whether the unit's prerequisites exist as completed tasks. If not, the hook returns exit code 2 with feedback identifying the missing prerequisite. Content Creator must create the prerequisite first.

**Pitfalls:**
- TaskCreated hook is a guardrail against Lead/teammate error, not a scheduling mechanism. It does not automatically create prerequisite tasks.
- Hook script must have access to the task list to check prerequisite completion status — verify the hook's execution environment has the necessary permissions.

---

### 9. Multi-Jurisdiction Legal Comparison

**Scenario:** Comparing contract terms across 5 jurisdictions to identify clauses that create cross-jurisdictional conflicts for a multinational agreement.

**Why agent teams beat alternatives:** Jurisdiction-specific analysis requires deep focus per jurisdiction — a single agent switching between jurisdictions loses nuance. But conflict identification requires cross-jurisdiction comparison that siloed subagents can't do. Agent teams allow parallel per-jurisdiction deep dives followed by structured cross-comparison.

**Team structure:**
- 5× Jurisdiction Analysts (all read-only) — each owns one jurisdiction; analyzes applicable law and flags clauses of concern
- 1× Conflict Identifier — cross-references Analysts' findings to identify inter-jurisdiction conflicts
- 1× Lead — coordinates disclosure timing and produces a human-attorney-ready conflict report

**Workflow:** Jurisdiction Analysts work in parallel. When all complete, Conflict Identifier claims its task (blocked on all 5 Analyst tasks). Conflict Identifier identifies conflicts and routes report to Lead. Lead formats for attorney review.

**Pitfalls:**
- Agents identify conflicts for human attorney resolution — they must not negotiate, draft compromise language, or make legal recommendations. This must be explicit in every spawn prompt.
- All agents must be read-only — no agent should modify source contract documents. Enforce after spawning.
- Conflict Identifier task must be blocked on all 5 Analyst tasks — missing even one dependency risks incomplete analysis.

---

### 10. Post-Campaign A/B Test Analysis

**Scenario:** Analyzing results from a multi-variant marketing campaign across 8 customer segments after the campaign has concluded (batch analysis, not live monitoring).

**Why agent teams beat alternatives:** 8 segments × multiple metrics = analysis that benefits from parallelism. But interaction effects between segments (a variant that wins in segment A but loses in segment B due to demographic overlap) require cross-segment synthesis that siloed subagents can't produce. Agent teams allow parallel segment analysis followed by a Lead-level synthesis that specifically hunts for cross-segment interactions.

**Team structure:**
- 4× Segment Analysts (Haiku) — each owns 2 segments; produces per-segment summary with statistical significance flags
- 1× Interaction Detector (Sonnet) — reviews all segment summaries and identifies cross-segment interaction effects
- 1× Lead (Opus) — synthesizes final recommendation with confidence intervals

**Workflow:** Segment Analysts claim their segment pairs from the task list. Interaction Detector task is blocked on all 4 Analyst tasks. Lead synthesis task is blocked on Interaction Detector completing.

**Pitfalls:**
- This is a batch analysis of concluded campaign data — do not design this as a live monitoring loop. Agent teams are not suited for 48-hour continuous polling workflows.
- Haiku analysts may miss subtle patterns — Interaction Detector should not treat Analyst summaries as exhaustive; it should re-examine raw data for interactions the Analysts may have deprioritized.
- Cost split (Haiku for volume, Opus for synthesis) only works if the task structure keeps Opus genuinely focused on synthesis, not re-doing the Haiku work.
