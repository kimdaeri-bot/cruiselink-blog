#!/usr/bin/env python3
import urllib.request, os, time

BASE = "/Users/kim/.openclaw/workspace/cruiselink-blog/assets/images"

def dl(url, path, resize_param="?$880x550$"):
    full_path = os.path.join(BASE, path)
    if os.path.exists(full_path) and os.path.getsize(full_path) > 5000:
        print(f"  SKIP: {path}")
        return True
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    full_url = url + resize_param if '?' not in url else url
    try:
        req = urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"})
        data = urllib.request.urlopen(req, timeout=15).read()
        if len(data) < 5000:
            print(f"  FAIL (small {len(data)}b): {path}")
            return False
        with open(full_path, 'wb') as f:
            f.write(data)
        print(f"  OK ({len(data)//1024}KB): {path}")
        time.sleep(0.3)
        return True
    except Exception as e:
        print(f"  FAIL: {path} -> {e}")
        return False

CDN = "https://assets.dm.rccl.com/is/image/RoyalCaribbeanCruises"

images = {
    # === SHIPS DIRECTORY ===
    "ships/": {
        # Odyssey of the Seas
        "odyssey-exterior.jpg": f"{CDN}/royal/ships/odyssey/aerial-view-odyssey-of-the-seas-full-ship.jpg",
        "odyssey-sunset.jpg": f"{CDN}/royal/ships/odyssey/odyssey-of-the-seas-sailing-cruising-sunset-north-star.jpg",
        "odyssey-santorini.jpg": f"{CDN}/royal/ships/odyssey/odyssey-of-the-seas-sailing-in-santorini-night-time.jpg",
        "odyssey-pool.jpg": f"{CDN}/royal/data/activity/pool/odyssey-of-the-seas-pool-deck-aerial-close-up-splashaway.jpg",
        "odyssey-sunrise.jpg": f"{CDN}/royal/ships/odyssey/odyssey-of-the-seas-ocean-cruising-sailing-sunrise-aerial-cruise.jpg",
        
        # Wonder of the Seas
        "wonder-exterior.jpg": f"{CDN}/royal/ships/wonder/wonder-of-thes-seas-aft-aerial.jpg",
        "wonder-aquatheater.jpg": f"{CDN}/royal/ships/utopia/microsite/wonder-of-the-seas-royal-caribbean-aquatheater-performance-night-life-activities-crop.jpg",
        "wonder-waterslide.jpg": f"{CDN}/royal/ships/utopia/microsite/wonder-of-the-seas-royal-caribbean-perfect-storm-funnel-woman-sliding.jpg",
        "wonder-flowrider.jpg": f"{CDN}/royal/data/activity/flowrider/wonder-of-the-seas-flowrider-private-woman-surfing-lessons.jpg",
        "wonder-pool.jpg": f"{CDN}/royal/data/activity/pool/wonder-of-the-seas-royal-caribbean-pool-deck-girl-jumping.jpg",
        "wonder-zipline.jpg": f"{CDN}/royal/ships/utopia/microsite/wonder-of-the-seas-zipline-girl-boardwalk-view-activities.jpg",
        "wonder-rockclimbing.jpg": f"{CDN}/royal/data/activity/rock-climbing-wall/wonder-of-the-seas-royal-caribbean-rock-climbing-wall-father-son-competing.jpg",
        
        # Ovation of the Seas
        "ovation-exterior.jpg": f"{CDN}/royal/ships/royal-amplified/ovation-of-the-seas-northstar-aerial.jpg",
        "ovation-flowrider.jpg": f"{CDN}/royal/ships/royal-amplified/ovation-of-the-seas-man-on-flowrider-2880-1920.jpg",
        
        # Anthem of the Seas
        "anthem-exterior.jpg": f"{CDN}/royal/data/ship/anthem-of-the-seas/image/anthem-of-the-seas-aerial-stern-sailing.jpg",
        "anthem-flowrider.jpg": f"{CDN}/royal/data/activity/flowrider/anthem-of-the-seas-flowrider-ifly-ripcord-night.jpg",
        "anthem-wonderland.jpg": f"{CDN}/royal/data/dining/wonderland-imaginative-cuisine/anthem-of-the-seas-wonderland-chef-preparing-food.jpg",
        "anthem-show.jpg": f"{CDN}/royal/data/activity/entertainment-shows/two70/spectras-cabaret/image/anthem-spectras-cabaret-show-singers-stage-night-entertainment.JPG",
        "anthem-norway.jpg": f"{CDN}/royal/ships/anthem/anthem-of-the-seas-norway-mountain.jpg",
        
        # Spectrum of the Seas  
        "spectrum-exterior.jpg": f"{CDN}/royal/data/ship/spectrum/spectrum-of-the-seas-aerial-full-ship.jpg",
        "spectrum-skypad.jpg": f"{CDN}/royal/data/ship/spectrum/assets/spectrum-of-the-seas-aerial-skypad-hero.jpg",
        "spectrum-singapore.jpg": f"{CDN}/royal/2024-editorial-assets/singapore-spectrum-of-the-seas-skypad-city-skyline.jpg",
        "spectrum-sichuan.jpg": f"{CDN}/royal/data/dining/sichuan-red/spectrum-of-the-seas-sichuan-red-interior.jpg",
    },
    
    # === SHARED FACILITIES ===
    "facilities/": {
        "north-star.jpg": f"{CDN}/royal/ships/royal-amplified/family-running-exiting-north-star.jpg",
        "bumper-cars.jpg": f"{CDN}/royal/ships/royal-amplified/bumper-cars-overhead-view-seaplex.jpg",
        "flowrider.jpg": f"{CDN}/royal/2024-editorial-assets/icon-of-the-seas-flowrider-thrill-island-close-up-1920-480.jpg",
        "solarium.jpg": f"{CDN}/royal/2024-editorial-assets/solarium-bar-tropical-cocktails-pool-1920-1480.jpg",
        "main-dining.jpg": f"{CDN}/royal/data/dining/main-dining-room/main-dining-room-cheesecake-topped-with-fruit-dessert.jpg",
        "chops-grille.jpg": f"{CDN}/royal/data/dining/chops-grille/symphony-of-the-seas-chops-grille-steak-shrimp-mother-daughter-lunch-date.jpg",
        "giovannis.jpg": f"{CDN}/royal/data/dining/giovannis-table/giovannis-table-italian-pasta-dish.jpg",
        "izumi.jpg": f"{CDN}/royal/data/dining/izumi/izumi-hibachi-sushi-family.jpg",
        "r-bar.jpg": f"{CDN}/royal/data/dining/r-bar/r-bar-couple-server-drinks-dining.JPG",
        "balcony-stateroom.jpg": f"{CDN}/royal/2024-editorial-assets/balcony-stateroom-room-service-guests-seniors.jpg",
        "suite-living.jpg": f"{CDN}/royal/accommodations/wonder/ultimate-family-suite-living-room-slide.jpg",
    },
}

success = 0
fail = 0
for subdir, files in images.items():
    for filename, url in files.items():
        path = subdir + filename
        print(f"Downloading {path}...")
        if dl(url, path):
            success += 1
        else:
            fail += 1

print(f"\n=== Done: {success} ok, {fail} fail ===")
