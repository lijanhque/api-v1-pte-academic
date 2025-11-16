# Strapi Content Type Schemas for PTE Platform

This document defines the Strapi content types needed for the PTE Academic question bank and mock test system.

## Overview

We will create the following collections in Strapi:
1. Speaking Questions
2. Reading Questions
3. Writing Questions
4. Listening Questions
5. Mock Tests
6. Question Tags (shared)

---

## 1. Speaking Questions Collection

**Collection Name**: `speaking-question`
**API ID**: `speaking-question`

### Fields

| Field Name | Type | Required | Options/Notes |
|------------|------|----------|---------------|
| type | Enumeration | Yes | Values: `read_aloud`, `repeat_sentence`, `describe_image`, `retell_lecture`, `answer_short_question`, `summarize_group_discussion`, `respond_to_a_situation` |
| title | Text (Long) | Yes | Question title/prompt |
| promptText | Rich Text | No | Text content for the question |
| promptMediaUrl | Text (Short) | No | URL to audio/image file |
| difficulty | Enumeration | Yes | Values: `Easy`, `Medium`, `Hard` |
| tags | Relation (many-to-many) | No | Link to `question-tag` |
| isActive | Boolean | Yes | Default: true |
| questionNumber | Number (Integer) | No | For ordering/reference |
| metadata | JSON | No | Additional data (e.g., timing, scoring hints) |
| createdBy | Relation (User) | Auto | Strapi user who created |
| updatedBy | Relation (User) | Auto | Last updated by |

### Indexes
- `type` (for filtering)
- `difficulty` (for filtering)
- `isActive` (for filtering)

---

## 2. Reading Questions Collection

**Collection Name**: `reading-question`
**API ID**: `reading-question`

### Fields

| Field Name | Type | Required | Options/Notes |
|------------|------|----------|---------------|
| type | Enumeration | Yes | Values: `multiple_choice_single`, `multiple_choice_multiple`, `reorder_paragraphs`, `fill_in_blanks`, `reading_writing_fill_blanks` |
| title | Text (Long) | Yes | Question title |
| promptText | Rich Text | Yes | The reading passage |
| options | JSON | No | Array of options for MCQ/fill-in-blanks |
| answerKey | JSON | Yes | Correct answer(s) |
| difficulty | Enumeration | Yes | Values: `Easy`, `Medium`, `Hard` |
| tags | Relation (many-to-many) | No | Link to `question-tag` |
| isActive | Boolean | Yes | Default: true |
| questionNumber | Number (Integer) | No | For ordering/reference |
| metadata | JSON | No | Additional data |

### Example JSON Structures

**Options** (Multiple Choice):
```json
[
  {"id": "A", "text": "Option A text"},
  {"id": "B", "text": "Option B text"},
  {"id": "C", "text": "Option C text"},
  {"id": "D", "text": "Option D text"}
]
```

**Answer Key** (Single):
```json
{"correctAnswer": "B"}
```

**Answer Key** (Multiple):
```json
{"correctAnswers": ["B", "D"]}
```

---

## 3. Writing Questions Collection

**Collection Name**: `writing-question`
**API ID**: `writing-question`

### Fields

| Field Name | Type | Required | Options/Notes |
|------------|------|----------|---------------|
| type | Enumeration | Yes | Values: `summarize_written_text`, `write_essay` |
| title | Text (Long) | Yes | Question title |
| promptText | Rich Text | Yes | The writing prompt/passage |
| wordLimit | JSON | No | `{"min": 50, "max": 70}` for SWT, `{"min": 200, "max": 300}` for essay |
| difficulty | Enumeration | Yes | Values: `Easy`, `Medium`, `Hard` |
| tags | Relation (many-to-many) | No | Link to `question-tag` |
| isActive | Boolean | Yes | Default: true |
| questionNumber | Number (Integer) | No | For ordering/reference |
| sampleAnswer | Rich Text | No | High-scoring sample answer |
| scoringCriteria | JSON | No | Criteria for scoring (grammar, coherence, etc.) |
| metadata | JSON | No | Additional data |

---

## 4. Listening Questions Collection

**Collection Name**: `listening-question`
**API ID**: `listening-question`

### Fields

| Field Name | Type | Required | Options/Notes |
|------------|------|----------|---------------|
| type | Enumeration | Yes | Values: `summarize_spoken_text`, `multiple_choice_single`, `multiple_choice_multiple`, `fill_in_blanks`, `highlight_correct_summary`, `select_missing_word`, `highlight_incorrect_words`, `write_from_dictation` |
| title | Text (Long) | Yes | Question title |
| promptText | Rich Text | No | Instructions or context |
| promptMediaUrl | Text (Short) | Yes | URL to audio file |
| options | JSON | No | Options for MCQ types |
| correctAnswers | JSON | Yes | Correct answer(s) |
| transcript | Rich Text | No | Audio transcript (for reference) |
| difficulty | Enumeration | Yes | Values: `Easy`, `Medium`, `Hard` |
| tags | Relation (many-to-many) | No | Link to `question-tag` |
| isActive | Boolean | Yes | Default: true |
| questionNumber | Number (Integer) | No | For ordering/reference |
| metadata | JSON | No | Additional data (audio duration, etc.) |

---

## 5. Mock Tests Collection

**Collection Name**: `mock-test`
**API ID**: `mock-test`

### Fields

| Field Name | Type | Required | Options/Notes |
|------------|------|----------|---------------|
| testNumber | Number (Integer) | Yes | Unique test number (1-200) |
| title | Text (Short) | Yes | e.g., "PTE Mock Test #1" |
| description | Rich Text | No | Test overview |
| difficulty | Enumeration | Yes | Values: `Easy`, `Medium`, `Hard` |
| isFree | Boolean | Yes | Default: false (Test #1 is free) |
| duration | Number (Integer) | No | Total test duration in minutes (e.g., 120) |
| speakingQuestions | Relation (many-to-many) | No | Link to `speaking-question` |
| readingQuestions | Relation (many-to-many) | No | Link to `reading-question` |
| writingQuestions | Relation (many-to-many) | No | Link to `writing-question` |
| listeningQuestions | Relation (many-to-many) | No | Link to `listening-question` |
| sectionCounts | JSON | No | Question count per section |
| metadata | JSON | No | Additional test configuration |
| isActive | Boolean | Yes | Default: true |
| publishedAt | DateTime | Auto | When test is published |

### Example sectionCounts JSON:
```json
{
  "speaking": 7,
  "writing": 2,
  "reading": 20,
  "listening": 23,
  "total": 52
}
```

---

## 6. Question Tags Collection

**Collection Name**: `question-tag`
**API ID**: `question-tag`

### Fields

| Field Name | Type | Required | Options/Notes |
|------------|------|----------|---------------|
| name | Text (Short) | Yes | Tag name (e.g., "November 2025", "Healthcare", "Technology") |
| slug | UID | Yes | Auto-generated from name |
| description | Text (Long) | No | Tag description |
| color | Text (Short) | No | Hex color for UI display |

---

## Strapi Configuration

### 1. Create Content Types in Strapi Admin

Navigate to: **Content-Type Builder** → **Create new collection type**

For each collection above:
1. Set collection name and API ID
2. Add all fields with specified types
3. Configure advanced settings (required, default values)
4. Add indexes for performance
5. Save and restart Strapi

### 2. Set Up Permissions

**Public Role** (for Next.js frontend):
- `find` and `findOne` on all question collections
- `find` and `findOne` on mock-test (only published)
- No create/update/delete access

**Authenticated Role** (for admin users):
- Full CRUD on all collections
- Bulk operations enabled

### 3. Install Plugins

Required plugins:
```bash
npm install @strapi/plugin-import-export-entries
npm install @strapi/plugin-seo
```

Optional plugins:
```bash
npm install strapi-plugin-populate-deep  # For deep population of relations
npm install strapi-plugin-multi-tenant  # If using organizations
```

---

## Import/Export Format

### Export Format (JSON)

Each question collection will export as:

```json
[
  {
    "type": "read_aloud",
    "title": "Question title here",
    "promptText": "Full text of the question...",
    "promptMediaUrl": "https://example.com/audio.mp3",
    "difficulty": "Medium",
    "tags": ["November 2025", "Academic"],
    "isActive": true,
    "questionNumber": 1,
    "metadata": {}
  }
]
```

### CSV Format

For bulk editing:
- Column headers match field names
- JSON fields exported as stringified JSON
- Relations exported as comma-separated IDs or slugs

---

## Migration Strategy

### Step 1: Export from PostgreSQL
Run export script: `tsx scripts/export-to-strapi-json.ts`

### Step 2: Create Content Types in Strapi
Follow schema definitions above

### Step 3: Import Data
Use Strapi import plugin or API to bulk import

### Step 4: Verify Data
- Check question counts
- Verify relations (tags, mock tests)
- Test API responses

### Step 5: Update Next.js
Switch from PostgreSQL queries to Strapi API calls

---

## API Endpoints (Auto-Generated by Strapi)

Once content types are created, Strapi auto-generates these REST endpoints:

### Speaking Questions
- `GET /api/speaking-questions` - List all
- `GET /api/speaking-questions/:id` - Get one
- `GET /api/speaking-questions?filters[type][$eq]=read_aloud` - Filter by type
- `GET /api/speaking-questions?filters[difficulty][$eq]=Medium` - Filter by difficulty
- `POST /api/speaking-questions` - Create (admin only)
- `PUT /api/speaking-questions/:id` - Update (admin only)
- `DELETE /api/speaking-questions/:id` - Delete (admin only)

Similar endpoints for reading, writing, listening questions.

### Mock Tests
- `GET /api/mock-tests` - List all
- `GET /api/mock-tests/:id?populate=*` - Get with all questions
- `GET /api/mock-tests?filters[isFree][$eq]=true` - Get free tests

---

## Performance Considerations

### Caching
Enable Strapi caching:
```javascript
// config/middlewares.js
{
  name: 'strapi::cache',
  config: {
    type: 'mem',
    max: 100,
    maxAge: 3600000, // 1 hour
  }
}
```

### Pagination
Default pagination: 25 items per page
Adjust in Strapi settings if needed

### Population
Use `populate` parameter to include relations:
```
GET /api/mock-tests/:id?populate[speakingQuestions][fields][0]=title
```

---

## Next Steps

1. ✅ Review this schema document
2. ⏳ Create content types in Strapi admin
3. ⏳ Install import/export plugin
4. ⏳ Run export script from PostgreSQL
5. ⏳ Import data to Strapi
6. ⏳ Test API endpoints
7. ⏳ Update Next.js integration

---

## References

- [Strapi Content-Type Builder](https://docs.strapi.io/dev-docs/backend-customization/models)
- [Strapi REST API](https://docs.strapi.io/dev-docs/api/rest)
- [Import/Export Plugin](https://github.com/Baboo7/strapi-plugin-import-export-entries)
