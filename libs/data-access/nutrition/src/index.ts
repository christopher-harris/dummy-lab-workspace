export * from './lib/events';
export * from './lib/models';
export * from './lib/store';
// `api.ts` is deliberately absent — ADR-0004 keeps the repository private so
// the store stays the only way into this domain's server access.
