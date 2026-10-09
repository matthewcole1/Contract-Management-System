# KCH Contract Management

Flask + SQLite backend prototype with a React + TypeScript frontend for tracking hospital contracts and master agreements by department.

## Current Status

Development prototype using fake data only.

Do not load real hospital contract data until hosting, authentication, security, backup, document-storage, and IT-review requirements are approved.

## Current Features

### Backend

- SQLite database created automatically on first run
- Contract list, search, and filter endpoints
- Single-contract lookup
- Contract creation
- Partial contract updates with PATCH
- Field-level audit history for contract updates
- Controlled contract-status and contract-type values
- Department validation
- Master Agreement lookup, creation, and updates
- Personnel and options endpoints
- Fake development seed data
- Duplicate contract and Master Agreement number protection

### Frontend

- React + TypeScript frontend built with Vite
- Dashboard statistics for:
  - Total contracts
  - Active contracts
  - Contracts starting within six weeks
- Combined table for Contracts and Master Agreements
- Search and filtering by:
  - Search term
  - Department
  - Contract status
  - Record type
- Contract detail modal
- Master Agreement detail modal
- Contract creation form
- Master Agreement creation form
- Contract editing
- Master Agreement editing
- Contract audit-history display
- Loading, error, and empty-result states
- Debounced contract search
- Toast notifications for create/update results

## Project Structure

```text
contract-management/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── constants.py
│   ├── db.py
│   ├── schema.py
│   ├── seed.py
│   ├── validators.py
│   ├── contracts.db
│   ├── requirements.txt
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── contracts.py
│   │   ├── departments.py
│   │   ├── master_agreements.py
│   │   ├── personnel.py
│   │   └── options.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_contracts.py
│   │   └── test_master_agreements.py
│   └── venv/
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── App.css
    │   ├── api.ts
    │   ├── types.ts
    │   ├── utils.ts
    │   └── components/
    │       ├── DashboardStats.tsx
    │       ├── ContractFilters.tsx
    │       ├── RecordsTable.tsx
    │       ├── CreateContractModal.tsx
    │       ├── CreateMasterAgreementModal.tsx
    │       ├── ContractDetailsModal.tsx
    │       └── MasterAgreementDetailsModal.tsx
    ├── package.json
    └── vite.config.ts
```

## Running Locally

This project has a Flask backend and a React + TypeScript frontend.

Run the backend and frontend in separate terminal windows.

### 1. Start the Backend

Open a terminal and run:

```bash
cd ~/ContractManagement/contract-management/backend
source venv/bin/activate
pip install -r requirements.txt
FLASK_DEBUG=1 SEED_DEV_DATA=1 python3 app.py
```

The Flask API should start at:

```text
http://127.0.0.1:5001
```

Keep this terminal running while using the app.

### 2. Start the Frontend

Open a second terminal and run:

```bash
cd ~/ContractManagement/contract-management/frontend
npm install
npm run dev
```

The React frontend should start at:

```text
http://localhost:5173
```

Open this address in your browser:

```text
http://localhost:5173
```

The frontend communicates with the Flask backend running on port `5001`.

## Running Backend Tests

Open a terminal and run:

```bash
cd ~/ContractManagement/contract-management/backend
source venv/bin/activate
pytest
```

## Running Frontend Checks

Open a terminal and run:

```bash
cd ~/ContractManagement/contract-management/frontend
npm run build
npm run lint
```

Both commands should complete without errors before committing major frontend changes.

## Development Data

The local prototype uses fake development data only.

Starting the backend with:

```bash
SEED_DEV_DATA=1
```

enables the development seed data.

Example:

```bash
FLASK_DEBUG=1 SEED_DEV_DATA=1 python3 app.py
```

Do not use real hospital contract data in this prototype.

## Backend Requirements

The backend dependencies are stored in:

```text
backend/requirements.txt
```

Current core requirements include:

```text
Flask
flask-cors
```

Additional packages may be added as the project evolves.

## Frontend Requirements

The frontend uses:

- React
- TypeScript
- Vite
- react-hot-toast

Frontend dependencies are managed through:

```text
frontend/package.json
```

Install them with:

```bash
npm install
```

## Local Development Workflow

A typical development session looks like this.

### Terminal 1 — Backend

```bash
cd ~/ContractManagement/contract-management/backend
source venv/bin/activate
FLASK_DEBUG=1 SEED_DEV_DATA=1 python3 app.py
```

### Terminal 2 — Frontend

```bash
cd ~/ContractManagement/contract-management/frontend
npm run dev
```

## Security Note

This prototype is not production-ready.

It should continue to use fake data only until the required hospital IT and security approvals are complete.

Before using real hospital contract data, the application will need approved production controls including:

- Authentication and hospital-approved SSO
- Role-based access control
- Server-side authorization
- Secure document storage and document links
- Audit logging
- Encryption
- Backup and recovery procedures
- Session timeout controls
- Approved hosting
- Approved database infrastructure
- Network and infrastructure controls
- Hospital IT/security review

Actual contract documents should remain in an approved document repository rather than being stored directly inside the prototype application.

## Technology Stack

### Backend

- Python
- Flask
- SQLite
- Flask-CORS
- Pytest

### Frontend

- React
- TypeScript
- Vite
- CSS
- react-hot-toast

## Project Purpose

The goal of this application is to provide a management system for hospital contracts while allowing users to search, filter, and view records by department.

The application is being designed around one centralized contract dataset rather than separate spreadsheets for individual departments.
