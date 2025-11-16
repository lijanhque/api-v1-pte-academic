# Strapi Setup Guide for PTE Admin System

Complete guide to set up Strapi as the admin CMS for the PTE Academic platform.

## Prerequisites

- ✅ Strapi instance deployed on Railway (you have this)
- ✅ Admin credentials configured
- ✅ Database connected
- ✅ Environment variables set

## Your Strapi Configuration

```env
ADMIN_JWT_SECRET="10eo4ps0h5ao5f5l5cb7wr6ojx9xiefb"
API_TOKEN_SALT="yuf3oitl28zu620cbgvpb4a4dgot1c4k"
APP_KEYS="rfmk9uryuyhlevk8iuy9bo3k8f9pako1"
JWT_SECRET="w4oygev6pvrtvu8txk0igb581indkeue"
TRANSFER_TOKEN_SALT="fhz381bnpl9dgp7qqsydgxg0a0i7hdqv"
```

---

## Part 1: Access Strapi Admin Panel

### 1. Access Your Strapi Instance

Your Strapi URL will be: `https://[your-railway-domain]/admin`

### 2. Create Admin Account (if first time)

- Email: [your-admin-email]
- Password: [create-strong-password]
- Name: [your-name]

### 3. Verify Access

- Login successful
- Dashboard visible
- Content-Type Builder accessible

---

## Part 2: Install Required Plugins

### Method 1: Via Strapi Admin UI (Recommended)

1. Navigate to **Marketplace** in left sidebar
2. Search for and install:
   - `@strapi/plugin-import-export-entries` ⭐
   - `@strapi/plugin-seo` (optional)

3. Restart Strapi after installation

### Method 2: Via Command Line (if you have SSH access)

```bash
# SSH into your Railway instance or run locally
cd /path/to/strapi

# Install import/export plugin
npm install @strapi/plugin-import-export-entries

# Install SEO plugin (optional)
npm install @strapi/plugin-seo

# Rebuild admin
npm run build

# Restart Strapi
npm run develop
```

### Verify Plugin Installation

After restart:
- Check **Plugins** section in admin panel
- "Import/Export" should appear in left sidebar
- Test by clicking "Import/Export" → should see import/export interface

---

## Part 3: Create Content Types

### Overview

We'll create 5 main collections:
1. **Speaking Questions** - 7 question types
2. **Reading Questions** - 5 question types
3. **Writing Questions** - 2 question types
4. **Listening Questions** - 8 question types
5. **Mock Tests** - Test management

Plus 1 supporting collection:
6. **Question Tags** - Shared tags

### Step-by-Step: Create Speaking Questions Collection

#### 3.1 Start Creating Collection

1. Click **Content-Type Builder** in left sidebar
2. Click **Create new collection type**
3. Display name: `Speaking Question`
4. API ID (singular): `speaking-question` (auto-filled)
5. Click **Continue**

#### 3.2 Add Fields

**Field 1: type (Enumeration)**
- Click **+ Add another field**
- Select **Enumeration**
- Name: `type`
- Values (add each on new line):
  ```
  read_aloud
  repeat_sentence
  describe_image
  retell_lecture
  answer_short_question
  summarize_group_discussion
  respond_to_a_situation
  ```
- Advanced settings:
  - Required: ✅ Yes
  - Default value: `read_aloud`
- Click **Finish**

**Field 2: title (Text - Long)**
- Click **+ Add another field**
- Select **Text**
- Name: `title`
- Type: **Long text**
- Advanced settings:
  - Required: ✅ Yes
- Click **Finish**

**Field 3: promptText (Rich Text)**
- Click **+ Add another field**
- Select **Rich Text**
- Name: `promptText`
- Advanced settings:
  - Required: ❌ No
- Click **Finish**

**Field 4: promptMediaUrl (Text - Short)**
- Click **+ Add another field**
- Select **Text**
- Name: `promptMediaUrl`
- Type: **Short text**
- Advanced settings:
  - Required: ❌ No
- Click **Finish**

**Field 5: difficulty (Enumeration)**
- Click **+ Add another field**
- Select **Enumeration**
- Name: `difficulty`
- Values:
  ```
  Easy
  Medium
  Hard
  ```
- Advanced settings:
  - Required: ✅ Yes
  - Default value: `Medium`
- Click **Finish**

**Field 6: tags (JSON)**
- Click **+ Add another field**
- Select **JSON**
- Name: `tags`
- Advanced settings:
  - Required: ❌ No
- Click **Finish**

**Field 7: isActive (Boolean)**
- Click **+ Add another field**
- Select **Boolean**
- Name: `isActive`
- Advanced settings:
  - Required: ✅ Yes
  - Default value: ✅ true
- Click **Finish**

**Field 8: questionNumber (Number)**
- Click **+ Add another field**
- Select **Number**
- Name: `questionNumber`
- Number format: **integer**
- Advanced settings:
  - Required: ❌ No
- Click **Finish**

**Field 9: metadata (JSON)**
- Click **+ Add another field**
- Select **JSON**
- Name: `metadata`
- Advanced settings:
  - Required: ❌ No
- Click **Finish**

#### 3.3 Save Collection

- Click **Save** in top right
- Wait for Strapi to rebuild
- Success! "Speaking Question" collection created

### Repeat for Other Collections

**For Reading Questions:**
- Follow same steps as above
- Collection name: `Reading Question`
- API ID: `reading-question`
- Add fields:
  - type (Enumeration): `multiple_choice_single`, `multiple_choice_multiple`, `reorder_paragraphs`, `fill_in_blanks`, `reading_writing_fill_blanks`
  - title (Text - Long)
  - promptText (Rich Text) - Required: ✅ Yes
  - options (JSON)
  - answerKey (JSON) - Required: ✅ Yes
  - difficulty (Enumeration)
  - tags (JSON)
  - isActive (Boolean)
  - questionNumber (Number)
  - metadata (JSON)

**For Writing Questions:**
- Collection name: `Writing Question`
- API ID: `writing-question`
- Add fields:
  - type (Enumeration): `summarize_written_text`, `write_essay`
  - title (Text - Long)
  - promptText (Rich Text) - Required: ✅ Yes
  - wordLimit (JSON)
  - difficulty (Enumeration)
  - tags (JSON)
  - isActive (Boolean)
  - questionNumber (Number)
  - sampleAnswer (Rich Text)
  - scoringCriteria (JSON)
  - metadata (JSON)

**For Listening Questions:**
- Collection name: `Listening Question`
- API ID: `listening-question`
- Add fields:
  - type (Enumeration): `summarize_spoken_text`, `multiple_choice_single`, `multiple_choice_multiple`, `fill_in_blanks`, `highlight_correct_summary`, `select_missing_word`, `highlight_incorrect_words`, `write_from_dictation`
  - title (Text - Long)
  - promptText (Rich Text)
  - promptMediaUrl (Text - Short) - Required: ✅ Yes
  - options (JSON)
  - correctAnswers (JSON) - Required: ✅ Yes
  - transcript (Rich Text)
  - difficulty (Enumeration)
  - tags (JSON)
  - isActive (Boolean)
  - questionNumber (Number)
  - metadata (JSON)

**For Mock Tests:**
- Collection name: `Mock Test`
- API ID: `mock-test`
- Add fields:
  - testNumber (Number - integer) - Required: ✅ Yes, Unique: ✅ Yes
  - title (Text - Short) - Required: ✅ Yes
  - description (Rich Text)
  - difficulty (Enumeration): `Easy`, `Medium`, `Hard`
  - isFree (Boolean) - Default: false
  - duration (Number - integer)
  - sectionCounts (JSON)
  - metadata (JSON)
  - isActive (Boolean) - Default: true

---

## Part 4: Configure Permissions & Roles

### 4.1 Public Role (for Next.js frontend)

1. Navigate to **Settings** → **Roles** → **Public**
2. Expand **Speaking-question**:
   - ✅ `find` (list all)
   - ✅ `findOne` (get by ID)
   - ❌ create, update, delete (no public access)
3. Repeat for:
   - Reading-question
   - Writing-question
   - Listening-question
   - Mock-test (only published tests)
4. Click **Save**

### 4.2 Authenticated Role (for admin users)

1. Navigate to **Settings** → **Roles** → **Authenticated**
2. For all content types:
   - ✅ `find`
   - ✅ `findOne`
   - ✅ `create`
   - ✅ `update`
   - ✅ `delete`
3. Click **Save**

### 4.3 Create Admin Users

1. Navigate to **Settings** → **Administration Panel** → **Users**
2. Click **Add new user**
3. Fill in:
   - First name, Last name
   - Email
   - Roles: Select **Super Admin** or **Editor**
4. Send invitation email or set password manually
5. Click **Save**

---

## Part 5: Import Questions from PostgreSQL

### 5.1 Generate Export Files

On your local machine (Next.js project):

```bash
# Export all questions
tsx scripts/export-to-strapi-json.ts --section=all

# Or export specific sections
tsx scripts/export-to-strapi-json.ts --section=speaking
tsx scripts/export-to-strapi-json.ts --section=reading

# Include mock tests
tsx scripts/export-to-strapi-json.ts --section=all --include-tests
```

This creates files in `strapi-export/` directory:
- `speaking-questions.json`
- `reading-questions.json`
- `writing-questions.json`
- `listening-questions.json`
- `mock-tests.json` (if `--include-tests`)

### 5.2 Import via Strapi Admin UI

#### Method A: Using Import/Export Plugin

1. Navigate to **Plugins** → **Import/Export**
2. Click **Import**
3. Select **Import data from file**
4. Choose file: `strapi-export/speaking-questions.json`
5. Select content type: `Speaking Question`
6. Map fields:
   - Auto-mapping should work (field names match)
   - Verify: type → type, title → title, etc.
7. Click **Import**
8. Wait for import to complete
9. Verify: Navigate to **Content Manager** → **Speaking Question**
10. Check imported data

Repeat for other sections:
- `reading-questions.json` → Reading Question
- `writing-questions.json` → Writing Question
- `listening-questions.json` → Listening Question

#### Method B: Using Strapi REST API (Bulk Import)

If you prefer programmatic import:

```typescript
// scripts/import-to-strapi.ts
import fs from 'fs'

const STRAPI_URL = 'https://your-railway-domain'
const API_TOKEN = 'your-api-token' // Generate in Strapi admin

async function importQuestions(section: string) {
  const filename = `strapi-export/${section}-questions.json`
  const data = JSON.parse(fs.readFileSync(filename, 'utf-8'))

  for (const question of data) {
    await fetch(`${STRAPI_URL}/api/${section}-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ data: question }),
    })
  }
}

// Run for all sections
await importQuestions('speaking')
await importQuestions('reading')
await importQuestions('writing')
await importQuestions('listening')
```

### 5.3 Verify Import

1. Navigate to **Content Manager**
2. Check each collection:
   - Speaking Question - should see all questions
   - Reading Question - should see all questions
   - Writing Question - should see all questions
   - Listening Question - should see all questions
3. Click on a few questions to verify data:
   - Title populated
   - Type correct
   - Difficulty set
   - Media URLs present (if applicable)

---

## Part 6: Test Strapi API

### 6.1 Test Public Endpoints

Open browser or Postman:

```bash
# List speaking questions
GET https://your-railway-domain/api/speaking-questions

# Get specific question
GET https://your-railway-domain/api/speaking-questions/1

# Filter by type
GET https://your-railway-domain/api/speaking-questions?filters[type][$eq]=read_aloud

# Filter by difficulty
GET https://your-railway-domain/api/speaking-questions?filters[difficulty][$eq]=Medium

# Pagination
GET https://your-railway-domain/api/speaking-questions?pagination[page]=1&pagination[pageSize]=20

# Search
GET https://your-railway-domain/api/speaking-questions?filters[title][$containsi]=climate
```

### 6.2 Test Response Format

Expected response:
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "type": "read_aloud",
        "title": "Question title here",
        "promptText": "Full text...",
        "difficulty": "Medium",
        "isActive": true,
        "createdAt": "2025-01-16T...",
        "updatedAt": "2025-01-16T...",
        "publishedAt": "2025-01-16T..."
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 10,
      "total": 250
    }
  }
}
```

---

## Part 7: Strapi Admin Workflow

### Creating a New Question

1. Navigate to **Content Manager** → **Speaking Question** (or other section)
2. Click **Create new entry**
3. Fill in fields:
   - Type: Select from dropdown
   - Title: Enter question text
   - Prompt Text: Enter full question (rich text)
   - Prompt Media URL: Paste audio/image URL
   - Difficulty: Easy/Medium/Hard
   - Is Active: ✅ (default)
4. Click **Save**
5. Click **Publish** to make available via API

### Editing an Existing Question

1. Navigate to **Content Manager** → [Section]
2. Click on question to edit
3. Modify fields as needed
4. Click **Save**
5. Changes available immediately in API

### Bulk Operations

#### Bulk Delete
1. Navigate to question list
2. Select multiple questions (checkboxes)
3. Click **Delete** from bulk actions
4. Confirm deletion

#### Bulk Publish/Unpublish
1. Select multiple questions
2. Click **Publish** or **Unpublish**
3. Questions immediately available/unavailable in API

#### Bulk Export
1. Select questions
2. Click **Export** (from Import/Export plugin)
3. Choose format: JSON or CSV
4. Download file

### Search and Filter

In any collection view:
- **Search bar**: Search by title or content
- **Filters**: Click filter icon
  - Filter by type
  - Filter by difficulty
  - Filter by active status
  - Filter by creation date

### Sorting

- Click column header to sort
- Click again to reverse sort
- Multi-column sorting available

---

## Part 8: Connect Next.js to Strapi

See separate guide: `STRAPI_NEXTJS_INTEGRATION.md`

Quick overview:
1. Update `.env.local` with Strapi URL and API token
2. Create Strapi API client functions
3. Replace PostgreSQL queries with Strapi API calls
4. Update `generateStaticParams()` to fetch from Strapi
5. Test all question pages

---

## Part 9: Maintenance & Best Practices

### Regular Backups

**Option 1: Strapi Database Backup**
- Your PostgreSQL database on Railway is backed up automatically
- Additional manual backups via Railway dashboard

**Option 2: Export Content**
- Monthly export of all questions via Import/Export plugin
- Store backups in S3 or Google Drive

### Content Version Control

- Strapi tracks `createdAt` and `updatedAt` automatically
- Consider installing `strapi-plugin-content-versioning` for full version history

### Performance Optimization

**Enable Caching:**
1. Navigate to **Settings** → **Configuration**
2. Enable response caching
3. Set cache TTL (Time To Live): 3600 seconds (1 hour)

**Database Indexing:**
- Strapi auto-creates indexes on relations
- For custom indexes, modify Strapi schema

### Security Best Practices

1. **API Tokens**:
   - Generate separate tokens for different services
   - Rotate tokens quarterly
   - Use read-only tokens for Next.js frontend

2. **Admin Access**:
   - Use strong passwords
   - Enable 2FA if available
   - Limit admin user count

3. **Rate Limiting**:
   - Configure in `config/middlewares.js`
   - Prevent API abuse

---

## Troubleshooting

### Import Fails

**Issue**: Import shows errors
**Solutions**:
- Check JSON format (valid JSON)
- Verify field names match content type
- Ensure required fields are present
- Check data types (e.g., boolean should be true/false, not "true"/"false")

### API Returns 403 Forbidden

**Issue**: Cannot access API endpoints
**Solutions**:
- Check permissions in **Settings** → **Roles** → **Public**
- Ensure content is **Published** (not draft)
- Verify API token if using authenticated requests

### Slow Performance

**Solutions**:
- Enable caching (see above)
- Optimize database (Railway PostgreSQL tuning)
- Use pagination on large result sets
- Add indexes on frequently queried fields

### Cannot Create Content Type

**Issue**: "Content type already exists" or similar
**Solutions**:
- Delete existing content type if empty
- Check for naming conflicts
- Restart Strapi after changes

---

## Next Steps

✅ **You're now ready to use Strapi as your admin CMS!**

**Recommended workflow:**
1. ✅ Set up all content types (Part 3)
2. ✅ Import existing questions (Part 5)
3. ⏳ Configure Next.js integration
4. ⏳ Train team on Strapi admin interface
5. ⏳ Set up regular backup routine

**Resources:**
- [Strapi Documentation](https://docs.strapi.io)
- [Strapi REST API Reference](https://docs.strapi.io/dev-docs/api/rest)
- [Import/Export Plugin Docs](https://github.com/Baboo7/strapi-plugin-import-export-entries)

**Support:**
- Strapi Community: [forum.strapi.io](https://forum.strapi.io)
- Discord: [discord.strapi.io](https://discord.strapi.io)
