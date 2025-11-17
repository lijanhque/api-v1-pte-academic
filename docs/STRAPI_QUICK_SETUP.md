# Strapi Quick Setup Guide - Content Types

**IMPORTANT**: You need to create these content types in your Strapi admin panel.

## Access Your Strapi Admin

**URL**: https://strapi-production-1ee4.up.railway.app/admin

---

## Priority 1: Blog Post Content Type (REQUIRED FOR BLOG)

This is needed for your blog to work properly.

### Step 1: Create Blog Post Collection

1. Login to Strapi admin: https://strapi-production-1ee4.up.railway.app/admin
2. Click **Content-Type Builder** (left sidebar)
3. Click **Create new collection type**
4. Name: `Blog Post`
5. Click **Continue**

### Step 2: Add Fields to Blog Post

Add these fields one by one:

#### 1. Title (Text)
- Field name: `title`
- Type: **Text**
- Short text
- ✅ Required

#### 2. Slug (UID)
- Field name: `slug`
- Type: **UID**
- Attached field: `title`
- ✅ Required

#### 3. Excerpt (Text)
- Field name: `excerpt`
- Type: **Text**
- Long text
- ❌ Not required

#### 4. Content (Rich Text)
- Field name: `content`
- Type: **Rich Text (Markdown)**
- ✅ Required

#### 5. Category (Text)
- Field name: `category`
- Type: **Text**
- Short text
- ❌ Not required

#### 6. Tags (JSON)
- Field name: `tags`
- Type: **JSON**
- ❌ Not required

#### 7. Cover Image (Media)
- Field name: `coverImage`
- Type: **Media**
- Single media
- ❌ Not required

#### 8. Featured (Boolean)
- Field name: `featured`
- Type: **Boolean**
- Default: `false`
- ❌ Not required

#### 9. Reading Time (Number)
- Field name: `readingTime`
- Type: **Number**
- Number format: **integer**
- ❌ Not required

#### 10. Author (Component - Create New)
- Field name: `author`
- Type: **Component**
- Create new component: `shared.author`
  - Fields in component:
    - `name` (Text, Short, Required)
    - `avatar` (Media, Single, Not required)
- ❌ Not required

#### 11. SEO (Component - Create New)
- Field name: `seo`
- Type: **Component**
- Create new component: `shared.seo`
  - Fields in component:
    - `metaTitle` (Text, Short, Not required)
    - `metaDescription` (Text, Long, Not required)
    - `keywords` (Text, Short, Not required)
- ❌ Not required

### Step 3: Save and Enable Permissions

1. Click **Save** (top right)
2. Wait for server to restart
3. Go to **Settings** → **Roles** → **Public**
4. Scroll to **Blog-post**
5. Enable:
   - ✅ `find`
   - ✅ `findOne`
6. Click **Save**

### Step 4: Create Your First Blog Post

1. Go to **Content Manager** → **Blog Post**
2. Click **Create new entry**
3. Fill in:
   - **Title**: "Welcome to PTE Academic Blog"
   - **Slug**: (auto-generated)
   - **Excerpt**: "Learn expert tips and strategies for PTE Academic success"
   - **Content**: Write your blog content
   - **Category**: "Study Tips"
   - **Featured**: ✅ Check this
4. Click **Save**
5. Click **Publish**

### Step 5: Test Your Blog

Visit: http://localhost:3000/blog

You should see your blog post!

---

## Priority 2: Question Collections (OPTIONAL)

If you want to migrate your question bank to Strapi, create these collections:

### Speaking Questions

**Collection Name**: `speaking-question`

Fields:
1. `type` - Enumeration (Required)
   - Values: `read_aloud`, `repeat_sentence`, `describe_image`, `retell_lecture`, `answer_short_question`, `summarize_group_discussion`, `respond_to_a_situation`
2. `title` - Text Long (Required)
3. `promptText` - Rich Text
4. `promptMediaUrl` - Text Short (audio/image URL)
5. `difficulty` - Enumeration (Required)
   - Values: `Easy`, `Medium`, `Hard`
6. `tags` - JSON
7. `isActive` - Boolean (Default: true)
8. `metadata` - JSON

### Reading Questions

**Collection Name**: `reading-question`

Fields:
1. `type` - Enumeration (Required)
   - Values: `multiple_choice_single`, `multiple_choice_multiple`, `reorder_paragraphs`, `fill_in_blanks`, `reading_writing_fill_blanks`
2. `title` - Text Long (Required)
3. `promptText` - Rich Text (Required)
4. `options` - JSON
5. `answerKey` - JSON (Required)
6. `difficulty` - Enumeration (Required)
7. `tags` - JSON
8. `isActive` - Boolean
9. `metadata` - JSON

### Writing Questions

**Collection Name**: `writing-question`

Fields:
1. `type` - Enumeration (Required)
   - Values: `summarize_written_text`, `write_essay`
2. `title` - Text Long (Required)
3. `promptText` - Rich Text (Required)
4. `wordLimit` - JSON
5. `sampleAnswer` - Rich Text
6. `difficulty` - Enumeration (Required)
7. `tags` - JSON
8. `isActive` - Boolean
9. `metadata` - JSON

### Listening Questions

**Collection Name**: `listening-question`

Fields:
1. `type` - Enumeration (Required)
   - Values: `summarize_spoken_text`, `multiple_choice_single`, `multiple_choice_multiple`, `fill_in_blanks`, `highlight_correct_summary`, `select_missing_word`, `highlight_incorrect_words`, `write_from_dictation`
2. `title` - Text Long (Required)
3. `audioUrl` - Text Short (Required)
4. `transcript` - Rich Text
5. `promptText` - Rich Text
6. `options` - JSON
7. `answerKey` - JSON
8. `difficulty` - Enumeration (Required)
9. `tags` - JSON
10. `isActive` - Boolean
11. `metadata` - JSON

---

## After Creating Content Types

### Import Your Questions

1. Install plugin: `@strapi/plugin-import-export-entries`
2. Restart Strapi
3. Go to **Plugins** → **Import/Export**
4. Click **Import**
5. Upload files from `strapi-export/`:
   - `speaking-questions.json` → speaking-question
   - `reading-questions.json` → reading-question
   - `writing-questions.json` → writing-question
   - `listening-questions.json` → listening-question
6. Map fields (should auto-map)
7. Click **Import**

### Enable API Access

For each content type:
1. Go to **Settings** → **Roles** → **Public**
2. Enable `find` and `findOne` permissions
3. Click **Save**

---

## Quick Video Guide

If you need visual help, search YouTube for:
- "Strapi create content type tutorial"
- "Strapi content type builder"

Or check official docs:
https://docs.strapi.io/dev-docs/backend-customization/models

---

## Troubleshooting

**Can't access admin?**
- Make sure JavaScript is enabled in your browser
- Try clearing browser cache
- Use Chrome or Firefox

**Server restart taking too long?**
- This is normal on Railway free tier
- Wait 2-3 minutes after clicking Save

**Import plugin not showing?**
- You need to install it via Strapi admin or Railway console
- See: [STRAPI_SETUP_GUIDE.md](./STRAPI_SETUP_GUIDE.md) for detailed plugin installation

---

## What's Next?

After setting up Blog Post content type:
1. ✅ Create a few blog posts in Strapi
2. ✅ Visit http://localhost:3000/blog to see them
3. ✅ Blog navigation is already in your sidebar
4. ✅ Your Next.js app will automatically fetch from Strapi

Your exported questions are ready in `strapi-export/` whenever you want to import them!
