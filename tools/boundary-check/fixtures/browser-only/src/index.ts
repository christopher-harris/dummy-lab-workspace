/**
 * Not a real library. Nothing in this workspace is browser-only today, so
 * `tools/boundary-check` needs something to aim a `platform:universal` import
 * at. It is tagged `type:util` on purpose: every tier may import a util, so
 * the platform rule is the only one that can reject it.
 */
export const BROWSER_ONLY_FIXTURE = true;
