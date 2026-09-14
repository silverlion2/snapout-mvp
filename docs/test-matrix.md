# Test Matrix

| Area | Scenario | Expected evidence |
|---|---|---|
| Unit | empty/missing storage | valid empty v1 ledger |
| Unit | valid append | newest record retained and summary updated |
| Unit | more than 40 records | bounded newest history |
| Unit | malformed JSON / wrong version | recoverable empty partial state |
| Unit | mixed invalid records | valid subset retained; dropped count reported |
| Unit | read/write/remove throws | structured unavailable result; no uncaught error |
| UI | first visit | local-only empty explanation |
| UI | decision then refresh | retained entry and totals return |
| UI | clear / cancel | explicit confirmation; only SnapOut data removed |
| UI | storage unavailable | gameplay works; visible temporary-mode copy |
| UI | keyboard | start, decide, open clear, cancel/confirm reachable |
| Responsive | 320px, tablet, desktop | no horizontal clipping; 44px actions |
| Responsive regression | 320px viewport with a vertical scrollbar | body does not enforce a wider minimum layout or expose horizontal scrolling |
| Quality | test, lint, build | all configured native commands pass |
| Security | audit + secret scan | no high production advisory; no committed secrets |
