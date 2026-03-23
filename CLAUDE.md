# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive math game for a 5-year-old child. Each session has 10 problems. Correct answers reward a strawberry-jam bread (🍞); wrong answers give a rotten banana (🍌).

## Game Rules

- Problems: addition and subtraction only
- Regular problems: both operands in [1, 9/10], results in [0, 10] — zero operands are never used
- Subtraction never produces a negative result
- 1 challenge problem per session: addition with sum in (10, 20], or subtraction with operandA in [11, 20]
- Challenge problems show extra 11–20 buttons in the number pad
- Session length: exactly 10 problems
- 30-second countdown timer per question; timeout auto-counts as wrong
- Feedback: 1500ms full-screen overlay (green/bread or red/banana) with sound, then auto-advance
- Last 10 session results are persisted in localStorage
- Target audience: 5-year-old — large touch targets (min 72×72px), bright colors, animations

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `tailwind.config.ts` needed)
- Vitest + Testing Library for unit tests
- No backend, no router library, no state management library

## Development Commands

```bash
npm run dev       # start dev server (http://localhost:5173)
npm run build     # production build
npm run preview   # preview production build
npm test          # run all Vitest tests
npx vitest run src/utils/problemGenerator.test.ts  # run a single test file
```

## Verification Step

After every code change, run the following before committing:

```bash
npx vitest run && npm run build
```

Both must pass (zero test failures, clean build) before committing and pushing.

## Architecture

```
src/
  types/game.ts              # Shared interfaces: Problem, GamePhase, SessionResult, etc.
  utils/problemGenerator.ts  # Generates N valid problems (9 regular + 1 challenge per session)
  hooks/useGameLogic.ts      # Central state machine — drives all phase transitions + 30s timer
  hooks/useSound.ts          # Preloads and plays yay.mp3 / buzzer.mp3
  components/
    StartScreen.tsx           # Welcome/rules screen + session history from localStorage
    GameScreen.tsx            # Orchestrates question display, timer badge, number pad
    ProblemDisplay.tsx        # Renders "A + B = ?" with fade-slide animation
    NumberPad.tsx             # 0–10 buttons; shows 11–20 row when isChallenge=true
    FeedbackOverlay.tsx       # Full-screen correct/wrong overlay with pop-in animation
    ProgressBar.tsx           # Question X of 10
    SummaryScreen.tsx         # End-of-session results with bread/banana tally
  App.tsx                    # Phase router: start → playing/feedback → summary
```

**State lives entirely in `useGameLogic`** — all components receive data/callbacks as props. Game phases: `start → playing → feedback → playing → ... → summary`.

## Sound Assets

Place `yay.mp3` and `buzzer.mp3` in `public/sounds/`. See `public/sounds/README.txt` for sources. Missing files are handled gracefully (no crash).

## CSS Animations

Custom keyframes in `src/index.css`:
- `.pop-in` — used by `FeedbackOverlay` entrance
- `.fade-slide-in` — used by `ProblemDisplay` on each new question (keyed by `currentIndex`)
