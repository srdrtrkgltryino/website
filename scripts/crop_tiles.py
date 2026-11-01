"""Cut the feature-tile images on the home page from the product screenshots.

Each tile shows one region of a screen at a readable size. Boxes are in pixels of the source images in
src/assets/product (2600 px wide, already redacted). Output: src/assets/tiles/<name>.jpg
Run with any Python that has Pillow, e.g. ~/projects/ino-loyalty-video/.venv/bin/python -I scripts/crop_tiles.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src' / 'assets' / 'product'
DST = ROOT / 'src' / 'assets' / 'tiles'

TILES = {  # name: (source, (left, top, right, bottom)); 520 px tall = 260 CSS px at 2x, so text stays readable
    'program': ('program-designer.jpg', (26, 176, 1560, 696)),  # step tabs and the program form
    'tiers': ('tier-designer.jpg', (46, 572, 766, 1092)),  # the tier ladder with perks
    'campaign': ('campaign-test.jpg', (1386, 195, 2514, 715)),  # test result: qualifies, totals, points earned
    'member': ('customer-360.jpg', (26, 32, 1154, 552)),  # member header, signals and tabs
    'wallet': ('wallet-settings.jpg', (1352, 299, 2480, 819)),  # live Apple Wallet card preview
    'privacy': ('privacy-done.jpg', (6, 559, 1134, 1079)),  # what the erasure service did
}

DST.mkdir(parents=True, exist_ok=True)
for name, (src, box) in TILES.items():
    img = Image.open(SRC / src).convert('RGB').crop(box)
    img.save(DST / f'{name}.jpg', quality=90, optimize=True)
    print(f'{name}: {img.width}x{img.height}')
