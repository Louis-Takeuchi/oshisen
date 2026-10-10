// Content lives only in content.md. Change typography here, never the wording.
#let blocks = read("content.md").trim().split(regex("\r?\n\s*\r?\n"))
#let document-title = blocks.at(0).trim("# ", at: start)
#let edition = blocks.at(1)
#let body-font = "Noto Serif JP"
#let heading-font = "Noto Sans JP"

#set document(title: document-title, author: "オシセン", description: edition, date: none)
#set page(
  paper: "a4",
  margin: (top: 25mm, bottom: 22mm, left: 25mm, right: 25mm),
  footer-descent: 10mm,
  footer: context align(right, text(font: heading-font, size: 8.5pt, fill: rgb("#444444"))[
    オシセン 2026県議選版 | A | #counter(page).display("1")
  ]),
)
#set text(
  font: body-font,
  size: 10.5pt,
  fill: rgb("#111111"),
  lang: "ja",
  region: "JP",
  top-edge: 0.88em,
  bottom-edge: 0.12em,
  hyphenate: false,
  overhang: false,
  fallback: false,
  costs: (widow: 100%, orphan: 100%),
)
// Typst measures interline leading from the baseline to the next top edge.
// 0.88 * 10.5pt + 6.51pt = 15.75pt baseline spacing; add 6pt between items.
#set par(justify: false, leading: 6.51pt, spacing: 12.51pt)
#set heading(numbering: none, outlined: true)
#show heading: set text(font: heading-font, size: 11.5pt, weight: "bold")
#show heading: set block(above: 14pt, below: 6pt, sticky: true)
#set enum(
  numbering: "1",
  indent: 0pt,
  body-indent: 2.3mm,
  number-align: left,
  spacing: 12.51pt,
  tight: false,
)
#show link: set text(fill: rgb("#111111"))

// Render links without changing the displayed source text or parsing Typst code.
#let source-text(value) = {
  let pattern = regex("https://[^\\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}")
  let cursor = 0
  for found in value.matches(pattern) {
    text(value.slice(cursor, found.start))
    let destination = if found.text.starts-with("https://") { found.text } else { "mailto:" + found.text }
    link(destination, text(found.text))
    cursor = found.end
  }
  text(value.slice(cursor))
}

#block(width: 100%, above: 0pt, below: 9pt)[
  #align(center, text(font: heading-font, weight: "bold", size: 17pt, document-title))
]
#block(width: 100%, above: 0pt, below: 13pt)[
  #align(right, text(font: heading-font, size: 9pt, edition))
]
#par(source-text(blocks.at(2)))

#let render-sections(paragraphs) = {
  let items = ()
  for paragraph in paragraphs {
    if paragraph.starts-with("## ") {
      if items.len() > 0 { enum(..items); items = () }
      heading(level: 1, text(paragraph.slice(3)))
    } else if paragraph.match(regex("^[0-9]+\\. ")) != none {
      let prefix = paragraph.match(regex("^[0-9]+\\. "))
      items.push(enum.item(int(prefix.text.trim(". ", at: end)), source-text(paragraph.slice(prefix.end))))
    } else {
      if items.len() > 0 { enum(..items); items = () }
      // The supplementary provision stays one paragraph; no new heading is added.
      block(above: 14pt, par(source-text(paragraph)))
    }
  }
  if items.len() > 0 { enum(..items) }
}
#let last-article = blocks.enumerate().filter(pair => pair.at(1).starts-with("## ")).last().at(0)
#render-sections(blocks.slice(3, last-article))
// Keep a short closing article with its supplementary provision. If a future
// revision makes it long, let it flow across pages without shrinking the type.
#context {
  let closing = render-sections(blocks.slice(last-article))
  let short = measure(closing, width: 160mm).height < 80mm
  block(breakable: not short, above: 14pt, closing)
}
