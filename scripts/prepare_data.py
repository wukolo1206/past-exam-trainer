"""
prepare_data.py
從 knowledge-map 複製 exam_questions.json，並從 units.json 建立 units_map.json。
執行：python scripts/prepare_data.py（從 past-exam-trainer/ 目錄執行）
"""
import json, shutil, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KM_DIR = os.path.join(BASE, '..', 'knowledge-map', 'data')
IMG_SRC = os.path.join(BASE, '..', '學力檢測考古題', 'img_questions')
OUT_DIR = os.path.join(BASE, 'data')
IMG_DST = os.path.join(BASE, 'img')

# 1. 複製 exam_questions.json
src = os.path.join(KM_DIR, 'exam_questions.json')
dst = os.path.join(OUT_DIR, 'questions.json')
shutil.copy2(src, dst)
print(f'Copied questions.json ({os.path.getsize(dst):,} bytes)')

# 2. 建立 units_map.json：grade → [{ id, title, indicators: [code] }]
with open(os.path.join(KM_DIR, 'units.json'), encoding='utf-8') as f:
    units = json.load(f)

units_map = {}
for u in units:
    g = str(u['grade'])
    if g not in units_map:
        units_map[g] = []
    units_map[g].append({
        'id': u['id'],
        'title': u.get('title', u['id']),
        'semester': u.get('semester', 0),
        'unit_number': u.get('unit_number', 0),
        'indicators': [i['code'] for i in u.get('indicators', [])]
    })

# 每年級依學期、單元號排序
for g in units_map:
    units_map[g].sort(key=lambda x: (x['semester'], x['unit_number']))

with open(os.path.join(OUT_DIR, 'units_map.json'), 'w', encoding='utf-8') as f:
    json.dump(units_map, f, ensure_ascii=False, indent=2)
print(f'Built units_map.json: {sum(len(v) for v in units_map.values())} units')

# 3. 複製圖片
copied = 0
for fname in os.listdir(IMG_SRC):
    if fname.endswith('.png'):
        shutil.copy2(os.path.join(IMG_SRC, fname), os.path.join(IMG_DST, fname))
        copied += 1
print(f'Copied {copied} PNG images')
