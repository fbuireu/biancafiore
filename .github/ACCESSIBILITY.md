# Accessibility

[biancafiore.me](https://biancafiore.me) is the portfolio and blog of Bianca Fiore. Visitors should be able to
read every article, browse the portfolio and get in touch with a keyboard alone, with a screen reader, at high zoom
and with reduced motion. This page says what the site does toward that, what is and is not tested, how to report a
barrier, and what a pull request has to keep working.

## What the site does

- **A declared language.** Every page declares British English, so a screen reader reads it with the right voice.
- **Visible focus.** Links and controls show a focus ring when reached with the keyboard.
- **A menu that holds focus.** The menu button says whether the menu is open, and while it is, the page behind it
  cannot be reached with Tab or a screen reader.
- **A contact form that explains itself.** A field with an error is marked invalid and points at its message. A
  failed send is announced at once, a successful one without interrupting.
- **Contact tabs.** *Email me* and the booking tab follow the tab pattern: the arrow keys move between them.
- **Less motion.** With your system's reduce-motion setting on, the scroll-driven reveals, the page transitions and
  the globe's rotation stop, and the contact form skips its animation delays.
- **A dark theme.** The switch in the footer turns it on. The site opens light whatever your system prefers, and
  remembers your choice.

The booking calendar on the Contact page is Calendly's embedded widget, so how well it works with assistive
technology is down to Calendly. If you cannot use it, the *Email me* tab on the same page reaches the same person.

Articles, projects and testimonials are written in the CMS, not in this repository, so their headings, link text
and image descriptions are set there.

## What is tested

- End-to-end tests run on every pull request in desktop Chromium and desktop WebKit, the engine behind Safari.
  Phones and tablets are not part of these runs.
- Biome's accessibility lint rules check the React components, such as the contact form and the globe. They do not
  check the markup of the Astro templates, which is most of the site.
- No screen reader, voice control or switch access is tested on a schedule, and no automated accessibility scan
  runs in CI. Reports from people who use them are the main way barriers there come to light.
- The site has not been audited against WCAG, so this page makes no conformance claim.

## Known barriers

Barriers already found are tracked as
[open issues with the `accessibility` label](https://github.com/fbuireu/biancafiore/issues?q=is%3Aissue%20state%3Aopen%20label%3Aaccessibility).

## Reporting a barrier

If part of the site is hard or impossible for you to use,
[open a bug report](https://github.com/fbuireu/biancafiore/issues/new?template=bug_report.yml). If the barrier is
in an article's content, such as an image without a description, the
[content issue form](https://github.com/fbuireu/biancafiore/issues/new?template=content_issue.yml) fits better.
Without a GitHub account, use the [contact form](https://biancafiore.me/contact) and say the message is about
accessibility. You don't need to say anything about a disability.

Include as much of this as you can:

- What you were trying to do, and what happened instead.
- The page URL.
- Your browser, operating system and device, in the form's *Browser and OS* field.
- Any assistive technology you use, such as a screen reader, magnifier or voice control, and its version. It goes
  in the same field.
- Settings that change how pages look or move: zoom or text size, high contrast or forced colours, dark mode,
  reduced motion.
- A screenshot or recording, if you're comfortable sharing one.

### What happens next

- The issue gets the `accessibility` label, so it joins the list above.
- Questions about missing details, and a workaround when there is one, come in the issue.
- No date is promised for a fix. The fix links the issue, which closes when it ships. A fix in content is made in
  the CMS, and the issue says when it is.

## For contributors

A change to the site keeps the above working:

- Prefer the native element (a `button`, a `label`, a list) to a `div` with a role, and give every control a name a
  screen reader can read.
- Keep the focus ring. A component that restyles focus replaces the ring with one of its own.
- Make an animation's still state the one a visitor with reduced motion sees, handled once in `reset.css` unless the
  component's still state differs from its end state (`S12` in [CODING_STANDARDS.md](../CODING_STANDARDS.md)).
- Give every image in a template an `alt`: a description when it carries meaning, empty when it is decoration.
- Before opening a pull request that changes the UI, use it with the keyboard alone: every control reachable with
  Tab, operable with Enter, Space or the arrow keys its pattern expects, focus visible throughout, and a way out of
  the menu.
- If a change adds a barrier it cannot avoid, say so in the pull request and open an issue with the
  `accessibility` label.

## Ownership

[Ferran Buireu](https://github.com/fbuireu) maintains the site's code and this page; Bianca Fiore writes the
content. The page changes in the same commit as the behaviour it describes.

## Feedback on this page

If something here is wrong, unclear or missing,
[open a documentation issue](https://github.com/fbuireu/biancafiore/issues/new?template=documentation.yml). To
report a barrier on the site, see [Reporting a barrier](#reporting-a-barrier).
