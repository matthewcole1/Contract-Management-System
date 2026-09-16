## KCH Contract Management API

Flask + SQLite backend prototype for tracking hospital contracts by department.

Current status: Development prototype using fake data only. Do not load real
hospital contract data until the hosting, authentication, security, backup, and
IT-review requirements are approved.

Current features

SQLite database created automatically on first run

Contract list/search/filter endpoint

Single-contract lookup

Contract creation

Partial contract updates with PATCH

Field-level audit rows for updates

Controlled contract-status, legal-status, and contract-type values

Fake development seed data

Project structure

contract-management-flask/
└── backend/
    
    ├── app.py
    
    ├── contracts.db          # created automatically
    
    ├── requirements.txt
    
    └── venv/

A React frontend will be added later.

Running locally

cd backend
source venv/bin/activate
pip install -r requirements.txt
python app.py

Then open:

http://127.0.0.1:5000/api/health

Requirements

Current requirements.txt:

Flask
flask-cors
