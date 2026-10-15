# 🤖 Nutrition seed — spike tooling

Parses the Wingstop corporate nutritional guide PDF into `nutrition-item` rows and POSTs them to a
local Strapi. Used once, on 8 Oct 2026, to seed 97 rows. Kept because redoing the parse from
scratch is an hour of work.

```bash
curl -sSL -o nutrition.pdf \
  "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"

python3 parse_pdf.py nutrition.pdf            # dump the positioned rows, to eyeball
python3 seed_nutrition.py "$TOKEN" --dry-run  # parse + show the payloads, write nothing
python3 seed_nutrition.py "$TOKEN"            # POST to http://localhost:1337, published
```

No dependencies — `parse_pdf.py` walks the PDF content streams and reconstructs rows from glyph
positions, because the naive text extraction loses all row and column structure.

## ⚠️ This is spike tooling, not a pipeline

- **The values are not verified.** Row counts line up section by section and the output looks
  clean, but nothing has been spot-checked against the PDF. Do not treat the seeded numbers as
  authoritative.
- Section titles are matched **by document order**, not by text — they render as overlapping text
  runs (`CholesterolTENDERSSodium`), so the six categories are assumed to appear in the order
  listed in `CATEGORIES`. A new section in a future PDF silently shifts every row after it.
- Beverages have a different column set (nine vs seventeen) and are mapped to the six nutrients
  they actually carry.
- `seed_nutrition.py` only ever creates. Re-running it duplicates every row.
