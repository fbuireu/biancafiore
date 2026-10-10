# Editorial Content

The content domain of a personal editorial site: a writer's blog and portfolio. It covers what gets written and shown (Articles, Projects, Testimonials), the people and places behind it (Authors, Quotees, Cities), how writing is organized (Tags), and the editorial rules that shape how pieces are surfaced.

Contact submissions and breadcrumbs have folders under [`src/domain`](./src/domain) but no entry here: they are site plumbing, not editorial vocabulary.

## Content Types

**Article**:
A single piece of long-form writing published on the site, with a title, body, author, publish date, and topical tags. This is the core unit of the Blog.
_Avoid_: post, blog post, entry, story.

**Blog**:
The collection of all Articles and the section that lists them (titled "The Blog"). Refers to the body of writing, never to a single piece.
_Avoid_: journal, news, feed, articles page.

**Project**:
A typology of work Bianca does (an area of her practice rather than a single deliverable), showcased in the portfolio with a name, a rich-text description, and an image. Reader-facing copy counts them as "Disciplines". A Project has no page of its own: it is a section of the portfolio.
_Avoid_: work, case study, portfolio item, sample.

**Testimonial**:
A short quote of praise attributed to a Quotee, carrying their role and photo, used as social proof on the home page.
_Avoid_: review, endorsement, recommendation, quote (bare).

## People & Places

**Author**:
The person credited with writing an Article, described by name, job title, current company, bio, profile image, and social links. In the CMS an Author is a byline, credited on the Article. In practice almost always Bianca, but the model is deliberately not exclusive to one Author: multiple Authors are supported. One Author is one Slug: the name is a display label, so two Authors sharing a name are still two Authors, each with their own Articles.
_Avoid_: writer, contributor, user, admin.

**Byline**:
The Author attribution shown on an Article: who wrote it. Distinct from the Author entity itself.
_Avoid_: credit, signature.

**Quotee**:
The named person a Testimonial quotes, shown with their role and photo. Never an Author: an Author writes Articles, and a Quotee only speaks about the work.
_Avoid_: author, client, reviewer, endorser, source.

**City**:
A place where the Author has lived, tied to their biography, carrying a name, a Period, geographic coordinates, a description, and an image.
_Avoid_: location, place, destination.

**Period**:
The span the Author lived in a City: a required start and an optional end; an open (missing) end reads as "Present".
_Avoid_: duration, dates, timeframe.

## Taxonomy

**Tag**:
A topic label attached to Articles, identified by a name and slug, used to group and filter writing by subject.
_Avoid_: category, topic, keyword, label.

**Tag Index**:
The A–Z listing of every Tag that carries at least one Article, grouped into buckets by the first letter of the tag's name, each entry showing how many Articles carry it. A Tag nothing is filed under does not appear at all, and neither does an Author who has written nothing.
_Avoid_: tag cloud, glossary, tag list.

**Author Tag**:
An Author surfaced inside the Tag Index as if they were a Tag, letting readers browse everything a given person wrote. Sits alongside topical Tags but is an Author rather than a topic. One Slug addresses one page, so an Author Tag that collides with a topical Tag yields to it: the Tag answers and the Author Tag leaves the Index.
_Avoid_: byline filter, author facet.

**Count**:
The number of Articles associated with a Tag or Author Tag, shown next to it in the Tag Index and on tag pages.
_Avoid_: total, frequency, tally.

**Slug**:
The URL-safe identifier that addresses a page: an Article under /articles, a Tag or an Author Tag under /tags. One Slug addresses one page. There is no author route: a Byline links to the Author's Slug under /tags, which is where an Author Tag lives. A City has a Slug too, derived from its name, which addresses its place on About rather than a page. A Project has none, since it has no page of its own.
_Avoid_: permalink, handle, id.

## Editorial Concepts

**Featured Article**:
The Article the Blog leads with, chosen for the reader: one flagged as featured that has a Featured Image, else the first Article in the Blog's order that has one.
_Avoid_: hero, spotlight, top story, pinned.

**Favorite**:
An Article the Author (Bianca) marks as her own pick, which places it ahead of the reverse-chronological order the Blog otherwise follows. This is the Author's private preference and a Featured Article is chosen for the reader: separate flags, chosen for different reasons, though a Favorite with a Featured Image can decide which Article the Blog leads with when none is flagged as featured.
_Avoid_: starred, pinned, highlight, best-of.

**Featured Image**:
The image an Article carries at the top of the piece and in listings. An Article may have none, in which case it is presented in an image-less form.
_Avoid_: cover, thumbnail, hero image, banner.

**Republished Article**:
An Article that first appeared elsewhere and is re-run here, flagged as such so a banner can credit the earlier publication.
_Avoid_: cross-post, syndicated, reprint, mirror.

**Original Source**:
The earlier publication a Republished Article first appeared in. It is a name, not a URL: the original is no longer online, which is why it is credited rather than linked. It only means anything alongside the Republished flag.
_Avoid_: canonical, origin, reference, backlink.

**Reading Time**:
The estimated minutes needed to read an Article, derived from its word count and never less than one.
_Avoid_: read time, length, duration.

**Description**:
The few plain-text lines that stand for an Article in listings and metadata, written by the Author or, when there are none, taken from the opening of the body, and bounded in length either way.
_Avoid_: excerpt, summary, teaser, abstract, blurb.

**Related Articles**:
The set of *other* Articles shown alongside a given one: either hand-picked by the Author or, failing that, inferred from shared Tags. Never the Article itself, whichever way the set was arrived at.
_Avoid_: recommended, suggested, more like this, see also.

**Table of Contents**:
The in-page list of an Article's headings, used to navigate longer pieces.
_Avoid_: outline, index, TOC (bare), on-this-page.

**Latest Article**:
The Author's own Article with the latest publish date, carried on the Author. Not the Blog Preview: that takes the head of the Blog listing, which is Favorite-first and author-agnostic.
_Avoid_: newest, most recent post, recent.

**Blog Preview**:
The first few Articles of the Blog, in the Blog's own order, shown away from the Blog under the heading "Fresh from the blog" to lead a reader to it: a list on the home page, a slider on About and Contact, links on the 404 page. Which Articles lead is the Blog's decision (Favorite-first, whoever wrote them), not the Author's.
_Avoid_: latest articles, recent articles, teaser, newest.
