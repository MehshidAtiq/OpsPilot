# Security Notes

Phase 2 establishes the security shape before AI workflows are added.

- Authentication uses an httpOnly session cookie signed by the API.
- All tenant-owned rows include `company_id`; dependencies scope reads/writes to the
  current user's company.
- AI prompts are not persisted in Phase 2. Phase 3 audit logging should redact PII
  before storing prompt excerpts.
- Documents are stored in MinIO-compatible object storage or a local development
  folder. Database rows store only object keys and metadata.
- `audit_logs` is append-only by convention in the service layer. A later migration
  should add stricter database-level protections if needed.

