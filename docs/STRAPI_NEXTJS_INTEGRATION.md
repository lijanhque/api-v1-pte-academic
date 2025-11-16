# Strapi + Next.js Integration Guide

Complete guide for integrating Strapi CMS with your PTE Academic platform.

## Overview

This platform uses **Strapi** as a headless CMS for:
- ✅ Blog posts
- ✅ Study resources
- ✅ Courses
- 🔄 Question bank (optional migration)
- 🔄 Mock tests (optional migration)

## Current Implementation Status

### ✅ Completed

1. **Strapi Client Library** - [lib/strapi/client.ts](../lib/strapi/client.ts)
2. **Blog Listing Page** - [app/blog/page.tsx](../app/blog/page.tsx)
3. **Blog Detail Page** - [app/blog/[slug]/page.tsx](../app/blog/[slug]/page.tsx)
4. **Blog Navigation** - Added to Academic Sidebar
5. **Environment Configuration** - `.env.local` with Strapi credentials
6. **Export Tool** - [scripts/export-to-strapi-json.ts](../scripts/export-to-strapi-json.ts)

### 🔄 Optional Next Steps

1. Migrate question bank to Strapi (see [STRAPI_SETUP_GUIDE.md](./STRAPI_SETUP_GUIDE.md))
2. Create mock test management in Strapi
3. Add course content management

---

## Environment Configuration

### Required Environment Variables

Add to `.env.local`:

```bash
# Strapi CMS Configuration
STRAPI_API_URL=https://strapi-production-1ee4.up.railway.app
STRAPI_API_TOKEN=10eo4ps0h5ao5f5l5cb7wr6ojx9xiefb
```

**Your Strapi Instance:**
- URL: `https://strapi-production-1ee4.up.railway.app`
- Admin: `https://strapi-production-1ee4.up.railway.app/admin`
- API Token: `10eo4ps0h5ao5f5l5cb7wr6ojx9xiefb` (Admin JWT Secret)

---

## Strapi Client Usage

### Importing the Client

```typescript
import { strapiClient } from '@/lib/strapi/client'
```

### Available Methods

#### Blog Posts

**Get All Blog Posts (with pagination)**
```typescript
const response = await strapiClient.getBlogPosts({
  page: 1,
  pageSize: 12,
  category: 'Speaking Tips', // optional
  tag: 'November 2025', // optional
  search: 'PTE Academic', // optional
})

const posts = response.data
const meta = response.meta // pagination info
```

**Get Blog Post by Slug**
```typescript
const post = await strapiClient.getBlogPostBySlug('how-to-ace-pte-speaking')

if (!post) {
  notFound()
}
```

**Get Featured Blog Posts**
```typescript
const featured = await strapiClient.getFeaturedBlogPosts(3)
```

**Get Categories**
```typescript
const categories = await strapiClient.getCategories()
// Returns: ['Speaking Tips', 'Writing Guides', 'Reading Strategies', ...]
```

**Get Tags**
```typescript
const tags = await strapiClient.getTags()
// Returns: ['November 2025', 'Beginner', 'Advanced', ...]
```

#### Courses

**Get All Courses**
```typescript
const response = await strapiClient.getCourses({
  page: 1,
  pageSize: 10,
  level: 'intermediate', // optional: 'beginner', 'intermediate', 'advanced'
  isPremium: false, // optional: filter free vs premium
})
```

**Get Course by Slug**
```typescript
const course = await strapiClient.getCourseBySlug('pte-speaking-masterclass')
```

**Get Featured Courses**
```typescript
const featured = await strapiClient.getFeaturedCourses(3)
```

#### Utility Methods

**Get Full Image URL**
```typescript
const imageUrl = strapiClient.getImageURL(post.coverImage)
// Converts relative URLs to absolute: /uploads/image.jpg → https://strapi.../uploads/image.jpg
```

**Format Date**
```typescript
const formattedDate = strapiClient.formatDate(post.publishedAt)
// Returns: "January 15, 2025"
```

**Calculate Reading Time**
```typescript
const readingTime = strapiClient.calculateReadingTime(post.content)
// Returns: 5 (minutes)
```

---

## Example Implementations

### Example 1: Blog Listing Page

```typescript
// app/blog/page.tsx
import { strapiClient } from '@/lib/strapi/client'

export default async function BlogPage() {
  const response = await strapiClient.getBlogPosts({ pageSize: 12 })
  const posts = response.data || []

  return (
    <div>
      <h1>Blog</h1>
      <div className="grid grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <a href={`/blog/${post.slug}`}>Read More</a>
          </article>
        ))}
      </div>
    </div>
  )
}
```

### Example 2: Blog Detail Page with SEO

```typescript
// app/blog/[slug]/page.tsx
import { strapiClient } from '@/lib/strapi/client'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await strapiClient.getBlogPostBySlug(slug)

  if (!post) return { title: 'Post Not Found' }

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    keywords: post.seo?.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.coverImage ? [strapiClient.getImageURL(post.coverImage)] : [],
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await strapiClient.getBlogPostBySlug(slug)

  if (!post) notFound()

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

### Example 3: Dashboard Widget with Featured Posts

```typescript
// components/dashboard/featured-blog-widget.tsx
import { strapiClient } from '@/lib/strapi/client'
import Link from 'next/link'

export async function FeaturedBlogWidget() {
  const featured = await strapiClient.getFeaturedBlogPosts(3)

  return (
    <section>
      <h2>Latest Study Tips</h2>
      <ul>
        {featured.map((post) => (
          <li key={post.id}>
            <Link href={`/blog/${post.slug}`}>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

### Example 4: Category Filter

```typescript
// app/blog/category/[category]/page.tsx
import { strapiClient } from '@/lib/strapi/client'

interface PageProps {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const response = await strapiClient.getBlogPosts({
    category: decodeURIComponent(category),
    pageSize: 20,
  })

  return (
    <div>
      <h1>{category} Articles</h1>
      {response.data.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  )
}
```

---

## Strapi API Endpoints

Your Strapi instance auto-generates these REST endpoints:

### Blog Posts

```bash
# List all blog posts
GET https://strapi-production-1ee4.up.railway.app/api/blog-posts

# Get specific post
GET https://strapi-production-1ee4.up.railway.app/api/blog-posts/1

# Filter by slug
GET https://strapi-production-1ee4.up.railway.app/api/blog-posts?filters[slug][$eq]=your-post-slug

# Filter by category
GET https://strapi-production-1ee4.up.railway.app/api/blog-posts?filters[category][$eq]=Speaking

# Pagination
GET https://strapi-production-1ee4.up.railway.app/api/blog-posts?pagination[page]=1&pagination[pageSize]=10

# Populate relations
GET https://strapi-production-1ee4.up.railway.app/api/blog-posts?populate=*
```

### Courses

```bash
# List courses
GET https://strapi-production-1ee4.up.railway.app/api/courses

# Filter by level
GET https://strapi-production-1ee4.up.railway.app/api/courses?filters[level][$eq]=intermediate

# Filter by isPremium
GET https://strapi-production-1ee4.up.railway.app/api/courses?filters[isPremium][$eq]=false
```

---

## Creating Content in Strapi Admin

### Access Admin Panel

1. Navigate to: `https://strapi-production-1ee4.up.railway.app/admin`
2. Login with your admin credentials

### Create a Blog Post

1. Click **Content Manager** → **Blog Post**
2. Click **Create new entry**
3. Fill in:
   - **Title**: Post title
   - **Slug**: URL-friendly slug (auto-generated from title)
   - **Excerpt**: Short description (shown in listings)
   - **Content**: Full article (rich text editor)
   - **Category**: Choose category (e.g., "Speaking Tips")
   - **Tags**: Add tags (e.g., "November 2025", "Beginner")
   - **Cover Image**: Upload image
   - **Featured**: Check if this should appear in featured sections
   - **SEO**: Meta title, description, keywords
4. Click **Save**
5. Click **Publish** to make available via API

### Bulk Operations

**Import Blog Posts:**
1. Navigate to **Plugins** → **Import/Export**
2. Click **Import**
3. Upload JSON file
4. Map fields
5. Click **Import**

**Export Blog Posts:**
1. Navigate to **Content Manager** → **Blog Post**
2. Select posts (checkboxes)
3. Click **Export**
4. Choose format (JSON or CSV)
5. Download

---

## Performance & Caching

### Next.js Caching

The Strapi client uses Next.js 15 fetch caching:

```typescript
fetch(url, {
  next: { revalidate: 60 }, // Cache for 60 seconds
})
```

### Adjust Cache Duration

Edit [lib/strapi/client.ts](../lib/strapi/client.ts):

```typescript
// Cache for 5 minutes
next: { revalidate: 300 }

// Cache for 1 hour
next: { revalidate: 3600 }

// No cache (always fresh)
cache: 'no-store'
```

### Strapi-Side Caching

Enable in Strapi (see [STRAPI_SETUP_GUIDE.md](./STRAPI_SETUP_GUIDE.md)):

```javascript
// strapi/config/middlewares.js
{
  name: 'strapi::cache',
  config: {
    type: 'mem',
    max: 100,
    maxAge: 3600000, // 1 hour
  }
}
```

---

## TypeScript Types

### BlogPost Interface

```typescript
export interface BlogPost {
  id: number
  documentId: string
  title: string
  slug: string
  excerpt?: string
  content: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  author?: {
    name: string
    avatar?: StrapiImage
  }
  coverImage?: StrapiImage
  category?: string
  tags?: string[]
  readingTime?: number
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
}
```

### Course Interface

```typescript
export interface Course {
  id: number
  documentId: string
  title: string
  slug: string
  description: string
  content: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  lessonsCount?: number
  enrolled?: number
  rating?: number
  price?: number
  isPremium: boolean
  coverImage?: StrapiImage
  instructor?: {
    name: string
    bio?: string
    avatar?: StrapiImage
  }
  lessons?: Array<{
    id: number
    title: string
    duration?: number
    order: number
  }>
}
```

---

## Troubleshooting

### Error: "Strapi API error: 403 Forbidden"

**Cause**: Permissions not configured correctly

**Fix**:
1. Login to Strapi admin
2. Navigate to **Settings** → **Roles** → **Public**
3. Enable `find` and `findOne` for blog-posts and courses
4. Click **Save**

### Error: "Cannot find module '@/lib/strapi/client'"

**Cause**: Import path incorrect

**Fix**: Ensure you're using the correct path:
```typescript
import { strapiClient } from '@/lib/strapi/client'
```

### Blog Posts Not Showing

**Checklist**:
1. ✅ Posts are **Published** (not draft)
2. ✅ Public permissions enabled in Strapi
3. ✅ `STRAPI_API_URL` in `.env.local` is correct
4. ✅ Strapi instance is running on Railway
5. ✅ Network can reach Strapi URL

**Test API directly:**
```bash
curl https://strapi-production-1ee4.up.railway.app/api/blog-posts?populate=*
```

### Images Not Loading

**Issue**: Relative URLs like `/uploads/image.jpg`

**Fix**: Use the utility function:
```typescript
const imageUrl = strapiClient.getImageURL(post.coverImage)
```

This converts relative URLs to absolute URLs automatically.

---

## Migration Guide: PostgreSQL to Strapi

If you want to migrate your question bank to Strapi:

### Step 1: Export Questions

```bash
pnpm tsx scripts/export-to-strapi-json.ts --section=all --include-tests
```

This generates:
- `strapi-export/speaking-questions.json` (80 questions)
- `strapi-export/reading-questions.json` (22 questions)
- `strapi-export/writing-questions.json` (31 questions)
- `strapi-export/listening-questions.json` (18 questions)
- `strapi-export/mock-tests.json` (if requested)

**Total: 151 questions exported**

### Step 2: Create Content Types in Strapi

Follow guide: [STRAPI_CONTENT_TYPES.md](./STRAPI_CONTENT_TYPES.md)

Create collections for:
1. Speaking Questions
2. Reading Questions
3. Writing Questions
4. Listening Questions
5. Mock Tests

### Step 3: Import to Strapi

1. Install plugin: `@strapi/plugin-import-export-entries`
2. Navigate to **Plugins** → **Import/Export**
3. Import each JSON file to its corresponding content type
4. Verify data

### Step 4: Update Next.js to Use Strapi

Replace direct DB queries with Strapi API calls:

**Before (PostgreSQL):**
```typescript
const questions = await db.select().from(speakingQuestions)
```

**After (Strapi):**
```typescript
const response = await strapiClient.getSpeakingQuestions()
const questions = response.data
```

---

## Roadmap

### Current Setup ✅
- Blog posts
- Courses
- Image management
- SEO metadata
- Client navigation integration

### Recommended Next Steps 🔄
1. **Add Featured Posts Widget** to dashboard
2. **Create Course Listing Page** at `/courses`
3. **Migrate Question Bank** to Strapi (optional)
4. **Set up Webhooks** for real-time updates
5. **Enable Draft Preview** for blog posts

### Advanced Features 💡
- **Multi-language support** (i18n plugin)
- **Version control** for content
- **Role-based content approval** workflow
- **AI content generation** integration
- **Analytics integration** (track popular posts)

---

## Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi REST API Reference](https://docs.strapi.io/dev-docs/api/rest)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Import/Export Plugin](https://github.com/Baboo7/strapi-plugin-import-export-entries)

---

## Support

**Strapi Community:**
- Forum: [forum.strapi.io](https://forum.strapi.io)
- Discord: [discord.strapi.io](https://discord.strapi.io)
- GitHub: [github.com/strapi/strapi](https://github.com/strapi/strapi)

**Your Strapi Instance:**
- URL: `https://strapi-production-1ee4.up.railway.app`
- Admin: Login required for content management
- API: Public read access enabled for blog posts and courses
