#!/usr/bin/env python3
"""Contraste WCAG de duas cores sólidas sRGB. Não avalia uma arte completa."""
import argparse
import json
import re


def rgb(value: str) -> tuple[float, float, float]:
    if not re.fullmatch(r"#[0-9a-fA-F]{6}", value):
        raise ValueError("Use uma cor hexadecimal de seis dígitos, por exemplo #256675.")
    return tuple(int(value[i:i+2], 16) / 255 for i in (1, 3, 5))


def luminance(color: str) -> float:
    values = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb(color)]
    return sum(c * w for c, w in zip(values, (0.2126, 0.7152, 0.0722)))


def contrast_ratio(foreground: str, background: str) -> float:
    a, b = sorted((luminance(foreground), luminance(background)))
    return (b + 0.05) / (a + 0.05)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("foreground")
    parser.add_argument("background")
    parser.add_argument("--large", action="store_true", help="Avaliar pelo patamar 3:1 de texto grande.")
    args = parser.parse_args()
    try:
        value = contrast_ratio(args.foreground, args.background)
    except ValueError as exc:
        parser.error(str(exc))
    threshold = 3.0 if args.large else 4.5
    print(json.dumps({"ratio": round(value, 3), "threshold": threshold, "passes": value >= threshold,
                      "note": "Conferir tamanho real, textura e legibilidade visual."}, ensure_ascii=False))
    return 0 if value >= threshold else 1


if __name__ == "__main__":
    raise SystemExit(main())
