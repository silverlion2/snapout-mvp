# Design Notes: Persistent Ledger

## Information Hierarchy

The active run keeps priority. The persistent ledger sits in the existing ledger card and shows: storage status, lifetime retained summary, recent entries, then the clear action.

## Journeys And Five States

- First visit / empty: explain that records stay only on this device.
- Loading: announce that local history is being read without blocking game start.
- Success: show retained count, avoided-risk total, and recent decisions.
- Partial: show retained valid records and the number ignored during recovery.
- Error: say that this run still works but history may disappear after refresh; offer retry where meaningful.
- Cleared: return to the empty state with polite confirmation.

## Responsive And Accessibility Rules

- At 320px, summary tiles stack without horizontal scrolling; ledger actions remain at least 44px tall.
- At desktop widths, the ledger remains in the game sidebar and does not displace primary decisions.
- Buttons use semantic names, visible focus rings, and native keyboard activation.
- Clear uses an inline two-step confirmation with confirm and cancel controls; focus moves to confirm and returns to clear/cancel context.
- Storage status and mutations use `aria-live="polite"`; errors use `role="alert"`.
- Existing reduced-motion behavior remains intact.
