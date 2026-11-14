# Disputes acceptance coverage

| Requirement                                                                   | Playwright coverage                                                |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Shell, heading, logo, and keyboard interaction                                | `shell.e2e.ts` across Chromium, Firefox, WebKit, and mobile WebKit |
| Shell accessibility                                                           | `shell.e2e.ts` axe scans in desktop Chromium and mobile WebKit     |
| Initial data, table, row counter, empty/loading/error, and retry              | Overview workflows in Step 16                                      |
| Creation, exact field errors, currencies, decimal precision, and cancellation | Creation workflows in Step 17                                      |
| New row defaults, count, date, success toast, and failed/pending create       | Creation workflows in Step 17                                      |
| Removal confirmation, dismissal methods, failure, and focus restoration       | Removal workflows in Step 18                                       |
| Last-row removal, recreation, and ID continuity                               | Combined workflow in Step 18                                       |
| Worker readiness, session reset, and optimized demo                           | Steps 8, 16–19                                                     |
| Toast replacement/duration, narrow-screen workflows, and visual comparison    | Steps 17–20                                                        |

Store reviewed visual baselines with the owning spec. Keep traces and failure screenshots in the ignored test artifacts. Update image baselines only after reviewing the changes against the assignment figures.
