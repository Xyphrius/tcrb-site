#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

OUT = "/Users/supertramp/tcrb-site/instagram"
W, H = 1080, 1080

# TCRB Brand Colors
BG = (10, 10, 10)
BG_CARD = (17, 17, 17)
BG_ELEVATED = (24, 24, 24)
TEXT_PRIMARY = (245, 245, 240)
TEXT_SECONDARY = (138, 138, 133)
TEXT_MUTED = (85, 85, 80)
ACCENT = (200, 255, 0)
SIGNAL_RED = (255, 59, 48)
BORDER = (34, 34, 32)

# Font setup - use system monospace
def get_font(size, bold=False):
    paths = [
        "/System/Library/Fonts/SFMono-Bold.otf" if bold else "/System/Library/Fonts/SFMono-Regular.otf",
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/Courier.dfont",
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except:
            continue
    return ImageFont.load_default()

font_xl = get_font(120, bold=True)
font_lg = get_font(72, bold=True)
font_md = get_font(36, bold=False)
font_sm = get_font(24, bold=False)
font_xs = get_font(18, bold=False)
font_label = get_font(16, bold=True)

def new_canvas():
    img = Image.new("RGB", (W, H), BG)
    return img, ImageDraw.Draw(img)

def draw_wordmark(draw, y=60):
    draw.text((60, y), "THE CANNABIS REVIEW", fill=TEXT_PRIMARY, font=font_xs)
    tw = draw.textlength("THE CANNABIS REVIEW", font=font_xs)
    draw.text((60 + tw + 6, y), "BOARD", fill=ACCENT, font=font_xs)

def draw_border_line(draw, y, color=BORDER):
    draw.line([(0, y), (W, y)], fill=color, width=1)

def draw_bottom_bar(draw):
    draw_border_line(draw, H - 80)
    draw.text((60, H - 58), "TCRB", fill=ACCENT, font=font_xs)
    draw.text((W - 260, H - 58), "SYSTEM OF RECORD", fill=TEXT_MUTED, font=font_xs)

def wrap_text(text, font, draw, max_width):
    words = text.split()
    lines, current = [], ""
    for word in words:
        test = f"{current} {word}".strip()
        if draw.textlength(test, font=font) <= max_width:
            current = test
        else:
            if current: lines.append(current)
            current = word
    if current: lines.append(current)
    return lines

# POST 01: DATA DROP - 2,204
def post_01():
    img, draw = new_canvas()
    draw_wordmark(draw)
    draw_border_line(draw, 100)
    draw.text((60, 140), "DATA DROP", fill=ACCENT, font=font_label)
    draw.text((60, 280), "2,204", fill=TEXT_PRIMARY, font=font_xl)
    draw_border_line(draw, 440)
    draw.text((60, 470), "ADULT-USE LICENSES ISSUED", fill=TEXT_SECONDARY, font=font_md)
    draw.text((60, 530), "NEW YORK STATE", fill=TEXT_MUTED, font=font_sm)
    draw.text((60, 600), "246 cultivators. 234 distributors.", fill=TEXT_MUTED, font=font_xs)
    draw.text((60, 630), "324 microbusinesses. 540 processors.", fill=TEXT_MUTED, font=font_xs)
    draw.text((60, 660), "519 retail. 341 CAURD.", fill=TEXT_MUTED, font=font_xs)
    draw_bottom_bar(draw)
    img.save(os.path.join(OUT, "01_data_drop_2204.png"))
    print("01 done")

# POST 02: DATA DROP - 623
def post_02():
    img, draw = new_canvas()
    draw_wordmark(draw)
    draw_border_line(draw, 100)
    draw.text((60, 140), "DATA DROP", fill=ACCENT, font=font_label)
    draw.text((60, 260), "623", fill=TEXT_PRIMARY, font=font_xl)
    draw_border_line(draw, 420)
    draw.text((60, 450), "DISPENSARIES OPEN", fill=TEXT_SECONDARY, font=font_md)
    draw.text((60, 510), "OF 2,204 LICENSED", fill=TEXT_MUTED, font=font_sm)
    # Conversion bar
    bar_y = 600
    draw.rectangle([(60, bar_y), (W-60, bar_y+8)], fill=BG_ELEVATED)
    bar_w = int((W-120) * 0.283)
    draw.rectangle([(60, bar_y), (60+bar_w, bar_y+8)], fill=ACCENT)
    draw.text((60, bar_y+20), "28.3% CONVERSION RATE", fill=TEXT_MUTED, font=font_xs)
    draw_bottom_bar(draw)
    img.save(os.path.join(OUT, "02_data_drop_623.png"))
    print("02 done")

# POST 03: DATA DROP - $3.3B
def post_03():
    img, draw = new_canvas()
    draw_wordmark(draw)
    draw_border_line(draw, 100)
    draw.text((60, 140), "MARKET INTELLIGENCE", fill=ACCENT, font=font_label)
    draw.text((60, 260), "$3.3B", fill=ACCENT, font=font_xl)
    draw_border_line(draw, 420)
    draw.text((60, 450), "CUMULATIVE SALES", fill=TEXT_PRIMARY, font=font_md)
    draw.text((60, 510), "DEC 2022 - MAR 2026", fill=TEXT_MUTED, font=font_sm)
    # Growth timeline
    years = [("2023", "$317M"), ("2024", "$1.0B"), ("2025", "$1.69B")]
    y = 600
    for label, val in years:
        draw.text((60, y), label, fill=TEXT_MUTED, font=font_xs)
        draw.text((200, y), val, fill=TEXT_SECONDARY, font=font_xs)
        y += 36
    draw.text((60, y+10), "2026 PROJECTED: $2.6B", fill=ACCENT, font=font_xs)
    draw_bottom_bar(draw)
    img.save(os.path.join(OUT, "03_data_drop_3_3B.png"))
    print("03 done")

# POST 04: DATA DROP - +54.8%
def post_04():
    img, draw = new_canvas()
    draw_wordmark(draw)
    draw_border_line(draw, 100)
    draw.text((60, 140), "DATA DROP", fill=ACCENT, font=font_label)
    draw.text((60, 240), "+54.8%", fill=ACCENT, font=font_xl)
    draw_border_line(draw, 400)
    draw.text((60, 430), "YEAR-OVER-YEAR GROWTH", fill=TEXT_PRIMARY, font=font_md)
    draw.text((60, 490), "HIGHEST AMONG LARGE US MARKETS", fill=TEXT_MUTED, font=font_sm)
    # Comparison bars
    comparisons = [("NEW YORK", 54.8, ACCENT), ("MICHIGAN", 12.0, TEXT_SECONDARY), ("CALIFORNIA", -6.4, SIGNAL_RED), ("COLORADO", -8.4, SIGNAL_RED)]
    y = 580
    for name, val, color in comparisons:
        draw.text((60, y), name, fill=TEXT_MUTED, font=font_xs)
        bar_x = 300
        if val > 0:
            bw = int(val * 10)
            draw.rectangle([(bar_x, y+2), (bar_x+bw, y+16)], fill=color)
        draw.text((bar_x + max(int(abs(val)*10), 0) + 20, y), f"{val:+.1f}%", fill=color, font=font_xs)
        y += 36
    draw_bottom_bar(draw)
    img.save(os.path.join(OUT, "04_data_drop_growth.png"))
    print("04 done")

# POST 05: SIGNAL REPORT - Price Compression
def post_05():
    img, draw = new_canvas()
    draw_wordmark(draw)
    draw_border_line(draw, 100)
    draw.text((60, 140), "SIGNAL REPORT", fill=ACCENT, font=font_label)
    y = 300
    lines = wrap_text("Revenue is growing. Margins are not.", font_lg, draw, W-120)
    for line in lines:
        draw.text((60, y), line, fill=TEXT_PRIMARY, font=font_lg)
        y += 85
    y += 40
    draw_border_line(draw, y)
    y += 30
    lines2 = wrap_text("Average item price fell 11.6% in one year. From $35.41 to $31.29. The premium window is closing.", font_sm, draw, W-120)
    for line in lines2:
        draw.text((60, y), line, fill=TEXT_SECONDARY, font=font_sm)
        y += 32
    draw_bottom_bar(draw)
    img.save(os.path.join(OUT, "05_signal_price_compression.png"))
    print("05 done")

# POST 06: REGULATORY ALERT - Commerce Clause
def post_06():
    img, draw = new_canvas()
    draw_wordmark(draw)
    draw_border_line(draw, 100)
    # Red accent bar
    draw.rectangle([(0, 100), (W, 106)], fill=SIGNAL_RED)
    draw.text((60, 130), "REGULATORY ALERT", fill=SIGNAL_RED, font=font_label)
    y = 260
    lines = wrap_text("57% of all licenses face structural risk.", font_lg, draw, W-120)
    for line in lines:
        draw.text((60, y), line, fill=TEXT_PRIMARY, font=font_lg)
        y += 85
    y += 30
    draw_border_line(draw, y)
    y += 30
    detail = "Federal court ruled the constitutional challenge to NY equity licensing will proceed. Dormant Commerce Clause. March 25, 2026."
    lines2 = wrap_text(detail, font_sm, draw, W-120)
    for line in lines2:
        draw.text((60, y), line, fill=TEXT_SECONDARY, font=font_sm)
        y += 32
    draw_bottom_bar(draw)
    img.save(os.path.join(OUT, "06_regulatory_commerce_clause.png"))
    print("06 done")

# POST 07: DATA DROP - Medical Decline
def post_07():
    img, draw = new_canvas()
    draw_wordmark(draw)
    draw_border_line(draw, 100)
    draw.text((60, 140), "DATA DROP", fill=SIGNAL_RED, font=font_label)
    draw.text((60, 260), "-30%", fill=SIGNAL_RED, font=font_xl)
    draw_border_line(draw, 420)
    draw.text((60, 450), "MEDICAL CANNABIS REVENUE", fill=TEXT_PRIMARY, font=font_md)
    draw.text((60, 510), "YEAR-OVER-YEAR DECLINE", fill=TEXT_MUTED, font=font_sm)
    y = 600
    draw.text((60, y), "$140M (2024)  -->  $95.5M (2025)", fill=TEXT_SECONDARY, font=font_xs)
    y += 40
    draw.text((60, y), "Adult-use is cannibalizing the", fill=TEXT_MUTED, font=font_xs)
    draw.text((60, y+26), "medical program. Structural inevitability.", fill=TEXT_MUTED, font=font_xs)
    draw_bottom_bar(draw)
    img.save(os.path.join(OUT, "07_data_drop_medical_decline.png"))
    print("07 done")

# POST 08: PRICE SIGNAL - Avg Item Price
def post_08():
    img, draw = new_canvas()
    draw_wordmark(draw)
    draw_border_line(draw, 100)
    draw.text((60, 140), "PRICE SIGNAL", fill=ACCENT, font=font_label)
    draw.text((60, 260), "$31.29", fill=TEXT_PRIMARY, font=font_xl)
    draw_border_line(draw, 420)
    draw.text((60, 450), "AVG ITEM PRICE - FEB 2026", fill=TEXT_SECONDARY, font=font_md)
    # Comparison
    markets = [("NEW YORK", "$31.29", TEXT_PRIMARY), ("CALIFORNIA", "$18.44", TEXT_SECONDARY), ("MICHIGAN", "$8.88", TEXT_MUTED)]
    y = 560
    for name, price, color in markets:
        draw.text((60, y), name, fill=TEXT_MUTED, font=font_xs)
        draw.text((300, y), price, fill=color, font=font_sm)
        y += 44
    draw.text((60, y+16), "NY PREMIUM ERODING: -11.6% YOY", fill=ACCENT, font=font_xs)
    draw_bottom_bar(draw)
    img.save(os.path.join(OUT, "08_price_signal_avg_item.png"))
    print("08 done")

# POST 09: SIGNAL REPORT - Beverage Category
def post_09():
    img, draw = new_canvas()
    draw_wordmark(draw)
    draw_border_line(draw, 100)
    draw.text((60, 140), "SIGNAL REPORT", fill=ACCENT, font=font_label)
    y = 280
    lines = wrap_text("The beverage signal is real.", font_lg, draw, W-120)
    for line in lines:
        draw.text((60, y), line, fill=TEXT_PRIMARY, font=font_lg)
        y += 85
    y += 20
    draw_border_line(draw, y)
    y += 30
    stats = [
        ("+88.2%", "BEVERAGE SALES YOY"),
        ("+134.1%", "UNIT SALES GROWTH"),
        ("+223.8%", "TEA & COFFEE CATEGORY"),
    ]
    for val, label in stats:
        draw.text((60, y), val, fill=ACCENT, font=font_md)
        tw = draw.textlength(val, font=font_md)
        draw.text((60 + tw + 20, y + 8), label, fill=TEXT_MUTED, font=font_xs)
        y += 52
    y += 20
    draw.text((60, y), "Format-driven consumption is", fill=TEXT_SECONDARY, font=font_xs)
    draw.text((60, y+26), "expanding the consumer base.", fill=TEXT_SECONDARY, font=font_xs)
    draw_bottom_bar(draw)
    img.save(os.path.join(OUT, "09_signal_beverage.png"))
    print("09 done")

# POST 10: SIGNAL REPORT - Supply Inversion
def post_10():
    img, draw = new_canvas()
    draw_wordmark(draw)
    draw_border_line(draw, 100)
    draw.text((60, 140), "SIGNAL REPORT", fill=ACCENT, font=font_label)
    y = 280
    lines = wrap_text("The market has inverted.", font_lg, draw, W-120)
    for line in lines:
        draw.text((60, y), line, fill=TEXT_PRIMARY, font=font_lg)
        y += 85
    y += 20
    draw_border_line(draw, y)
    y += 30
    detail = "2023: Too much product, too few stores. 2026: Demand outpacing supply. 560 cultivators licensed. 9.1M sq ft of canopy not fully activated. CCB now allowing tier upgrades."
    lines2 = wrap_text(detail, font_sm, draw, W-120)
    for line in lines2:
        draw.text((60, y), line, fill=TEXT_SECONDARY, font=font_sm)
        y += 34
    draw_bottom_bar(draw)
    img.save(os.path.join(OUT, "10_signal_supply_inversion.png"))
    print("10 done")

# GENERATE ALL
if __name__ == "__main__":
    print(f"Generating 10 Instagram assets to {OUT}")
    post_01()
    post_02()
    post_03()
    post_04()
    post_05()
    post_06()
    post_07()
    post_08()
    post_09()
    post_10()
    print(f"Done. 10 files in {OUT}")
