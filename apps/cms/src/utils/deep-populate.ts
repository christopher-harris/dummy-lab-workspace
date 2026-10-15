/**
 * Schema-derived populate for dynamic zones.
 *
 * Strapi's `populate=*` reaches exactly one level. On a dynamic zone that
 * means each block comes back with its own declared fields and nothing
 * nested — and since the content/settings split every real field on a block
 * lives one level further in, under `content`. So `populate[blocks][populate]=*`
 * returns a block with its scalars and without its media or nested
 * components. Verified against `/nutrition` on 9 Oct 2026: the nutrition
 * table came back with `heading` and `intro` but no `categories` (the ordered
 * list the table renders from) and no `pdf`.
 *
 * The alternative Strapi offers is the `on` fragment API, one entry per
 * component uid, which is a whitelist: a component in the zone that is not
 * named is dropped from the response entirely, with a 200. Maintaining that
 * list by hand on the client is what produced `blocks: []` for a page that
 * had a block.
 *
 * This builds the `on` tree from the live schema instead, so the list cannot
 * drift: `strapi.components` is the same source the admin and the database
 * are built from, read per request. A block added in Strapi is populated the
 * moment it exists, and the frontend sends no block-specific query at all.
 *
 * Ported from `project-foundry` (`apps/api/src/utils/deep-populate.ts`).
 *
 * ⚠️ **Boundary: relations are not populated.** Only `media` and `component`
 * attributes are walked. A block that gains a relation — to `nutrition-item`,
 * a menu collection, a store locator — will come back without it, silently,
 * exactly like the bug this file exists to fix. That is deliberate: a
 * relation can pull an unbounded set, and "as deep as possible" stops being
 * cheap the moment a block points at a collection. When the first relation
 * lands on a block, this is the decision to revisit, not to quietly extend.
 */

type SchemaAttribute = {
  type: string;
  component?: string;
};

type ComponentSchema = {
  attributes?: Record<string, SchemaAttribute>;
};

type ContentTypeSchema = {
  attributes?: Record<string, { components?: string[] }>;
};

export type StrapiSchemaSource = {
  components: Record<string, ComponentSchema>;
  contentTypes: Record<string, ContentTypeSchema>;
};

type PopulateNode = true | { populate: Record<string, PopulateNode> };

/**
 * The populate tree for one component: every media field, and every nested
 * component expanded recursively.
 *
 * `seen` carries the uids already on this branch so a self-referential
 * component (or a cycle between two) populates one level and stops rather
 * than recursing until the stack gives out.
 */
function buildComponentPopulate(
  source: StrapiSchemaSource,
  componentUid: string,
  seen: Set<string>,
): Record<string, PopulateNode> | undefined {
  const schema = source.components[componentUid];

  if (!schema?.attributes) {
    return undefined;
  }

  const populate: Record<string, PopulateNode> = {};

  for (const [key, attribute] of Object.entries(schema.attributes)) {
    if (attribute.type === 'media') {
      populate[key] = true;
      continue;
    }

    if (attribute.type === 'component' && attribute.component) {
      if (seen.has(attribute.component)) {
        populate[key] = true;
        continue;
      }

      const nested = buildComponentPopulate(
        source,
        attribute.component,
        new Set([...seen, attribute.component]),
      );

      populate[key] = nested ? { populate: nested } : true;
    }
  }

  return Object.keys(populate).length ? populate : undefined;
}

/**
 * The `{ on: … }` populate for a dynamic zone, covering every component the
 * zone allows.
 */
export function buildDeepDynamicZonePopulate(
  source: StrapiSchemaSource,
  componentUids: readonly string[],
): { on: Record<string, PopulateNode> } {
  const on: Record<string, PopulateNode> = {};

  for (const uid of componentUids) {
    const populate = buildComponentPopulate(source, uid, new Set([uid]));
    on[uid] = populate ? { populate } : true;
  }

  return { on };
}

type QueryContext = { query: Record<string, unknown> };

/**
 * Was this zone asked for at all?
 *
 * The rule: **the caller names which fields it wants, the server decides how
 * deep.** A request that does not mention the zone does not get it, which
 * keeps Strapi's own default behaviour intact and — the reason this check
 * exists — keeps the prerender manifest query lean. `pagePathsUrl` asks for
 * `fields[0]=path` and `seo.noindex` to build the sitemap and the route list;
 * forcing the zone onto every `find` would make that query drag every block
 * of every page back with it on every build.
 *
 * A top-level `populate=*` deliberately does **not** count. Strapi's populate
 * is either a string or an object, never both, so honouring the wildcard here
 * would mean replacing it with `{ [zone]: … }` and silently dropping every
 * other field it was populating. Leaving it alone keeps `populate=*` behaving
 * exactly as Strapi documents it — one level, shallow blocks — rather than
 * making it mean something subtly different on these two content types.
 */
function zoneWasRequested(
  query: Record<string, unknown>,
  zone: string,
): boolean {
  const populate = query.populate;

  if (typeof populate !== 'object' || populate === null) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(populate, zone);
}

/**
 * Replaces whatever the caller asked for on `zone` with the full,
 * schema-derived populate tree.
 *
 * Overriding rather than merging is the point: the client is not supposed to
 * know what a block contains, so whatever it sent for this field — `true`,
 * `'*'`, a hand-built `on` map — is treated as "populate this zone" and
 * nothing more.
 */
export function applyDeepZonePopulate(
  source: StrapiSchemaSource,
  ctx: QueryContext,
  contentTypeUid: string,
  zone: string,
): void {
  if (!zoneWasRequested(ctx.query, zone)) {
    return;
  }

  const componentUids =
    source.contentTypes[contentTypeUid]?.attributes?.[zone]?.components ?? [];

  if (!componentUids.length) {
    return;
  }

  const existing =
    typeof ctx.query.populate === 'object' && ctx.query.populate !== null
      ? (ctx.query.populate as Record<string, unknown>)
      : {};

  ctx.query = {
    ...ctx.query,
    populate: {
      ...existing,
      [zone]: buildDeepDynamicZonePopulate(source, componentUids),
    },
  };
}
