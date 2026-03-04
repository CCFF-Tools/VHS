#!/usr/bin/env python3
"""
Generate a lore-focused children's bedtime story PDF for the VHS mission canon.
"""

from pathlib import Path
from typing import Dict, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


PAGE_DATA: List[Dict[str, object]] = [
    {
        "title": "Starlight Over NoCap",
        "text": [
            "On the homeworld NoCap, little Luma watched the stars blink like tiny lanterns.",
            "Grandma Nova said each light held a story someone once loved.",
            "Luma hugged her blanket and whispered, \"I want to help keep them shining.\"",
        ],
        "prompt": "A cozy night balcony on NoCap, a child in pajamas looking at warm glowing stars, gentle breeze, soft moonlight.",
    },
    {
        "title": "A Call from Meridia",
        "text": [
            "A golden paper bird flew in with a message from Meridia.",
            "The Core Cascade was shaking the planet, and old magnetic tapes were fading.",
            "If they worked together before the Great Signal Fade, memories could still be saved.",
        ],
        "prompt": "A glowing paper bird delivering a letter to a smiling child, stars and a small planet in the background.",
    },
    {
        "title": "Landing at Fluxfall Basin",
        "text": [
            "Luma and her crew sailed to Meridia and landed at Fluxfall Basin.",
            "Silver water rolled down bright cliffs and hummed like a lullaby.",
            "The team stepped out softly, as if the ground was still sleepy.",
        ],
        "prompt": "A friendly small spaceship landing in a shining basin with waterfalls and calm colors, crew stepping out gently.",
    },
    {
        "title": "The Quiet Boxes",
        "text": [
            "At the outpost called The Stacks, rows of tape boxes waited in the dim light.",
            "Each box held a town meeting, a song, or a brave old voice.",
            "Luma placed a hand on one box and promised, \"We hear you.\"",
        ],
        "prompt": "Warm archive shelves full of labeled tape boxes, a child touching one box kindly, lantern glow everywhere.",
    },
    {
        "title": "Building the Firefly Ship",
        "text": [
            "Every time the crew captured a tape, a tiny firefly bolt clicked into their ship.",
            "The ship grew brighter with each rescued memory.",
            "Luma cheered, \"One story saved means one more light for everyone.\"",
        ],
        "prompt": "A whimsical ship being assembled from glowing firefly lights while a crew celebrates nearby.",
    },
    {
        "title": "Drawing the Gentle Route",
        "text": [
            "After capture, they trimmed crackles and combined matching clips with patient hands.",
            "Those clean pieces became a star map for the mission route.",
            "The map showed exactly where kindness and focus should go next.",
        ],
        "prompt": "Crew members connecting glowing puzzle-like film strips into a star map on a table.",
    },
    {
        "title": "The Red Ribbon Rule",
        "text": [
            "Some tapes were blocked by dust, mold, or broken reels.",
            "A soft red ribbon marked them as Quarantine so no one rushed ahead.",
            "Luma said, \"Blocked work rests first, then moves when it is safe.\"",
        ],
        "prompt": "A calm workbench with a few old tapes wrapped in red ribbons, crew wearing simple safety gloves and smiling.",
    },
    {
        "title": "Lanterns in The Stacks",
        "text": [
            "Night after night, The Stacks glowed brighter with saved recordings.",
            "Shelves that once looked sleepy now looked like a warm village of lanterns.",
            "Even the wind sounded happier as it moved through the aisles.",
        ],
        "prompt": "Archive shelves turning into a lantern-lit village look, warm amber lights and peaceful faces.",
    },
    {
        "title": "Clock of the Signal Fade",
        "text": [
            "The countdown clock to the Great Signal Fade ticked lower and lower.",
            "Luma took a deep breath and reminded everyone to move with care, not fear.",
            "Steady work, shared snacks, and kind words kept the crew strong.",
        ],
        "prompt": "A large friendly countdown clock in a mission room, crew calmly working together under warm lights.",
    },
    {
        "title": "The Memory Launch",
        "text": [
            "When a recording was fully archived, it became a glowing memory seed.",
            "The crew launched seed-lights into the sky, from launch to cruise to landing to outpost growth.",
            "Meridia's night filled with gentle trails of gold and blue.",
        ],
        "prompt": "Golden and blue memory seeds launching into a starry sky over Meridia, joyful but calm celebration.",
    },
    {
        "title": "A Safe Dawn on Meridia",
        "text": [
            "By morning, the magnetic storms were quieter and many voices were safe.",
            "Children at Fluxfall Basin listened to old stories and laughed together.",
            "Luma smiled, knowing the past could now hold hands with the future.",
        ],
        "prompt": "Sunrise at Fluxfall Basin with families listening to stories, bright water and soft happy expressions.",
    },
    {
        "title": "Goodnight, Little Archivist",
        "text": [
            "Back on NoCap, Luma tucked in and watched one last star twinkle.",
            "She knew big missions are won by small careful steps and caring hearts.",
            "Moral: protect memories with patience, teamwork, and love, and their light will guide tomorrow.",
        ],
        "prompt": "A child in bed on NoCap, window open to twinkling stars, a peaceful smile, very cozy bedtime mood.",
    },
]


def wrap_text(text: str, font_name: str, font_size: int, max_width: float) -> List[str]:
    words = text.split()
    if not words:
        return [""]

    lines: List[str] = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def draw_page(c: canvas.Canvas, page_index: int, page: Dict[str, object]) -> None:
    width, height = LETTER
    margin_x = 64
    top_y = height - 72
    content_width = width - (margin_x * 2)

    # Warm background.
    c.setFillColor(colors.HexColor("#fbf6e9"))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Header strip.
    c.setFillColor(colors.HexColor("#e7dbc1"))
    c.rect(0, height - 116, width, 116, fill=1, stroke=0)

    c.setFillColor(colors.HexColor("#2f2a3b"))
    c.setFont("Helvetica-Bold", 20)
    c.drawString(margin_x, top_y, f"Page {page_index + 1}: {page['title']}")

    y = top_y - 46
    c.setFillColor(colors.HexColor("#1f2430"))
    c.setFont("Helvetica", 13)

    for sentence in page["text"]:  # type: ignore[index]
        lines = wrap_text(sentence, "Helvetica", 13, content_width)
        for line in lines:
            c.drawString(margin_x, y, line)
            y -= 20
        y -= 8

    y -= 8
    c.setStrokeColor(colors.HexColor("#c5b79c"))
    c.setLineWidth(1)
    c.line(margin_x, y, width - margin_x, y)
    y -= 24

    c.setFillColor(colors.HexColor("#5b4f3d"))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin_x, y, "Illustration prompt")
    y -= 18

    c.setFillColor(colors.HexColor("#3a352a"))
    c.setFont("Helvetica", 11)
    prompt_lines = wrap_text(page["prompt"], "Helvetica", 11, content_width)  # type: ignore[index]
    for line in prompt_lines:
        c.drawString(margin_x, y, line)
        y -= 16

    c.setFillColor(colors.HexColor("#6b645a"))
    c.setFont("Helvetica", 10)
    c.drawRightString(width - margin_x, 30, f"{page_index + 1} / {len(PAGE_DATA)}")


def build_pdf(output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output_path), pagesize=LETTER)
    c.setTitle("Mission Control Bedtime Story")
    c.setAuthor("VHS Archive Mission Lore")
    c.setSubject("Children's bedtime story, ages 4-7")

    for index, page in enumerate(PAGE_DATA):
        draw_page(c, index, page)
        c.showPage()

    c.save()


def main() -> None:
    output_pdf = Path("output/pdf/mission_control_bedtime_story.pdf")
    build_pdf(output_pdf)
    print(output_pdf.resolve())


if __name__ == "__main__":
    main()
