# Technical Blog
![App Preview](https://imgix.cosmicjs.com/ebc0fe80-947e-11f1-b939-859296e70f19-image.png?w=1200&h=630&fit=crop&auto=format,compress)

A dense, typography-first engineering blog built with Next.js 16 and [Cosmic](https://www.cosmicjs.com), styled in the spirit of the ngrok and Greptile engineering blogs.

## Features

- 🏠 Featured post hero + reverse-chronological post index
- 📖 Article pages with markdown rendering, headings, blockquotes, and lists
- 💻 Syntax-highlighted fenced code blocks with language label and copy-to-clipboard
- 📊 Inline chart figures (bar, grouped-bar, line, stacked-bar, donut) via Recharts
- 🧭 Sticky, scroll-spy table of contents generated from `h2`/`h3` headings
- 🏷️ Tag & category archive pages
- ✍️ Author profile pages with bio, role, avatar, and post list
- 🌓 Persistent dark mode toggle
- 🔍 SEO: metadata, Open Graph/Twitter cards, JSON-LD Article schema, canonical URLs, sitemap, RSS feed
- ♿ Semantic, accessible, keyboard-navigable, fully responsive

## Clone this Project

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=6a7961cbdb954d1135f656d0&clone_repository=6a796b75db954d1135f658d0)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "Create content models for: Create a modern technical blog that includes code samples and graphs
>
> IMPORTANT: The user provided reference URLs (https://www.greptile.com/blog/model-inversion, https://ngrok.com/blog/i-ported-kubernetes-to-the-browser). External web content from these URLs is included in this message. Use the actual titles, descriptions, and content found on those pages as the basis for demo objects. Do NOT generate generic placeholder content when real content is available from the crawled pages.
>
> The user is rebuilding an existing website and provided these design notes: Check out the Greptile https://www.greptile.com/blog/model-inversion and ngrok blog https://ngrok.com/blog/i-ported-kubernetes-to-the-browser and let's make a technical blog that includes graphs in content blocks. Factor these preferences into the content structure."

### Code Generation Prompt

> "Build a Next.js application for a company website called "Technical Blog". The content is managed in Cosmic CMS with the following object types: authors, categories, posts. Create a beautiful, modern, responsive design with a homepage and pages for each content type.
>
> User instructions: A modern engineering blog in the style of the ngrok and Greptile blogs: dense, technical, typography-first, dark-mode friendly.
>
> Content model (already exists, do not recreate): "posts", "authors", "categories".
>
> Pages:
> 1. Home / post index at "/": large featured post hero at top (posts where metadata.featured is true), then a clean reverse-chronological list of all posts sorted by metadata.published_date descending. Each list row shows cover_image thumbnail, title, excerpt, author name + avatar, category pill using the category's accent_color, tag chips, published date, and reading_time ("8 min read").
> 2. Post detail at "/blog/[slug]": centered article column ~700px max width, generous line height, large readable serif or high-quality sans body type. Render metadata.content (rich text / markdown) with proper heading hierarchy, blockquotes, lists, and inline links. Syntax-highlighted fenced code blocks with a language label and a copy-to-clipboard button. Sticky table of contents in the left or right margin on desktop, generated from h2/h3 headings, highlighting the active section on scroll. Author byline card at top with avatar, name, role, and X handle link. Related posts at the bottom matched by shared category or tags. Respect metadata.canonical_url by emitting a <link rel="canonical"> when present.
> 3. Charts: metadata.charts is a JSON array of figures. Render each inline in the article where referenced, supporting chart_type values bar, grouped-bar, line, stacked-bar, and donut, with the figure title, axis unit label, and a caption. Use a lightweight chart library (e.g. Recharts) with colors that work in both light and dark mode.
> 4. Tag and category archive pages at "/tags/[tag]" and "/categories/[slug]" listing matching posts.
> 5. Author pages at "/authors/[slug]" with bio, role, avatar, and their posts.
>
> Design: minimal monochrome base with a single accent color, strong typographic scale, subtle borders instead of heavy shadows, plenty of whitespace, fast and lightweight. Dark mode toggle that persists. Fully responsive, mobile-first. Accessible: semantic HTML, alt text from the media records, keyboard-navigable, visible focus states.
>
> SEO: per-page title and meta description from excerpt, Open Graph and Twitter card tags using cover_image, JSON-LD Article schema, an RSS feed at /rss.xml, and a sitemap.xml.
>
> Only show posts with status published."

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## Technologies

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) + `@tailwindcss/typography`
- [Cosmic](https://www.cosmicjs.com) via [`@cosmicjs/sdk`](https://www.cosmicjs.com/docs)
- [react-markdown](https://github.com/remarkjs/react-markdown) + `remark-gfm`
- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- [Recharts](https://recharts.org)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- A Cosmic account with a bucket containing `posts`, `authors`, and `categories` object types

### Installation

```bash
bun install
```

Set up your environment variables (see below), then run:

```bash
bun run dev
```

Visit `http://localhost:3000`.

### Environment Variables

```env
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key

# Optional — used for absolute URLs in sitemap.xml, rss.xml, and Open Graph tags
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Cosmic SDK Examples

```typescript
// Fetch all published posts, newest first, with author & category populated
const response = await cosmic.objects
  .find({ type: 'posts', status: 'published' })
  .props(['id', 'slug', 'title', 'metadata', 'created_at'])
  .depth(1);

const posts = response.objects.sort((a, b) => {
  const dateA = new Date(a.metadata?.published_date || a.created_at || '').getTime();
  const dateB = new Date(b.metadata?.published_date || b.created_at || '').getTime();
  return dateB - dateA;
});
```

```typescript
// Fetch a single post by slug
const response = await cosmic.objects
  .findOne({ type: 'posts', slug, status: 'published' })
  .depth(1);
const post = response.object;
```

## Cosmic CMS Integration

This app reads three object types from your bucket:

- **posts** — `excerpt`, `content` (markdown), `cover_image`, `author` (object), `category` (object), `tags` (array), `charts` (JSON array of figures), `reading_time`, `published_date`, `featured`, `canonical_url`
- **categories** — `name`, `description`, `accent_color`
- **authors** — `name`, `role`, `bio`, `avatar`, `email`, `x_handle`

### Authoring conventions

- **Charts**: reference a chart from `metadata.charts` inline in your markdown `content` using a fenced code block with the language `chart` and the chart's `id` as the content:
  ````
  ```chart
  latency-p99-by-region
  ```
  ````
  Each entry in `metadata.charts` should look like:
  ```json
  {
    "id": "latency-p99-by-region",
    "chart_type": "grouped-bar",
    "title": "P99 latency by region",
    "unit": "ms",
    "caption": "Measured across 3 rolling weeks.",
    "categories": ["us-east", "us-west", "eu-central"],
    "series": [{ "name": "before", "data": [120, 98, 140] }, { "name": "after", "data": [45, 40, 52] }]
  }
  ```
  For `donut` charts, use `data: [{ "name": "...", "value": 10 }, ...]` instead of `categories`/`series`.
- Only posts with a **published** status are rendered on the site.

## Deployment Options

### Vercel

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add the environment variables above in the Vercel dashboard.
4. Deploy.

### Netlify

1. Push this repository to GitHub.
2. Create a new site in [Netlify](https://netlify.com) from your repo.
3. Build command: `bun run build` — Publish directory: `.next`
4. Add the environment variables above in the Netlify dashboard.
5. Deploy.

For production, always set `COSMIC_BUCKET_SLUG`, `COSMIC_READ_KEY`, and `COSMIC_WRITE_KEY` in your hosting platform's environment variable settings.
<!-- README_END -->