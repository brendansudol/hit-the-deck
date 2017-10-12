var fs = require('fs')
var marked = require('marked')
var minifier = require('html-minifier').minify

marked.setOptions({
  highlight: code => {
    return require('highlight.js').highlightAuto(code).value
  }
})

const minify = html =>
  minifier(html, { collapseWhitespace: true, minifyJS: true })

const toJson = str => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return null
  }
}

const parseSlide = txt => {
  const delim = '\n\n'
  const parts = txt.split(delim)
  const meta = toJson(parts[0])
  const rest = parts.slice(1).join(delim)

  return {
    html: marked(meta ? rest : txt),
    meta: meta,
    raw: txt
  }
}

const buildSlideMarkup = data => {
  const cls = (data.meta && data.meta.css) || ''
  return `<section class="${cls}">${data.html}</section>`
}

const deck = fs.readFileSync('deck.md', 'utf8')
const slides = deck
  .split('\n\n---\n\n')
  .filter(n => n.length)
  .map(parseSlide)
  .map(buildSlideMarkup)

const html = minify(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>Slide deck</title>
    <link rel="stylesheet" href="lib/css/reveal.css">
    <link rel="stylesheet" href="lib/css/theme.css">
    <link rel="stylesheet" href="lib/css/code.css">
  </head>
  <body>
    <div class="reveal">
      <div class="slides">${slides.join('\n')}</div>
    </div>
    <script src="lib/js/head.min.js"></script>
    <script src="lib/js/reveal.min.js"></script>
    <script>
    Reveal.initialize({
      center: false,
      controls: false,
      history: true,
      slideNumber: false,
      transition: 'none',
      width: 1000,
    });
    </script>
  </body>
</html>
`)

console.log(html)
fs.writeFileSync('index.html', html)
