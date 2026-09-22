# os: file paths + environment variables
import os

# ---------------------------------------------------------------------------
# APPLICATION CONFIGURATION
# ---------------------------------------------------------------------------

# Secret key used by Flask.
# Development fallback only.
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "dev-key-change-me"
)


# Frontend origin allowed to call this backend.
#
# During React development, the frontend will usually run on:
# http://localhost:5173
#
# We can override this later with an environment variable.
FRONTEND_ORIGIN = os.environ.get(
    "FRONTEND_ORIGIN",
    "http://localhost:5173"
)


# Flask debug mode.
DEBUG_MODE = os.environ.get(
    "FLASK_DEBUG",
    "0"
) == "1"


# Whether fake development data should be inserted.
SEED_DEV_DATA = os.environ.get(
    "SEED_DEV_DATA",
    "0"
) == "1"