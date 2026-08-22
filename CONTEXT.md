# Editorial Content

The content domain of a personal editorial site: a writer's blog and portfolio. It covers what gets written and shown (Articles, Projects, Testimonials), the people and places behind it (Authors, Cities), how writing is organized (Tags), and the editorial rules that shape how pieces are surfaced.

Contact submissions, breadcrumbs and the cross-concept `shared` primitives have folders under `src/domain` but no entry here: they are site plumbing, not editorial vocabulary, and the docs-consistency test allowlists all three as deliberate omissions.

## Content Types

**Article**:
A single piece of long-form writing published on the site, with a title, body, author, publish date, and topical tags. This is the core unit of the Blog.
_Avoid_: post, blog post, entry, story.

**Blog**:
The collection of all Articles and the section that lists them (titled "The Blog"). Refers to the body of writing, never to a single piece.
_Avoid_: journal, news, feed, articles page.

**Project**:
A typology of work Bianca does — an area of her practice rather than a single deliverable — showcased in the portfolio with a name, a rich-text description rendered to HTML, and an image. The home page counts them under the heading "Disciplines": that is reader-facing copy, the concept is a Project everywhere in code. Whether the term widens is open: ADR 0010 records the question that blocks it, which is what a Project would still be once it had a slug and a body. Until that is answered, a Project is addressed by a fragment on the Projects page and the schema is what a card needs.
_Avoid_: work, case study, portfolio item, sample.

**Testimonial**:
A short attributed quote of praise from a named person, carrying their role and photo, used as social proof on the home page.
_Avoid_: review, endorsement, recommendation, quote (bare).

## People & Places

**Author**:
The person credited with writing an Article, described by name, job title, current company, bio, profile image, and social links. In practice almost always Bianca, but the model is deliberately not exclusive to one Author — multiple Authors are supported. One Author is one Slug: the name is a display label, so two Authors sharing a name are still two Authors, each with their own Articles.
_Avoid_: writer, contributor, user, admin.

**Byline**:
The Author attribution shown on an Article — who wrote it. Distinct from the Author entity itself.
_Avoid_: credit, signature.

**City**:
A place where the Author has lived, tied to their biography, carrying a name, a Period, geographic coordinates, a description, and an image. Cities are plotted by their coordinates on the About page to trace where the Author has lived.
_Avoid_: location, place, destination.

**Period**:
The span the Author lived in a City — a required start and an optional end; an open (missing) end reads as "Present".
_Avoid_: duration, dates, timeframe.

## Taxonomy

**Tag**:
A topic label attached to Articles, identified by a name and slug, used to group and filter writing by subject.
_Avoid_: category, topic, keyword, label.

**Tag Index**:
The A–Z listing of every Tag that carries at least one Article, grouped into buckets by the first letter of the tag's name, each entry showing how many Articles carry it. A Tag nothing is filed under does not appear at all, and neither does an Author who has written nothing.
_Avoid_: tag cloud, glossary, tag list.

**Author Tag**:
An Author surfaced inside the Tag Index as if they were a Tag, letting readers browse everything a given person wrote. Sits alongside topical Tags but is typed as an author rather than a tag. One Slug addresses one page, so an Author Tag that collides with a topical Tag yields to it: the Tag answers and the Author Tag leaves the Index rather than appearing twice in it and once at the page.
_Avoid_: byline filter, author facet.

**Count**:
The number of Articles associated with a Tag or Author Tag, shown next to it in the Tag Index and on tag pages. It is never stored: each page counts the list it is showing, so the number and the Articles under it cannot disagree.
_Avoid_: total, frequency, tally.

**Slug**:
The URL-safe identifier that addresses a page: an Article under /articles, a Tag or an Author Tag under /tags. There is no author route — a Byline links to the Author's slug under /tags, which is where an Author Tag lives. A City has a slug too, derived from its name, but it addresses no page: it is the anchor id of the city's card on About. A Project has none: it is addressed by an id in a fragment on `/projects`, which ADR 0010 records as the current answer rather than a placeholder.
_Avoid_: permalink, handle, id.

## Editorial Concepts

**Featured Article**:
The reader-facing hero of the Blog — the first Article flagged as featured that also has a cover image, falling back to the first Article with a cover image if none is flagged. "First" means first in the Blog's listing order, so the fallback follows the Favorite-first sort rather than pure recency.
_Avoid_: hero, spotlight, top story, pinned.

**Favorite**:
An Article the Author (Bianca) marks as her own pick, which sorts it to the top of the Article collection — and therefore of the Blog listing, the sliders and the tag pages, which read that one order — ahead of the normal reverse-chronological order. The RSS feed is the exception: it re-sorts by publish date, because a subscriber's reader expects chronology rather than the Author's preference. This is the Author's private preference and a Featured Article is the reader-facing hero: separate flags, chosen for different reasons, though a Favorite with a cover image can decide where the Featured fallback lands.
_Avoid_: starred, pinned, highlight, best-of.

**Featured Image**:
The cover image of an Article, shown at the top of the piece and in listings. An Article may have none, in which case it is presented in an image-less form.
_Avoid_: cover, thumbnail, hero image, banner.

**Republished Article**:
An Article that first appeared elsewhere and is re-run here, flagged as such so a banner — labelled "Archival note" to the reader — can credit the earlier publication.
_Avoid_: cross-post, syndicated, reprint, mirror.

**Original Source**:
The earlier publication a Republished Article first appeared in. It is a name, not a URL, and the banner prints it as plain text: the copy says the original is no longer online, which is the reason it is credited rather than linked.
_Avoid_: canonical, origin, reference, backlink.

**Reading Time**:
The estimated minutes needed to read an Article, derived from its word count and never less than one: the bylines print the figure as plain text, so the shortest piece — and a body with no words at all — still reads as a minute rather than as nothing.
_Avoid_: read time, length, duration.

**Description**:
The short summary of an Article shown in listings and metadata, taken from an authored blurb or, when there is none, from the opening of the body. Either way it is stripped of markup and cut to a fixed length, so an over-long blurb is trimmed too.
_Avoid_: excerpt, summary, teaser, abstract, blurb.

**Related Articles**:
The set of *other* Articles suggested alongside a given one — either hand-picked by the Author or, failing that, inferred from shared Tags. Never the Article itself, whichever way the set was arrived at: identity here is the Slug, so two Articles that happen to share a title are still two Articles and each may suggest the other.
_Avoid_: recommended, suggested, more like this, see also.

**Table of Contents**:
The in-page outline of an Article built from its headings, used to navigate longer pieces.
_Avoid_: outline, index, TOC (bare), on-this-page.

**Latest Article**:
The Author's own single most recent Article by publish date, carried on the Author and emitted in the About page's profile structured data. Not the "Fresh from the blog" sliders on About and Contact: those take the head of the Blog listing, which is Favorite-first and author-agnostic.
_Avoid_: newest, most recent post, recent.
