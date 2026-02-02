Server skeleton for InfraGen deploy orchestration

Run locally (example):

1. cd server
2. npm install
3. npm start

Endpoints:
- POST /deploy/request  -> accepts JSON payload and returns { requestId }
- POST /bicep/validate -> accepts { bicep: string } and returns validation result
- GET /deploy/status/:id -> returns current status
