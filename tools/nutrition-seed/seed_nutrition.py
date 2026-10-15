"""Parse the Wingstop nutritional guide PDF and seed `nutrition-item` in Strapi.

Spike data. The PDF is parsed from positioned glyphs, so every value should be
spot-checked against the source before anyone treats it as authoritative.
"""
import json, re, sys, urllib.request
from parse_pdf import streams, text_items, rows  # noqa

PDF = 'nutrition.pdf'
CMS = 'http://localhost:1337'
TOKEN = sys.argv[1]

# Section headers in document order. The titles render as split, overlapping
# text runs ("CholesterolTENDERSSodium"), so they are matched by position in the
# document rather than by their mangled text.
CATEGORIES = [
    ('classic-wings', 'Classic Wings'),
    ('boneless-wings', 'Boneless Wings'),
    ('chicken-tenders', 'Chicken Tenders'),
    ('chicken-sandwich', 'Chicken Sandwich'),
    ('sides', 'Sides'),
    ('beverages', 'Beverages'),
]

FOOD_FIELDS = [
    'calories', 'totalFat', 'saturatedFat', 'transFat', 'cholesterol', 'sodium',
    'totalCarbohydrate', 'dietaryFiber', 'totalSugars', 'addedSugars', 'protein',
    'vitaminD', 'calcium', 'iron', 'potassium',
]

def num(s):
    s = s.strip().replace(',', '')
    if s in ('', '-', '--'): return None
    try: return float(s)
    except ValueError: return None

def clean(c):
    return re.sub(r'\s+', ' ', c).strip()

all_rows = []
for st in streams(open(PDF, 'rb').read()):
    its = text_items(st)
    if its:
        all_rows.append(rows(its))

items = []
section = -1
order = 0
for page_rows in all_rows:
    for _y, cells in page_rows:
        texts = [clean(c[1]) for c in cells]
        if not texts or not texts[0]:
            continue
        # Section header: a lone all-caps cell that is not the document title.
        if len(texts) == 1:
            t = texts[0].upper()
            if t == 'NUTRITIONAL GUIDE':
                continue
            if re.fullmatch(r'[A-Z ]{4,}', t):
                section += 1
                order = 0
            continue
        if section < 0 or section >= len(CATEGORIES):
            continue
        category = CATEGORIES[section][0]
        name, second = texts[0], texts[1]

        if category == 'beverages':
            # name | portion | ml | kcal | calFromFat | totalFat | satFat | sugars | sodium | carbs
            if len(texts) != 10 or second not in ('Regular', 'Large'):
                continue
            v = [num(t) for t in texts[2:]]
            ml, kcal, _cff, fat, sat, sugars, sodium, carbs = v
            if kcal is None: continue
            item = {
                'name': name, 'category': category,
                'servingSize': f'{second} ({int(ml)} ml)' if ml else second,
                'calories': int(kcal), 'totalFat': fat, 'saturatedFat': sat,
                'totalSugars': sugars, 'sodium': sodium, 'totalCarbohydrate': carbs,
            }
        else:
            # name | serving | 15 nutrients
            if len(texts) != 17 or not re.match(r'^[\d.]+\s*(ea|oz|Sticks)', second):
                continue
            v = [num(t) for t in texts[2:]]
            if v[0] is None: continue
            item = {'name': name, 'category': category, 'servingSize': second}
            for field, value in zip(FOOD_FIELDS, v):
                item[field] = int(value) if field == 'calories' else value

        order += 1
        item['sortOrder'] = order
        items.append({k: val for k, val in item.items() if val is not None})

print(f'parsed {len(items)} items')
from collections import Counter
for cat, n in Counter(i['category'] for i in items).items():
    print(f'  {cat}: {n}')

if '--dry-run' in sys.argv:
    print(json.dumps(items[:2], indent=2))
    sys.exit(0)

created = 0
for item in items:
    req = urllib.request.Request(
        f'{CMS}/api/nutrition-items?status=published',
        data=json.dumps({'data': item}).encode(),
        headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req) as r:
            if r.status in (200, 201): created += 1
    except Exception as e:
        body = e.read().decode()[:300] if hasattr(e, 'read') else str(e)
        print(f'FAILED {item["category"]}/{item["name"]}: {body}')
print(f'created {created}/{len(items)}')
