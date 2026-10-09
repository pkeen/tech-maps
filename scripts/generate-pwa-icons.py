"""Generate dependency-free PNG icons from the simple Tech Maps mark."""

from pathlib import Path
import math
import struct
import zlib

ROOT = Path(__file__).resolve().parent.parent / "public" / "icons"
BACKGROUND = (21, 91, 89)
MAP = (216, 242, 227)
PIN = (245, 180, 122)


def distance_to_segment(x, y, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(x - (ax + t * dx), y - (ay + t * dy))


def in_triangle(x, y, a, b, c):
    def side(p, q):
        return (x - q[0]) * (p[1] - q[1]) - (p[0] - q[0]) * (y - q[1])

    values = (side(a, b), side(b, c), side(c, a))
    return not (any(value < 0 for value in values) and any(value > 0 for value in values))


def colour_at(x, y):
    map_lines = [
        ((120, 177), (203, 145)), ((203, 145), (308, 179)),
        ((308, 179), (392, 147)), ((120, 177), (120, 365)),
        ((120, 365), (203, 333)), ((203, 333), (308, 367)),
        ((308, 367), (392, 335)), ((392, 335), (392, 147)),
        ((203, 145), (203, 333)), ((308, 179), (308, 367)),
    ]
    if any(distance_to_segment(x, y, *a, *b) <= 11 for a, b in map_lines):
        colour = MAP
    else:
        colour = BACKGROUND
    pin_shape = math.hypot(x - 256, y - 226) <= 76 or in_triangle(
        x, y, (187, 253), (325, 253), (256, 374)
    )
    if pin_shape:
        colour = PIN
    if math.hypot(x - 256, y - 226) <= 26:
        colour = BACKGROUND
    return colour


def png(size):
    rows = []
    scale = 512 / size
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            samples = [
                colour_at((x + ox) * scale, (y + oy) * scale)
                for oy in (0.25, 0.75) for ox in (0.25, 0.75)
            ]
            row.extend(sum(sample[channel] for sample in samples) // 4 for channel in range(3))
        rows.append(bytes(row))
    raw = zlib.compress(b"".join(rows), 9)

    def chunk(name, payload):
        return struct.pack(">I", len(payload)) + name + payload + struct.pack(
            ">I", zlib.crc32(name + payload) & 0xFFFFFFFF
        )

    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", raw) + chunk(b"IEND", b""))


ROOT.mkdir(parents=True, exist_ok=True)
(ROOT / "icon-192.png").write_bytes(png(192))
large = png(512)
(ROOT / "icon-512.png").write_bytes(large)
(ROOT / "icon-maskable-512.png").write_bytes(large)
