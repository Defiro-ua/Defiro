Story: UC__ · <!-- branch named after the story, e.g. UC18-reject-reasons -->

## What and why

## Definition of Done
- [ ] Tests were written first; a fixed defect starts with a test that reproduced it
- [ ] Every accepted SonarQube issue has a written reason
- [ ] Tests or code drafted by AI were audited: what would make each test fail?

CI enforces the rest: format, build, unit and integration tests, quality gate,
dependency and workflow checks.

## For the reviewer
Read the tests first, and ask what would make them fail.
