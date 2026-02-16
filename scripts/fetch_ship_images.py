#!/usr/bin/env python3
import json, urllib.request, urllib.parse, re, sys, time

with open('/Users/kim/.openclaw/workspace/cruiselink-blog/_data/cruises.json') as f:
    data = json.load(f)

ships = sorted(set(c.get('ship','') for c in data if c.get('ship','')))

korean_map = {
    'MSC 벨리시마': 'MSC Bellissima',
    '레디언스 오브 더 씨즈': 'Radiance of the Seas',
    '브릴리언스 오브 더 씨즈': 'Brilliance of the Seas',
    '스펙트럼 오브 더 씨즈': 'Spectrum of the Seas',
    '아이콘 오브 더 씨즈': 'Icon of the Seas',
    '앤썸 오브 더 씨즈': 'Anthem of the Seas',
    '오디세이 오브 더 씨즈': 'Odyssey of the Seas',
    '오베이션 오브 더 씨즈': 'Ovation of the Seas',
    '원더 오브 더 씨즈': 'Wonder of the Seas',
}

wiki_title_map = {
    'Mardi Gras': 'Mardi Gras (2020 ship)',
    'MSC Scarlet Lady': 'Scarlet Lady (cruise ship)',
    'Disney Adventure': 'Disney Adventure (ship)',
    'Disney Destiny': 'Disney Destiny (ship)',
    'Disney Treasure': 'Disney Treasure (ship)',
    'Star of the Seas': 'Star of the Seas (ship)',
    'Norwegian Gateway': 'Norwegian Gateway (ship)',
    'Norwegian Luna': 'Norwegian Luna (ship)',
    'Norwegian Aura': 'Norwegian Aura (ship)',
    'Celebrity Roamer': 'Celebrity Roamer (ship)',
    'Celebrity Seeker': 'Celebrity Seeker (ship)',
    'Celebrity Wanderer': 'Celebrity Wanderer (ship)',
    'Celebrity Boundless': 'Celebrity Boundless',
    'Celebrity Compass': 'Celebrity Compass',
    'Celebrity Xcel': 'Celebrity Xcel',
    'MSC World Atlantic': 'MSC World Atlantic',
    'Carnival Festivale': 'Carnival Festivale (2027)',
    'Legend of the Seas': 'Legend of the Seas',
    'MSC World America': 'MSC World America',
    'MSC World Asia': 'MSC World Asia',
    'Carnival Radiance': 'Carnival Radiance',
    'Sun Princess': 'Sun Princess (2024 ship)',
    'Star Princess': 'Star Princess (2025 ship)',
}

ship_images = {}
failed = []

for i, ship in enumerate(ships):
    en_name = korean_map.get(ship, ship)
    wiki_title = wiki_title_map.get(en_name, en_name)
    title = urllib.parse.quote(wiki_title.replace(' ', '_'))
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'CruiseLink/1.0'})
        resp = urllib.request.urlopen(req, timeout=10)
        wdata = json.loads(resp.read())
        if 'thumbnail' in wdata:
            src = wdata['thumbnail']['source']
            src = re.sub(r'/\d+px-', '/640px-', src)
            ship_images[ship] = src
            print(f"[{i+1}/{len(ships)}] OK: {ship}", flush=True)
        else:
            failed.append(ship)
            print(f"[{i+1}/{len(ships)}] NO IMG: {ship}", flush=True)
    except Exception as e:
        failed.append(ship)
        print(f"[{i+1}/{len(ships)}] FAIL: {ship} - {e}", flush=True)
    
    time.sleep(0.15)

print(f"\nFound: {len(ship_images)}, Failed: {len(failed)}")
for f in failed:
    print(f"  MISSING: {f}")

with open('/tmp/ship_images.json', 'w') as fout:
    json.dump(ship_images, fout, ensure_ascii=False, indent=2)
print("Saved to /tmp/ship_images.json")
