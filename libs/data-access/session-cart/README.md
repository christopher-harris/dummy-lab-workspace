# 🤖 data-access-session-cart

Owns the current browser session's cart state and persistence boundary. Its
public API currently re-exports the shared cart models; a later implementation
will add Signal Store state and domain events without introducing UI.

## Running unit tests

Run `npm exec -- nx test data-access-session-cart` to execute the unit tests.
