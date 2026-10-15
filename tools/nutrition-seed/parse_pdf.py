import re, zlib, sys, json


def streams(data):
    for m in re.finditer(rb'stream\r?\n(.*?)endstream', data, re.S):
        try:
            yield zlib.decompress(m.group(1))
        except Exception:
            continue

TOKEN = re.compile(rb"""
    \((?:\\.|[^\\()])*\)      # literal string
  | \[(?:[^\]\\]|\\.)*\]      # array
  | <[0-9A-Fa-f\s]*>          # hex string
  | [-+]?\d*\.?\d+            # number
  | /[^\s/\[\]<>()]+          # name
  | [A-Za-z'"*]+              # operator
""", re.X | re.S)

def unescape(b):
    out = bytearray(); i = 0
    while i < len(b):
        c = b[i]
        if c == 0x5C and i + 1 < len(b):
            n = b[i+1]
            mapping = {0x6E:10, 0x72:13, 0x74:9, 0x62:8, 0x66:12}
            if n in mapping: out.append(mapping[n]); i += 2; continue
            if 0x30 <= n <= 0x37:
                oct_digits = b[i+1:i+4]
                m = re.match(rb'[0-7]{1,3}', oct_digits)
                out.append(int(m.group(0), 8) & 0xFF); i += 1 + len(m.group(0)); continue
            out.append(n); i += 2; continue
        out.append(c); i += 1
    return bytes(out)

def text_items(stream):
    """Yield (x, y, text) for every text-showing operation."""
    toks = [m.group(0) for m in TOKEN.finditer(stream)]
    items = []
    tm = [1,0,0,1,0,0]; tlm = tm[:]; leading = 0.0
    stack = []
    i = 0
    while i < len(toks):
        t = toks[i]
        op = t.decode('latin-1', 'replace')
        if op == 'BT':
            tm = [1,0,0,1,0,0]; tlm = tm[:]
        elif op == 'Tm' and i >= 6:
            try: tm = [float(toks[i-6+k]) for k in range(6)]; tlm = tm[:]
            except ValueError: pass
        elif op == 'Td' and i >= 2:
            try:
                dx, dy = float(toks[i-2]), float(toks[i-1])
                tlm = [tlm[0], tlm[1], tlm[2], tlm[3], tlm[4]+dx, tlm[5]+dy]; tm = tlm[:]
            except ValueError: pass
        elif op == 'TD' and i >= 2:
            try:
                dx, dy = float(toks[i-2]), float(toks[i-1])
                leading = -dy
                tlm = [tlm[0], tlm[1], tlm[2], tlm[3], tlm[4]+dx, tlm[5]+dy]; tm = tlm[:]
            except ValueError: pass
        elif op == 'TL' and i >= 1:
            try: leading = float(toks[i-1])
            except ValueError: pass
        elif op == 'T*':
            tlm = [tlm[0], tlm[1], tlm[2], tlm[3], tlm[4], tlm[5]-leading]; tm = tlm[:]
        elif op == 'Tj' and i >= 1 and toks[i-1].startswith(b'('):
            items.append((tm[4], tm[5], unescape(toks[i-1][1:-1]).decode('latin-1')))
        elif op == 'TJ' and i >= 1 and toks[i-1].startswith(b'['):
            parts = re.findall(rb'\((?:\\.|[^\\()])*\)', toks[i-1])
            s = ''.join(unescape(p[1:-1]).decode('latin-1') for p in parts)
            if s.strip(): items.append((tm[4], tm[5], s))
        i += 1
    return items

def rows(items, ytol=2.0, gap=3.0):
    """Group positioned fragments into visual rows, then into cells."""
    out = []
    for y in sorted({round(it[1]/ytol)*ytol for it in items}, reverse=True):
        line = sorted([it for it in items if abs(it[1]-y) <= ytol], key=lambda it: it[0])
        if not line: continue
        cells = []; cur = line[0][2]; curx = line[0][0]; lastx = line[0][0] + 4*len(line[0][2])
        for x, _, txt in line[1:]:
            if x - lastx > gap:
                cells.append((curx, cur)); cur = txt; curx = x
            else:
                cur += txt
            lastx = x + 4*len(txt)
        cells.append((curx, cur))
        out.append((y, cells))
    return out

if __name__ == '__main__':
    data = open(sys.argv[1] if len(sys.argv) > 1 else 'nutrition.pdf', 'rb').read()
    all_rows = []
    for pi, st in enumerate(streams(data)):
        its = text_items(st)
        if not its: continue
        all_rows.append((pi, rows(its)))

    for pi, rws in all_rows:
        print(f"\n===== STREAM {pi}  ({len(rws)} rows) =====")
        for y, cells in rws:
            joined = ' | '.join(re.sub(r'\s+', ' ', c[1]).strip() for c in cells)
            if joined.strip(): print(f"{y:8.1f}  {joined}")
