When working on tests:

- Follow the project's existing test structure and naming conventions.
- Write tests for behavior, not implementation.
- Prefer real objects over mocks. Use mocks only at system boundaries.
- Each test should test one behavior and have a clear name describing that behavior.
- Integration tests prove system behavior. Unit tests prove component behavior. Use both.
- Test the sad path: invalid inputs, missing data, network failures, permission errors.
- Keep test setup minimal and readable. Extract shared setup into helpers.
