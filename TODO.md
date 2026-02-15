# TODO

## 1. Completion feedback polish
Short description:
Improve solved and not solved feedback so results feel clear, calm, and premium on mobile screens.

Acceptance criteria:
* Completion feedback uses clear success and not solved visual states
* Feedback appears without layout jump
* Feedback remains readable on small screens
* Existing check behavior remains unchanged

## 2. Local storage and resume game
Short description:
Persist active game state in browser storage so a player can close and reopen the app and continue.

Acceptance criteria:
* Grid values are restored after reload
* Notes are restored after reload
* Undo history is restored after reload
* Difficulty and key settings are restored after reload
* New game resets saved state correctly

## 3. Timer no best time tracking
Short description:
Add a simple in game timer for player awareness with no records, leaderboards, or best time features.

Acceptance criteria:
* Timer starts on puzzle load
* Timer pauses when app tab is not active
* Timer resumes correctly on return
* Timer resets on new game
* No best time data is stored or shown

## 4. Smooth highlight transitions
Short description:
Refine grid highlight transitions so selection and conflict updates feel smooth and intentional.

Acceptance criteria:
* Selection transitions are smooth
* Row, column, and box shading updates are smooth
* Conflict highlight changes are smooth
* No visible lag during input on common mobile devices

## 5. New game flow refinement
Short description:
Improve new game flow so difficulty choice and confirmation feel predictable and polished.

Acceptance criteria:
* New game action is clear from keypad controls
* Difficulty change before new game is reflected immediately
* Starting a new game clears transient status cleanly
* New puzzle loading state is clearly shown
