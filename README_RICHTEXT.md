# RichText editor — markdown behavior and test scenarios

This document describes the RichText editor's formatting features, how they combine, how to reproduce
each case, and what markdown they produce.

The markup is YFM-compatible (Yandex-Wiki flavour); text colour is stored as `{color}(text)`.

---

## Summary matrix

Legend: ✅ supported (stable round-trip), ⚠️ supported with a caveat, ❌ not supported (corrupts on
round-trip). Rows are numbered; each maps to a same-numbered scenario below.

**Basics**

| #  | Feature                                        | Status | Markdown example        |
|----|------------------------------------------------|--------|-------------------------|
| 1  | Bold                                           | ✅ | `**bold**`                   |
| 2  | Italic                                         | ✅ | `*italic*`                   |
| 3  | Underline                                      | ✅ | `++under++`                  |
| 4  | Strikethrough                                  | ✅ | `~~strike~~`                 |
| 5  | Inline code                                    | ✅ | `` `code` ``                 |
| 6  | Text color                                     | ✅ | `{red}(text)` (see 17–20)    |
| 7  | Link                                           | ✅ | `[text](url)`                |
| 8  | Heading H1–H6                                  | ✅ | `# Head` … `###### Head`     |
| 9  | Bullet / ordered list                          | ✅ | `- item` / `1. item`         |
| 10 | Blockquote                                     | ✅ | `> quote`                    |
| 11 | Code block                                     | ✅ | ` ```\ncode\n``` `           |
| 12 | Paragraph (Enter) / line break (Shift+Enter)   | ✅ | `a\n\nb` / `a  \nb`          |

**Combinations & overlaps** (best → worst)

| #  | Feature                                              | Status | Markdown example              |
|----|------------------------------------------------------|--------|-------------------------------|
| 13 | Two+ inline marks combined                           | ✅ | `***x***`, `{red}(**x**)`          |
| 14 | Inline marks inside heading / list / quote           | ✅ | `# **b** head`, `- {red}(c) item`  |
| 15 | Three+ inline marks overlapping in a staircase       | ✅ | `++abc**def**++**gh~~ij~~**~~kl~~` |
| 16 | Bold and italic overlapping each other               | ⚠️ | an invisible zero-width space is inserted to keep it parseable |
| 17 | Bold or italic touching a parenthesis                | ❌ | `abc*def)*ghi` — `*` won't reopen; toolbar greys formatting (all but colour) |

**Text color** (best → worst)

| #  | Feature                                              | Status | Markdown example              |
|----|------------------------------------------------------|--------|-------------------------------|
| 18 | Color over text with parentheses                     | ✅ | `{red}(Hello \(world\))`           |
| 19 | Color across line breaks (Shift+Enter)               | ✅ | per line: `{red}(a)  \n{red}(b)` (differs from Yandex) |
| 20 | Color on inline code                                 | ⚠️ | impossible — code excludes marks   |

Everything ✅ round-trips (visual → markdown → visual) unchanged. The ⚠️ rows work with a caveat: 16
inserts an invisible zero-width space where bold and italic overlap (markdown can't nest them otherwise); 19 stores a
coloured multi-line block per line (differs from Yandex only in storage); 20 simply can't be created.
The one ❌ is 17 — bold/italic tight against a parenthesis genuinely can't be written in markdown
(fails in Yandex-Wiki too), so the toolbar greys out the formatting buttons (all but colour) to stop
it being created, following the same CommonMark rule Yandex-Wiki does. Sections below follow this
numbering.

---

## Test setup (do this once)

1. Open a RichText field, e.g. **Address** at
   `#/screen/client/view/clienteditgeneral/clientEdit/1000039` (login `demo` / `demo`).
2. Toolbar: **B** bold, **I** italic, **U** underline, **S** strikethrough, **Code** inline code,
   **Text color** (the "A" button — under **⋯ More** if the toolbar is narrow), **Heading**,
   **List**, **Quote**, and **⚙ Settings** at the top-right.
3. To read the stored markdown: **⚙ → Markdown markup**. To return: **⚙ → Visual Editor**.
   Below, "markdown" means what you see in Markdown markup.

---

## Basics (1–12)

Type text, select it (Ctrl+A), and click the toolbar button.

| #  | Action | Markdown |
|----|--------|----------|
| 1  | **B** bold | `**text**` |
| 2  | **I** italic | `*text*` |
| 3  | **U** underline | `++text++` |
| 4  | **S** strikethrough | `~~text~~` |
| 5  | **Code → Inline code** | `` `text` `` |
| 6  | **Text color** | `{red}(text)` — colours are covered in 17–20 |
| 7  | Link (type `[text](url)` in Markdown mode, or paste) | `[text](url)` |
| 8  | **Heading → H1 / H2 / H3** | `# Head` / `## Head` / `### Head` |
| 9  | **List → Bullet / Ordered** | `- one`⏎`- two` / `1. one`⏎`2. two` |
| 10 | **Quote** | `> quote` |
| 11 | **Code → Code block** | ` ```\ncode\n``` ` |
| 12 | Enter / Shift+Enter | new paragraph / soft line break |

---

## Combinations & overlaps (13–17)

Each scenario below is written as **Do:** the steps to reproduce, followed by the markdown you get.

### 13. Two+ inline marks combined — ✅

**Do:** type `text`, select all, click **B** then **I**.

```
***text***
```

Any mix nests the same way: **B**+**U** → `**++text++**`, colour+bold → `{yellow}(**text**)`,
colour+bold+italic+underline → `{yellow}(***++text++***)`, bold link → `[**text**](url)`.

### 14. Inline marks inside heading / list / quote — ✅

**Do:** type `b head`, select all and pick **Heading → H1**, then select just `b` and click **B**.

```
# **b** head
```

Works the same inside lists and quotes: `- {red}(c) item`, `> **b** quote`.

### 15. Three+ inline marks overlapping — ✅

**Do:** type `abcdefghijklmnop`; underline `abcdefgh`; bold `ghijkl`; strike `klmnop` — each mark
overlaps the next (a staircase).

```
++abcdef**gh**++**ij~~kl~~**~~mnop~~
```

Round-trips correctly: each mark reopens with its own delimiters. Overlaps that **start together** and
end at different points round-trip too — e.g. underline over all of `abcdefghijklmn`, bold over
`abcdefghi`, strike over `abc` → `++**~~abc~~defghi**jklmn++`. The marks are opened longest-first so
they nest validly (see *Note for maintainers*).

### 16. Bold and italic overlapping each other — ⚠️ (an invisible separator is inserted)

**Do:** type `abcdefghij`; bold `abcdef`; italic `defghij` — they overlap on `def`, neither nested in
the other.

```
**abc*def***⟨U+200B⟩*ghij*
```

Bold and italic both use `*`, so where they meet the markup would need an ambiguous run like `****`
that the reader can't tell apart, and both marks would be lost. Since the two can't be nested in
markdown, the editor inserts a separator between the closing and reopening delimiters so the run is
read as a `***` close and a separate `*` reopen — the span becomes bold (with a trailing italic) then
a separate italic span. The separator is a **zero-width space** (`⟨U+200B⟩` above), so nothing visible
is added: the text still reads `abcdefghij`. Formatting is preserved and the result round-trips. The
separator is a constant, `STAR_COLLISION_SEPARATOR` (see *Note for maintainers*).

### 17. Bold or italic touching a parenthesis — ❌ (toolbar disables all inline formatting here, not just bold/italic)

Bold (`**`) and italic (`*`) can't wrap a selection whose edge touches a parenthesis. The delimiter
would sit tight against the `)` with a letter just outside, which the markdown reader ignores (a
standard CommonMark "flanking" rule): bolding `)def` in `abc)def` would serialise to `abc**)def**`,
which reads back with `**` as literal text — the mark is lost. Escaping the paren doesn't help, and
Yandex-Wiki has the identical limitation.

(The colour + formatting case from the ticket is the same issue: colour `ab)`, then bold `)de` →
`{yellow}(ab**\)**)**de**`, where the bold `**` lands tight against the `)`. The guard blocks it too —
with `)de` selected, Bold is disabled, so you can't create it.)

To stop the user creating that state, the toolbar **greys out the formatting buttons** — bold,
italic, underline, strike and inline code, i.e. everything except colour — whenever the selection
starts or ends on a parenthesis next to a word character. This follows the CommonMark flanking rule
and matches how Yandex-Wiki behaves (see *Note for maintainers*).

**To see it:** type `abc)def`, then select `)def` — the formatting buttons are disabled; select `def`
instead and they enable again. Colour stays enabled throughout.

> In our parser only bold and italic actually break; underline (`++`), strike (`~~`) and inline code
> round-trip fine on their own. We still grey them out to stay behaviour-compatible with Yandex-Wiki.
> The guard covers the toolbar — hand-typed markdown or the Ctrl+B/I shortcut still bypass it.

---

## Text color (18–20)

Colour is stored as `{color}(text)`. Colours: `gray`, `yellow`, `orange`, `red`, `green`, `blue`,
`violet`. Colour always wraps formatting from the outside (`{yellow}(**text**)`); on a link the label
is coloured (`[{yellow}(site)](localhost)`); it can cover part of a span (`{green}(a**b**c)`) and mix
freely on a line (`text{red}(x)[{red}(link)](url){red}(y)`).

### 18. Color over text with parentheses — ✅

**Do:** type `Hello (world)`, select all, **Text color → Red**.

```
{red}(Hello \(world\))
```

Parentheses inside the span are escaped so an inner `)` can't be mistaken for its end. Same for a lone
paren or emoticon (`smile :) ok` → `{red}(smile :\) ok)`) and together with formatting (`Орган (тип)`
coloured + bold/italic/underline → `{green}(***++Орган \(тип\)++***)`).

### 19. Color across line breaks (Shift+Enter) — ✅

**Do:** type `one`, press **Shift+Enter**, type `two`, select all, **Text color → Green**.

```
{green}(one)  
{green}(two)
```

Each line becomes its own span. Yandex-Wiki keeps a single span across the break
(`{green}(++one\ntwo++)`); both are valid, look identical, and open the same in either editor.

### 20. Color on inline code — ⚠️

**Do:** select some inline `` `code` `` and try **Text color** — nothing happens.

Inline code excludes every other mark, so colour (and bold/italic/…) can't attach. There is simply no
such combination to store.

---

## Note for maintainers

Stable Markdown is produced by `@tiptap/markdown` (Tiptap 3.28) with five small patches, each in
its own extension file. Each one wraps a private `@tiptap/markdown` method; 
NOTE! if a library upgrade renames or removes patched methods the fix stops applying:

- `extensions/Colorify.ts` — escapes `(` `)` inside a colour span so an inner `)` can't end it early
  (wraps `encodeTextForMarkdown`; scenario 18).
- `extensions/HardBreakMarkFix.ts` — fixes marks that span a Shift+Enter line break (wraps
  `serialize`; scenario 19).
- `extensions/CrossedMarkReopenFix.ts` — reopens a mark split by an overlap using markdown delimiters
  instead of raw HTML, as Yandex / prosemirror-markdown do (wraps `getHtmlReopenTags`; scenario 15).
- `extensions/BoldItalicOverlapFix.ts` — inserts a separator (`STAR_COLLISION_SEPARATOR`) between the
  colliding `*` runs of a bold ∩ italic overlap so it stays parseable (wraps `serialize`; scenario 16).
- `extensions/MarkNestingOrderFix.ts` — opens overlapping marks longest-first so they nest validly
  (a shorter mark opened outside a longer one loses the longer one on read-back); wraps
  `renderNodesWithMarkBoundaries` + `getMarksToOpenForSerialization`; scenario 15. Works around the
  open Tiptap bug https://github.com/ueberdosis/tiptap/issues/7376 (no upstream fix as of 3.28, the
  latest) — drop it once that ships.

The one hard ❌ is case 17 — bold/italic tight against a parenthesis, a markdown/CommonMark limit
shared with Yandex; fully solving it would require switching the parser to `markdown-it` (the Yandex
stack). It is guarded in the UI instead: `wysiwyg/canApplyInlineMark.ts` disables bold, italic, underline, strike and inline code
in `MenuBar.tsx` (every inline mark except colour) when the selection edge would break CommonMark
flanking. The implementation is our own — it follows the public [CommonMark
rule](https://spec.commonmark.org/0.31.2/#left-flanking-delimiter-run) and is **inspired by**, and
behaviourally aligned with, gravity-ui's
[`canApplyInlineMarkInMarkdown`](https://github.com/gravity-ui/markdown-editor/blob/main/packages/editor/src/utils/marks.ts)
so formatting stays portable if content is ever migrated to or edited in Yandex-Wiki. Only bold/italic
actually break in our parser; we gate the wider set to keep that behaviour aligned. The guard covers
the toolbar only — not the Ctrl+B/I shortcuts or hand-typed markdown.
