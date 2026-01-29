# Changelog

## [2.0.0] - 2026-01-29

### 🚨 Breaking Changes

#### Reference Endpoints - Simplified Response Structure

**Changed:** All reference endpoints now return direct arrays instead of wrapped objects.

**Before:**
```json
GET /api/v1/report-6406/references/branches
{
  "branches": [...]
}
```

**After:**
```json
GET /api/v1/report-6406/references/branches
[...]
```

**Affected endpoints:**
- `GET /api/v1/report-6406/references/branches`
- `GET /api/v1/report-6406/references/report-types`
- `GET /api/v1/report-6406/references/currencies`
- `GET /api/v1/report-6406/references/formats`
- `GET /api/v1/report-6406/references/sources`

---

#### DELETE Operations - Unified Endpoints

**Changed:** Multiple DELETE endpoints consolidated into single universal endpoints.

**Tasks:**

**Before:**
```
DELETE /api/v1/report-6406/tasks/:id
POST /api/v1/report-6406/tasks/bulk-delete
```

**After:**
```
DELETE /api/v1/report-6406/tasks
Body: { "taskIds": ["uuid1", "uuid2", ...] }
Response: 200 OK with detailed results
```

**Packages:**

**Before:**
```
DELETE /api/v1/report-6406/packages/:id
POST /api/v1/report-6406/packages/bulk-delete
```

**After:**
```
DELETE /api/v1/report-6406/packages
Body: { "packageIds": ["uuid1", "uuid2", ...] }
Response: 200 OK with detailed results
```

**Package Tasks:**

**Before:**
```
DELETE /api/v1/report-6406/packages/:packageId/tasks/:taskId
POST /api/v1/report-6406/packages/:packageId/tasks/bulk-remove
```

**After:**
```
DELETE /api/v1/report-6406/packages/:packageId/tasks
Body: { "taskIds": ["uuid1", "uuid2", ...] }
Response: 200 OK with detailed results
```

**New Response Format:**
```json
{
  "deleted": 5,
  "failed": 2,
  "results": [
    {
      "taskId": "uuid1",
      "success": true
    },
    {
      "taskId": "uuid2",
      "success": false,
      "reason": "Task not found"
    }
  ]
}
```

---

#### CANCEL Operations - Unified Endpoint

**Changed:** Multiple CANCEL endpoints consolidated into single universal endpoint.

**Before:**
```
POST /api/v1/report-6406/tasks/:id/cancel
POST /api/v1/report-6406/tasks/bulk-cancel
```

**After:**
```
POST /api/v1/report-6406/tasks/cancel
Body: { "taskIds": ["uuid1", "uuid2", ...] }
Response: 200 OK with detailed results
```

**New Response Format:**
```json
{
  "cancelled": 5,
  "failed": 2,
  "results": [
    {
      "taskId": "uuid1",
      "success": true,
      "status": "killed_dapp",
      "updatedAt": "2026-01-29T12:00:00Z"
    },
    {
      "taskId": "uuid2",
      "success": false,
      "reason": "Cannot cancel task in current status"
    }
  ]
}
```

---

#### Status History - Simplified Response

**Changed:** Status history endpoint now returns a simple array without pagination.

**Before:**
```json
GET /api/v1/report-6406/tasks/:id/status-history?page=0&limit=20
{
  "taskId": "uuid",
  "history": [...],
  "pagination": {...}
}
```

**After:**
```json
GET /api/v1/report-6406/tasks/:id/status-history
[
  {
    "id": "uuid",
    "status": "created",
    "previousStatus": null,
    "changedAt": "2026-01-29T12:00:00Z",
    "changedBy": "user@example.com",
    "comment": "Task created",
    "metadata": null
  },
  ...
]
```

**Rationale:** Status history is typically small (dozens of records), pagination is unnecessary.

---

### ✨ New Features

#### Enhanced Filtering for GET /tasks

Added comprehensive filtering capabilities:

```
GET /api/v1/report-6406/tasks?
  page=0&
  limit=20&
  sortBy=createdAt&
  sortOrder=DESC&
  statuses=created,started&
  branchIds=1,2,3&
  reportTypes=LSOZ,LSOS&
  formats=XLSX,PDF&
  periodStartFrom=2026-01-01&
  periodStartTo=2026-01-31&
  periodEndFrom=2026-01-01&
  periodEndTo=2026-01-31&
  createdAtFrom=2026-01-01T00:00:00Z&
  createdAtTo=2026-01-31T23:59:59Z&
  createdBy=user@example.com&
  search=search+term
```

**Supported filters:**
- `statuses` - Filter by task statuses (comma-separated)
- `branchIds` - Filter by branch IDs (comma-separated)
- `reportTypes` - Filter by report types (comma-separated)
- `formats` - Filter by file formats (comma-separated)
- `periodStartFrom`, `periodStartTo` - Filter by period start date range
- `periodEndFrom`, `periodEndTo` - Filter by period end date range
- `createdAtFrom`, `createdAtTo` - Filter by creation date range
- `createdBy` - Filter by creator username
- `search` - Search by branch name or task ID

---

#### Enhanced Export Schema

Added comprehensive export request schema with extended filters:

```json
POST /api/v1/report-6406/tasks/export
{
  "filters": {
    "statuses": ["created", "started"],
    "branchIds": [1, 2, 3],
    "reportTypes": ["LSOZ", "LSOS"],
    "formats": ["XLSX", "PDF"],
    "periodStartFrom": "2026-01-01",
    "periodStartTo": "2026-01-31",
    "periodEndFrom": "2026-01-01",
    "periodEndTo": "2026-01-31",
    "createdAtFrom": "2026-01-01T00:00:00Z",
    "createdAtTo": "2026-01-31T23:59:59Z"
  },
  "columns": ["id", "branchName", "status", "periodStart", "periodEnd"],
  "sortBy": "createdAt",
  "sortOrder": "DESC"
}
```

---

### 🔧 Improvements

#### OpenAPI 3.1.0 Upgrade

- Upgraded from OpenAPI 3.0.3 to OpenAPI 3.1.0
- Full compatibility with JSON Schema 2020-12
- Improved schema validation
- Better support for complex types
- API version bumped to 2.0.0

#### Better Response Structures

- All batch operations now return detailed results for each item
- Improved error messages with specific reasons
- Consistent response format across all endpoints

#### Enhanced Documentation

- Added glossary of terms (TFR, DAPP, FC) in OpenAPI spec
- Improved endpoint descriptions
- Added server configurations (dev, stage, prod)
- Better parameter documentation

#### Pagination Improvements

- All pagination parameters are now optional with sensible defaults
- `page`: default 0
- `limit`: default 20, max 100

---

### 📚 Migration Guide

#### For Frontend Developers

1. **Update Reference Endpoints**
   ```typescript
   // Before
   const { branches } = await api.getBranches();
   
   // After
   const branches = await api.getBranches();
   ```

2. **Update DELETE Operations**
   ```typescript
   // Before
   await api.deleteTask(taskId);
   // or
   await api.bulkDeleteTasks({ taskIds });
   
   // After
   await api.deleteTasks({ taskIds: [taskId] }); // Same for one or many
   ```

3. **Update CANCEL Operations**
   ```typescript
   // Before
   await api.cancelTask(taskId);
   // or
   await api.bulkCancelTasks({ taskIds });
   
   // After
   await api.cancelTasks({ taskIds: [taskId] }); // Same for one or many
   ```

4. **Update Status History**
   ```typescript
   // Before
   const { history } = await api.getTaskStatusHistory(taskId, { page: 0, limit: 20 });
   
   // After
   const history = await api.getTaskStatusHistory(taskId); // No pagination
   ```

5. **Use New Filters**
   ```typescript
   // New filtering options
   const tasks = await api.getTasks({
     page: 0,
     limit: 20,
     statuses: ['created', 'started'],
     branchIds: [1, 2, 3],
     search: 'search term',
     // ... many more filters available
   });
   ```

---

### 🎯 What Didn't Change

- `POST /api/v1/report-6406/tasks/start` - Remains as is
- `POST /api/v1/report-6406/packages/:packageId/copy-to-tfr` - Remains as is
- All GET endpoints for single resources - Remain unchanged
- Authentication and authorization - No changes

---

### 📊 API Version

- **Previous Version:** 1.0.0 (OpenAPI 3.0.3)
- **Current Version:** 2.0.0 (OpenAPI 3.1.0)

---

### 🔗 Resources

- [OpenAPI 3.1.0 Specification](https://spec.openapis.org/oas/v3.1.0)
- [API Documentation](http://localhost:3000/docs)
- [Task Details](./docs/tasks/TASK-007-refactor-api-structure.md)

---

### ⚠️ Important Notes

1. **Breaking changes** require coordination with frontend team
2. **All batch operations** now use consistent response format
3. **Pagination** is now optional for all list endpoints
4. **Status history** no longer supports pagination (returns all records)
5. **Reference endpoints** return direct arrays for simpler consumption

---

### 🐛 Bug Fixes

- Fixed inconsistent response formats across batch operations
- Improved error handling for partial failures
- Better validation error messages

---

### 📝 Documentation Updates

- Added comprehensive API documentation with examples
- Created migration guide for frontend developers
- Added glossary of domain-specific terms
- Improved Swagger UI with better descriptions

---

For detailed information about each change, see [TASK-007-refactor-api-structure.md](./docs/tasks/TASK-007-refactor-api-structure.md)
