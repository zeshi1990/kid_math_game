# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive math game for a 5-year-old child. Each session has 20 addition/subtraction problems with numbers 0–10 (no negative results). Correct answers reward a strawberry-jam bread (🍞); wrong answers give a rotten banana (🍌).

## Game Rules

- Problems: addition and subtraction only, operands and results in range [0, 10]
- Subtraction must never produce a negative result (enforced in `src/utils/problemGenerator.ts`)
- Session length: exactly 20 problems
- Input: tap-to-set number keyboard (tapping a button sets the answer to that number; 10 is a dedicated button)
- Feedback: 1500ms full-screen overlay (green/bread or red/banana) with sound, then auto-advance
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

## Architecture

```
src/
  types/game.ts              # Shared interfaces: Problem, GamePhase, SessionResult, etc.
  utils/problemGenerator.ts  # Pure function: generates N valid problems (no negatives)
  hooks/useGameLogic.ts      # Central state machine — drives all phase transitions
  hooks/useSound.ts          # Preloads and plays yay.mp3 / buzzer.mp3
  components/
    StartScreen.tsx           # Welcome/rules screen
    GameScreen.tsx            # Orchestrates question display + number pad
    ProblemDisplay.tsx        # Renders "A + B = ?" with fade-slide animation
    NumberPad.tsx             # 0–10 tap buttons + Check button
    FeedbackOverlay.tsx       # Full-screen correct/wrong overlay with pop-in animation
    ProgressBar.tsx           # Question X of 20
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
