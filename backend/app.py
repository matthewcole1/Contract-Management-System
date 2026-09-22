"""
Kings County Hospital Contract Management API

Current prototype:
- Flask REST API
- SQLite database
- Search/filter contracts
- Create contracts
- Partial updates with PATCH
- Field-level audit logging on updates
- Fake development seed data

Important: this is still a development prototype. Authentication, production CORS
restrictions, stronger validation, safer dev seeding, and deployment hardening
should be added before any real hospital contract data is used.
"""

# Flask: creates the web application
from flask import Flask

from db import init_db

# CORS lets a browser frontend running on another origin/port call this API.
# NOTE: CORS(app) is intentionally broad for development and should be restricted
# before production use.
from flask_cors import CORS

from seed import (
    seed_departments,
    seed_data,
)

from routes.contracts import contracts_bp

from routes.departments import departments_bp

from routes.master_agreements import master_agreements_bp

from routes.personnel import personnel_bp

from routes.options import options_bp

from config import (
    SECRET_KEY,
    FRONTEND_ORIGIN,
    DEBUG_MODE,
    SEED_DEV_DATA,
)

# ---------------------------------------------------------------------------
# APPLICATION CONFIGURATION
# ---------------------------------------------------------------------------

# Create the Flask application object.
app = Flask(__name__)

# Development CORS configuration.
# This currently allows cross-origin requests broadly.
CORS(app, resources={ r"/api/*": { "origins": FRONTEND_ORIGIN } })

# ---------------------------------------------------------------------------
# BLUEPRINT REGISTRATION
# ---------------------------------------------------------------------------

#Fetch the contracts
app.register_blueprint(contracts_bp)

#Fetch the departments
app.register_blueprint(departments_bp)

#Fetch the master agreements
app.register_blueprint(master_agreements_bp)

#Fetch the personnel
app.register_blueprint(personnel_bp)

#Fetch options
app.register_blueprint(options_bp)


# ---------------------------------------------------------------------------
# APPLICATION SETTINGS
# ---------------------------------------------------------------------------

# Flask secret key.
# The fallback value is DEVELOPMENT ONLY.
# We are not yet using authentication in this version, but keeping the setting
# here makes later session/token work easier.
app.config["SECRET_KEY"] = SECRET_KEY

# ---------------------------------------------------------------------------
# STARTUP
# ---------------------------------------------------------------------------

# Ensure the database/tables exist every time the module loads.
init_db()

# Insert fake development data only when explicitly enabled.
if SEED_DEV_DATA:
    seed_departments()
    seed_data()


# Only start Flask's built-in development server when this file is executed
# directly with `python app.py`.
if __name__ == "__main__":
    app.run(debug=DEBUG_MODE, port=5001)