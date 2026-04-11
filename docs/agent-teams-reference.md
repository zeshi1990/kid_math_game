# Agent Teams Reference Guide

> Source: https://code.claude.com/docs/en/agent-teams
> Requires: Claude Code v2.1.32+, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

---

## What Are Agent Teams?

Multiple independent Claude Code sessions coordinated by a **team lead**. Unlike subagents (which only report back to the caller), teammates share a task list and can message each other directly.

---

## Subagents vs Agent Teams

| | Subagents | Agent Teams |
|---|---|---|
| Context | Own window; results return to caller | Own window; fully independent |
| Communication | Report to main agent only | Teammates message each other directly |
| Coordination | Main agent manages all work | Shared task list, self-coordination |
| Best for | Focused tasks where only the result matters | Complex work requiring discussion/collaboration |
| Token cost | Lower | Higher (each teammate is a separate Claude instance) |

**Rule of thumb:** Use subagents for quick focused workers; use agent teams when teammates need to share findings, challenge each other, and coordinate on their own.

---

## Enable

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

---

## Architecture

| Component | Role |
|---|---|
| **Team lead** | Main session — creates team, spawns teammates, coordinates work |
| **Teammates** | Separate Claude Code instances, each owns assigned tasks |
| **Task list** | Shared work items with pending / in-progress / completed states + dependencies |
| **Mailbox** | Direct messaging between any two agents by name |

**Storage (auto-managed — do not edit by hand):**
- Team config: `~/.claude/teams/{team-name}/config.json`
- Task list: `~/.claude/tasks/{team-name}/`

---

## Starting a Team

Tell the lead in natural language:

```
Create an agent team to explore X. Spawn three teammates:
- One focused on Y
- One focused on Z
- One playing devil's advocate
```

Claude creates the team, spawns teammates, and coordinates based on the prompt. It will also propose a team on its own if it determines the task would benefit from parallel work — you confirm before it proceeds.

---

## Display Modes

| Mode | How to use | Requirement |
|---|---|---|
| **in-process** (default) | All teammates in main terminal; Shift+Down to cycle | Any terminal |
| **split-pane** | Each teammate gets its own pane | tmux or iTerm2 with `it2` CLI |

Override globally in `~/.claude.json`:
```json
{ "teammateMode": "in-process" }
```

Or per session:
```bash
claude --teammate-mode in-process
```

**Auto mode** (`"auto"`, the default): uses split panes if already inside tmux, in-process otherwise.

---

## Key Controls (In-Process Mode)

| Action | Control |
|---|---|
| Cycle through teammates | Shift+Down |
| Send message to current teammate | Type and Enter |
| Interrupt current teammate turn | Enter to view session, then Escape |
| Toggle task list | Ctrl+T |

---

## Controlling the Team

### Specify teammates and model
```
Create a team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```

### Require plan approval before implementation
```
Spawn an architect teammate to refactor the auth module.
Require plan approval before they make any changes.
```
Lead approves/rejects plans autonomously. To influence: "only approve plans that include test coverage."

### Assign tasks
- **Lead assigns explicitly**: tell the lead which task goes to which teammate
- **Self-claim**: teammate picks up next unassigned, unblocked task after finishing

### Shut down a teammate
```
Ask the researcher teammate to shut down
```
Teammate can accept or reject with explanation.

### Clean up the team (always use the lead)
```
Clean up the team
```
Fails if any teammates are still running — shut them down first.

---

## Context and Communication

- Teammates load the same project context as a regular session: `CLAUDE.md`, MCP servers, skills
- **The lead's conversation history does NOT carry over to teammates**
- Always include task-specific details in the spawn prompt

### Messaging patterns
- **message**: send to one specific teammate by name
- **broadcast**: send to all teammates simultaneously — use sparingly (cost scales with team size)
- Teammate messages are delivered automatically; lead doesn't need to poll
- When a teammate finishes, it automatically notifies the lead

---

## Task Dependencies

Tasks can depend on other tasks. A pending task with unresolved dependencies cannot be claimed until those dependencies complete. The system unblocks tasks automatically when their dependencies finish.

Task claiming uses **file locking** to prevent race conditions when multiple teammates try to claim the same task simultaneously.

---

## Hooks for Quality Gates

| Hook | Trigger | Use case |
|---|---|---|
| `TeammateIdle` | Teammate about to go idle | Exit code 2 to send feedback and keep working |
| `TaskCreated` | Task being created | Exit code 2 to block creation with feedback |
| `TaskCompleted` | Task being marked complete | Exit code 2 to block completion with feedback |

---

## Permissions

- Teammates start with the lead's permission settings
- If lead runs `--dangerously-skip-permissions`, all teammates do too
- Cannot set per-teammate modes at spawn time — change after spawning if needed

---

## Using Subagent Definitions for Teammates

Define a role once (e.g., `security-reviewer`) and reuse it as both a subagent and a teammate:

```
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```

- The definition's `tools` allowlist and `model` are honored
- The definition's body appends to the teammate's system prompt (does not replace it)
- Team coordination tools (`SendMessage`, task tools) are always available even when `tools` restricts others
- `skills` and `mcpServers` frontmatter fields are **not** applied when running as a teammate

---

## Best Practices

### Team size
- **Start with 3–5 teammates** for most workflows
- Aim for **5–6 tasks per teammate** — keeps everyone productive without excessive context switching
- Scale up only when the work genuinely benefits from simultaneous work; three focused teammates often outperform five scattered ones

### Task sizing
- **Too small**: coordination overhead exceeds benefit
- **Too large**: teammates work too long without check-ins, increasing wasted effort risk
- **Just right**: self-contained units producing a clear deliverable (a function, a test file, a review)

### Avoid file conflicts
Two teammates editing the same file leads to overwrites. Each teammate should own a different set of files.

### Give teammates enough context in the spawn prompt
```
Spawn a security reviewer with the prompt: "Review src/auth/ for security vulnerabilities.
Focus on token handling, session management, and input validation. The app uses
JWT tokens stored in httpOnly cookies. Report issues with severity ratings."
```

### Keep the lead delegating, not implementing
If the lead starts doing work itself instead of waiting for teammates:
```
Wait for your teammates to complete their tasks before proceeding
```

### Monitor and steer
Check in on teammates' progress regularly. Letting a team run unattended too long increases the risk of wasted effort.

### Start with research/review tasks
If new to agent teams: start with PR reviews, library research, or bug investigation. Clear boundaries, no parallel file-writing conflicts.

---

## Best Use Cases

| Use case | Why agent teams help |
|---|---|
| **Research & review** | Multiple teammates investigate different aspects simultaneously, then challenge each other's findings |
| **New modules/features** | Each teammate owns a separate piece without stepping on each other |
| **Debugging competing hypotheses** | Teammates test different theories in parallel; adversarial debate finds root cause faster |
| **Cross-layer changes** | Frontend, backend, and tests each owned by a different teammate |

**Not ideal for:** sequential tasks, same-file edits, work with many dependencies → use a single session or subagents instead.

---

## Example Prompts

### Parallel code review
```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

### Competing hypotheses debugging
```
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific debate.
Update the findings doc with whatever consensus emerges.
```

### Parallel feature implementation
```
Create a team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```

---

## Limitations (Experimental)

| Limitation | Workaround |
|---|---|
| No session resumption with in-process teammates (`/resume`, `/rewind` don't restore teammates) | Tell lead to spawn new teammates after resuming |
| Task status can lag (teammates fail to mark tasks complete) | Check if work is done, update status manually or nudge via lead |
| Slow shutdown (waits for current request/tool call to finish) | Expected behavior |
| One team per session | Clean up current team before starting a new one |
| No nested teams | Only the lead can spawn teammates |
| Lead is fixed for team lifetime | Can't promote teammates or transfer leadership |
| Split panes require tmux or iTerm2 | Use in-process mode in VS Code, Windows Terminal, Ghostty |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Teammates not appearing | Press Shift+Down (may already be running); check tmux is in PATH (`which tmux`) |
| Too many permission prompts | Pre-approve common operations in permission settings before spawning |
| Teammate stopped on error | Send additional instructions directly or spawn a replacement |
| Lead shuts down before work is done | Tell it to keep going / wait for teammates |
| Orphaned tmux session | `tmux ls` then `tmux kill-session -t <session-name>` |
