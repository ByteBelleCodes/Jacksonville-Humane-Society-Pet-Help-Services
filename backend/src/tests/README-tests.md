This folder contains suggested verification commands and test skeletons.

Quick manual checks (curl)

1) Run migrations / seed admin
   cd backend
   npm install
   npm run migrate

2) Health
   curl http://localhost:4000/api/health

3) Preview upload (replace sample.csv with a path)
   curl -F "files=@sample.csv" http://localhost:4000/api/ingest/preview

4) Commit (example; use actual JSON from preview)
   curl -H "Content-Type: application/json" -d '{"records":[{"case_id":"abc","contact_name":"John","phone_number":"555-1234","pet_species":"Dog"}]}' http://localhost:4000/api/ingest/commit

5) Search
   curl "http://localhost:4000/api/cases/search?q=John"

6) Soft delete / recover
   curl -X DELETE http://localhost:4000/api/cases/<caseId>
   curl -X POST http://localhost:4000/api/cases/<caseId>/recover

Unit tests (optional)
- You can add a small Jest or Mocha suite to call endpoints and assert DB state. For the contest, include at least two verification artifacts:
  - A successful ingest+commit run saved to commit-log.txt
  - A screenshot showing search results and recover flow