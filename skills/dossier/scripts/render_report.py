#!/usr/bin/env python3
"""Render an authored dossier as a portable aerospace-style HTML report."""
from __future__ import annotations

import argparse
import csv
import html
from pathlib import Path
import re


def render(source: Path, output: Path, date: str, sources: Path | None = None,
           deck: str | None = None, author: str = 'Arach') -> None:
    try:
        import markdown
    except ImportError as exc:
        raise SystemExit('This renderer requires the Python Markdown package. Use an environment with Markdown installed.') from exc
    text = source.read_text(encoding='utf-8')
    title_match = re.search(r'^# (.+)$', text, re.MULTILINE)
    title = title_match.group(1) if title_match else source.stem.replace('-', ' ')
    md = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc'])
    body = md.convert(text)
    body = re.sub(r'<h1\b[^>]*>.*?</h1>', '', body, count=1, flags=re.DOTALL)
    headings = list(re.finditer(r'<h2 id="([^"]+)">(.*?)</h2>', body, re.DOTALL))
    nav = []
    sections = []
    for idx, match in enumerate(headings):
        ident, label = match.groups()
        clean = re.sub('<[^>]+>', '', label)
        nav.append(f'<li><a href="#{ident}">{clean}</a></li>')
        end = headings[idx + 1].start() if idx + 1 < len(headings) else len(body)
        section_body = body[match.end():end]
        sections.append(f'<section id="{ident}"><h2><span class="section-id">SECTION {idx+1:02d}</span>{label}</h2>{section_body}</section>')
    intro = body[:headings[0].start()] if headings else body
    article = '<div class="intro">' + intro + '</div>' + ''.join(sections)
    article = article.replace('<table>', '<div class="table-scroll" tabindex="0" role="region" aria-label="Evidence table, scroll horizontally if needed"><table>').replace('</table>', '</table></div>')
    css = (Path(__file__).resolve().parents[1] / 'assets/aerospace.css').read_text()
    links = []
    source_count = None
    if sources:
        with sources.open(newline='', encoding='utf-8') as f:
            source_count = len(list(csv.DictReader(f)))
        import os
        links.append(f'<a href="{html.escape(os.path.relpath(sources, output.parent), quote=True)}">Sources</a>')
    if deck:
        links.append(f'<a class="optional" href="{html.escape(deck, quote=True)}">Review deck</a>')
    import os
    links.append(f'<a class="optional" href="{html.escape(os.path.relpath(source, output.parent), quote=True)}">Source text</a>')
    links.append('<button type="button" id="print-report">Print</button>')
    escaped_title, escaped_date, escaped_author = map(html.escape, (title, date, author))
    metadata = f'<span>RESEARCH CUTOFF <b>{escaped_date}</b></span>'
    if source_count is not None:
        metadata += f'<span>SOURCE RECORDS <b>{source_count}</b></span>'
    nav_html = '<ol>' + ''.join(nav) + '</ol>'
    result = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escaped_title}</title><style>{css}</style></head>
<body><a class="skip" href="#report">Skip to report</a><header class="masthead"><a class="wordmark" href="#report">{escaped_author}<span>Research</span></a><nav aria-label="Report files">{''.join(links)}</nav></header>
<div class="report-shell"><aside class="index"><div class="index-label">Document index</div><nav aria-label="Sections">{nav_html}</nav><small>Dated research.<br>Claims retain their sources.<br>Unknowns remain explicit.</small></aside><main id="report">
<header class="title-plate"><div class="plate-top"><span>COMPANY DOSSIER</span><span>RESEARCH EDITION / {escaped_date}</span></div><h1>{escaped_title}</h1><div class="plate-meta">{metadata}</div></header>
<details class="mobile-index"><summary>Explore the report</summary>{nav_html}</details>{article}
<footer class="report-footer"><span>{escaped_author} / Company research</span><span>Research cutoff: {escaped_date}</span></footer></main></div>
<script>document.getElementById('print-report').addEventListener('click',()=>window.print());
const sections=[...document.querySelectorAll('main section[id]')];
if('IntersectionObserver' in window){{const observer=new IntersectionObserver(entries=>{{for(const e of entries){{if(e.isIntersecting){{document.querySelectorAll('.index a').forEach(a=>{{if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}});}}}}}},{{rootMargin:'-10% 0px -65% 0px'}});sections.forEach(s=>observer.observe(s));}}</script></body></html>'''
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(result, encoding='utf-8')
    print(f'Rendered {len(headings)} sections to {output}')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--date', required=True, help='Research cutoff, e.g. 2026-10-28')
    parser.add_argument('--sources', type=Path)
    parser.add_argument('--deck', help='Relative path or URL to an existing review deck')
    parser.add_argument('--author', default='Arach')
    args = parser.parse_args()
    if args.source.resolve() == args.output.resolve():
        parser.error('Output must differ from the Markdown source')
    render(args.source.resolve(), args.output.resolve(), args.date,
           args.sources.resolve() if args.sources else None, args.deck, args.author)


if __name__ == '__main__':
    main()
