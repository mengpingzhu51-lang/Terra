#!/usr/bin/env python3
"""
Generate a resume PDF from structured data.
Usage: python3 generate_resume_pdf.py <resume_json> <template_id>
"""
import sys
import json
import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, black, white, gray
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY


def generate_simple(data, output_path):
    """简洁模板 - clean and simple layout."""
    c = Canvas(output_path, pagesize=A4)
    width, height = A4

    # Name
    y = height - 3 * cm
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2, y, data.get("basicInfo", {}).get("name", ""))

    # Intention
    y -= 0.8 * cm
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, y, data.get("basicInfo", {}).get("intention", ""))

    # Contact Info
    y -= 0.6 * cm
    c.setFont("Helvetica", 10)
    info = []
    bi = data.get("basicInfo", {})
    if bi.get("phone"): info.append(bi["phone"])
    if bi.get("email"): info.append(bi["email"])
    if bi.get("city"): info.append(bi["city"])
    c.drawCentredString(width / 2, y, " | ".join(info))

    # Divider
    y -= 0.5 * cm
    c.line(3 * cm, y, width - 3 * cm, y)

    # Education
    y -= 0.8 * cm
    c.setFont("Helvetica-Bold", 14)
    c.drawString(3 * cm, y, "Education")
    y -= 0.6 * cm

    for edu in data.get("education", []):
        c.setFont("Helvetica-Bold", 11)
        c.drawString(3 * cm, y, f"{edu.get('school', '')} - {edu.get('degree', '')}")
        y -= 0.4 * cm
        c.setFont("Helvetica", 10)
        c.drawString(3 * cm, y, f"{edu.get('major', '')} | {edu.get('startDate', '')} - {edu.get('endDate', '')}")
        y -= 0.5 * cm
        if edu.get("description"):
            c.setFont("Helvetica", 9)
            for line in edu["description"].split("\n"):
                if line.strip():
                    c.drawString(3 * cm, y, line.strip()[:80])
                    y -= 0.35 * cm
        y -= 0.3 * cm

    # Work Experience
    if y < 4 * cm:
        c.showPage()
        y = height - 3 * cm

    c.setFont("Helvetica-Bold", 14)
    y -= 0.3 * cm
    c.drawString(3 * cm, y, "Work Experience")
    y -= 0.6 * cm

    for work in data.get("workExperience", []):
        c.setFont("Helvetica-Bold", 11)
        c.drawString(3 * cm, y, f"{work.get('company', '')} - {work.get('position', '')}")
        y -= 0.4 * cm
        c.setFont("Helvetica", 10)
        c.drawString(3 * cm, y, f"{work.get('startDate', '')} - {work.get('endDate', '')}")
        y -= 0.5 * cm
        if work.get("content"):
            c.setFont("Helvetica", 9)
            for line in work["content"].split("\n"):
                if line.strip():
                    text = line.strip()[:90]
                    c.drawString(3 * cm, y, text)
                    y -= 0.35 * cm
        y -= 0.3 * cm

    # Projects
    if data.get("projects"):
        if y < 5 * cm:
            c.showPage()
            y = height - 3 * cm
        c.setFont("Helvetica-Bold", 14)
        y -= 0.3 * cm
        c.drawString(3 * cm, y, "Projects")
        y -= 0.6 * cm

        for proj in data.get("projects", []):
            c.setFont("Helvetica-Bold", 11)
            c.drawString(3 * cm, y, f"{proj.get('name', '')} - {proj.get('role', '')}")
            y -= 0.4 * cm
            c.setFont("Helvetica", 10)
            c.drawString(3 * cm, y, f"{proj.get('startDate', '')} - {proj.get('endDate', '')}")
            y -= 0.5 * cm
            if proj.get("background"):
                c.setFont("Helvetica", 9)
                c.drawString(3 * cm, y, f"Background: {proj['background'][:80]}")
                y -= 0.35 * cm
            if proj.get("responsibilities"):
                c.setFont("Helvetica", 9)
                c.drawString(3 * cm, y, f"Responsibilities: {proj['responsibilities'][:80]}")
                y -= 0.35 * cm
            if proj.get("results"):
                c.setFont("Helvetica", 9)
                c.drawString(3 * cm, y, f"Results: {proj['results'][:80]}")
                y -= 0.35 * cm
            y -= 0.3 * cm

    # Skills
    if data.get("skills"):
        if y < 3 * cm:
            c.showPage()
            y = height - 3 * cm
        c.setFont("Helvetica-Bold", 14)
        y -= 0.3 * cm
        c.drawString(3 * cm, y, "Skills")
        y -= 0.5 * cm
        c.setFont("Helvetica", 10)
        c.drawString(3 * cm, y, ", ".join(data["skills"]))

    # Summary (new page)
    if data.get("summary"):
        c.showPage()
        y = height - 3 * cm
        c.setFont("Helvetica-Bold", 14)
        c.drawString(3 * cm, y, "Summary")
        y -= 0.6 * cm
        c.setFont("Helvetica", 10)
        for line in data["summary"].split("\n"):
            if line.strip():
                if y < 2 * cm:
                    c.showPage()
                    y = height - 3 * cm
                c.drawString(3 * cm, y, line.strip()[:95])
                y -= 0.4 * cm

    c.save()


def generate_technical(data, output_path):
    """技术模板 - technical style with sidebar."""
    # For now, use the same as simple
    generate_simple(data, output_path)


def generate_highlight(data, output_path):
    """高亮模板 - highlights key achievements."""
    # For now, use the same as simple
    generate_simple(data, output_path)


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python3 generate_resume_pdf.py <json_data> <template_id>"}))
        sys.exit(1)

    resume_json = sys.argv[1]
    template_id = sys.argv[2]

    try:
        data = json.loads(resume_json)
    except Exception as e:
        print(json.dumps({"error": f"Invalid JSON: {e}"}))
        sys.exit(1)

    # Write PDF to stdout
    import tempfile
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
        tmp_path = f.name

    try:
        if template_id == "simple":
            generate_simple(data, tmp_path)
        elif template_id == "technical":
            generate_technical(data, tmp_path)
        elif template_id == "highlight":
            generate_highlight(data, tmp_path)
        else:
            generate_simple(data, tmp_path)

        # Read and output PDF bytes
        with open(tmp_path, "rb") as f:
            sys.stdout.buffer.write(f.read())
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


if __name__ == "__main__":
    main()
