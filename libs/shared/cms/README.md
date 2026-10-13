# shared-cms

CMS request context every content-bearing `data-access` library needs to build
its own requests — today, the preview contract (`CMS_PREVIEW`, `CmsStatus`).

Here rather than in `@dummy-lab/data-access-content` because `content`,
`pages` and `nutrition` all read it, and a `data-access` library may not depend
on a peer one (ADR-0001). It is request context in the same sense auth is, not
a domain.

Import path: `@dummy-lab/shared-cms`

## Running unit tests

Run `nx test shared-cms`.
