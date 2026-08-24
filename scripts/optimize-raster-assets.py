from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = (
    (ROOT / "apps/web/src/assets/images/cta.jpg", ROOT / "apps/web/src/assets/images/cta.webp"),
    (ROOT / "apps/web/public/images/auth-hero.png", ROOT / "apps/web/public/images/auth-hero.webp"),
)


def main() -> None:
    for source, target in ASSETS:
        with Image.open(source) as image:
            image.convert("RGB").save(target, "WEBP", quality=82, method=6)
        print(f"{source.name}: {source.stat().st_size} -> {target.name}: {target.stat().st_size}")
    print("Raster assets optimized.")


if __name__ == "__main__":
    main()
