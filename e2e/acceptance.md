# Disputes acceptance coverage

| Requirement                                                                    | Playwright coverage                                                                            |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Shell, heading, logo, and active navigation                                    | [Shell](shell.e2e.ts) across desktop and mobile projects                                       |
| Initial data, table, row counter, loading, error, empty state, and retry       | [Overview](disputes-overview.e2e.ts)                                                           |
| Creation, field validation, decimal precision, currencies, and cancellation    | [Create dispute](create-dispute.e2e.ts)                                                        |
| New record defaults, count, local date, success toast, and failed/pending save | [Create dispute](create-dispute.e2e.ts)                                                        |
| Removal confirmation and cancellation, failure, focus, and selected-row update | [Remove dispute](remove-dispute.e2e.ts)                                                        |
| Last-row removal, recreation, ID continuity, and reset on reload               | [Remove dispute](remove-dispute.e2e.ts)                                                        |
| Worker startup and interception of the first disputes request                  | [Worker readiness](mock-readiness.e2e.ts)                                                      |
| Toast announcement, replacement and duration, and short mobile dialog sizing   | [Final checks](final-checks.e2e.ts)                                                            |
| Axe scans on the overview, invalid creation, and removal confirmation          | [Shell](shell.e2e.ts), [creation](create-dispute.e2e.ts), and [removal](remove-dispute.e2e.ts) |

Keep traces and failure screenshots in the ignored test artifacts. The delivery review compares desktop and phone captures directly with the assignment figures.
