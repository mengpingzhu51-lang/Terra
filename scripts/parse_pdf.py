#!/usr/bin/env python3
"""
PDF text extraction script using pypdf.
Usage: python3 parse_pdf.py <pdf_file_path>

Reads a PDF file from the given path, extracts text using pypdf,
and outputs JSON result with UTF-8 encoding.
"""
import sys
import os
import json
import pypdf


def extract_text_from_file(file_path: str) -> str:
    """Extract text from a PDF file at the given path."""
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"PDF file not found: {file_path}")

    try:
        reader = pypdf.PdfReader(file_path)
        text = ''
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + '\n'
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"PDF text extraction failed: {e}")


def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({'error': 'No PDF file path provided'}, ensure_ascii=False))
            sys.exit(1)

        file_path = sys.argv[1]
        text = extract_text_from_file(file_path)
        print(json.dumps({'text': text}, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'error': str(e)}, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    main()
