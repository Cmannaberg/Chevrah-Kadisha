# Chevrah Kadisha Newsletter Articles
## How to Add a New Article Each Month

---

## What This File Is

`Newsletter_Articles.html` is a single self-contained web page
hosting a series of articles written for the Temple B'nai Israel
and Congregation of Moses newsletter. Each article has its own
section on the page with sticky navigation, a Hebrew title, and
interactive Hebrew term popups.

The page is published at:
```
https://cmannaberg.github.io/Chevrah-Kadisha/Chevrah_Kadisha_Newsletter/Newsletter_Articles.html
```

---

## How to Add a New Article

### Step 1 — Write your article in Google Docs as usual

Write the article the way you normally would. Note any Hebrew
terms you want to make interactive (clickable popups).

---

### Step 2 — Open Newsletter_Articles.html in GitHub

1. Go to your repository on GitHub
2. Navigate to `Chevrah_Kadisha_Newsletter/Newsletter_Articles.html`
3. Click the **pencil icon** to edit the file

---

### Step 3 — Update the Table of Contents

Find the `<nav class="toc">` section near the top of the file.
It looks like this:

```html
<li><a href="#art6">Honoring the Dead Across Traditions</a>
    <span class="toc-sub">Comparing Jewish and Islamic funeral practices</span></li>
```

Add your new article to the end of the list:

```html
<li><a href="#art7">YOUR ARTICLE TITLE HERE</a>
    <span class="toc-sub">Your short subtitle here</span></li>
```

---

### Step 4 — Update the last article's sticky nav

Find the sticky nav above Article 6 (the current last article).
It ends with:
```html
<a href="#cover">↑ Contents</a>
```

Change it to point to your new article:
```html
<a href="#art7">Next →</a>
```

And update the bottom nav of Article 6 the same way:
```html
<div class="art-nav"><a href="#art5">← Article 5</a><a href="#art7">Next Article →</a></div>
```

---

### Step 5 — Paste in the new article using the template below

Copy the template, paste it just before the POPUP section
at the bottom of the file (look for the comment that says
`<!-- POPUP -->`), and fill in your content.

---

### Step 6 — Commit the changes

Scroll down and click **Commit changes**. The page updates
immediately on GitHub Pages.

---

## Article Template

Copy and paste this block for each new article.
Replace all CAPS placeholders with your content.

```html
<!-- ══════════════ ARTICLE 7 ══════════════ -->
<nav class="sticky-nav">
  <a href="#art6">← Article 6</a>
  <span class="nav-title">Chevrah Kadisha Series</span>
  <a href="#cover">↑ Contents</a>
</nav>

<article class="article" id="art7">
  <div class="art-num">Article Seven &nbsp;·&nbsp; MONTH YEAR</div>
  <h2>YOUR ENGLISH TITLE HERE</h2>
  <div class="art-heb">הֶבְרֵאִית</div>
  <hr class="art-rule">

  <p>YOUR FIRST PARAGRAPH HERE. To add a clickable Hebrew term,
  use the format shown below.</p>

  <p>YOUR SECOND PARAGRAPH HERE.</p>

  <p>YOUR THIRD PARAGRAPH HERE.</p>

  <p><em>Next month: PREVIEW OF NEXT ARTICLE.</em></p>

  <div class="divider">· · ✦ · ·</div>
</article>

<div class="art-nav"><a href="#art6">← Article 6</a><a href="#cover">↑ Contents</a></div>
```

---

## How to Add a Clickable Hebrew Term

Use this pattern anywhere inside your article paragraphs:

```html
<span class="ht" tabindex="0"
  data-s="הֶבְרֵאִית"
  data-r="transliteration"
  data-t="English definition or explanation of the term">
  <span class="ht-s">הֶבְרֵאִית</span>
  <span class="ht-r">transliteration</span>
</span>
```

**The three data attributes:**
| Attribute | What it contains |
|---|---|
| `data-s` | The Hebrew word (shown large in the popup) |
| `data-r` | The transliteration in English letters |
| `data-t` | The English definition shown in the popup |

**Example — the word Shmirah:**
```html
<span class="ht" tabindex="0"
  data-s="שְׁמִירָה"
  data-r="Shmirah"
  data-t="Guarding — the practice of staying with the deceased from Taharah until burial">
  <span class="ht-s">שְׁמִירָה</span>
  <span class="ht-r">Shmirah</span>
</span>
```

---

## How to Add a Blockquote

Use this for prayers, Talmud quotes, or poetic passages:

```html
<blockquote>
  <p style="font-size:1.3rem; direction:rtl; color:var(--navy);
     font-weight:600; margin-bottom:0.5rem;">
    הֶבְרֵאִית טֶקְסְט פֹּה
  </p>
  <p style="margin-bottom:0.5rem; font-style:italic;">
    Transliteration here
  </p>
  <p style="font-style:italic; color:var(--muted); font-size:0.95rem;">
    "English translation here"
  </p>
</blockquote>
```

---

## How to Add a Bulleted List

```html
<h3>Your Section Heading</h3>
<ul>
  <li><strong>Bold label:</strong> Your text here.</li>
  <li><strong>Bold label:</strong> Your text here.</li>
</ul>
```

---

## Article Numbering Reference

| ID | Article |
|---|---|
| `#art1` | What is a Chevrah Kadisha? |
| `#art2` | Taharah — The Purification Ritual |
| `#art3` | Shmirah — Guarding the Deceased |
| `#art4` | Tachrichim — Burial Garments |
| `#art5` | Chevrah Kadisha Liturgy |
| `#art6` | Honoring the Dead Across Traditions |
| `#art7` | *(your next article)* |
| `#art8` | *(future article)* |

---

## Tips

- Always increment the article number (art7, art8, etc.)
- Update the sticky nav of the PREVIOUS last article to point forward
- Update the bottom nav of the PREVIOUS last article to point forward
- The last article's sticky nav should always end with `↑ Contents`
- Hebrew text goes right-to-left automatically with `direction:rtl`
- Test the page after committing by opening the GitHub Pages URL

---

*ברוך דיין האמת — Blessed is the True Judge*
