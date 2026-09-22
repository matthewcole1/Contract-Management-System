import os
import sys
import tempfile

import pytest


# Add the backend folder to Python's import path.
sys.path.insert(
    0,
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)


# ---------------------------------------------------------------------------
# TEST DATABASE SETUP
# ---------------------------------------------------------------------------

# Create one temporary SQLite database for this entire pytest run.
db_fd, db_path = tempfile.mkstemp()

# IMPORTANT:
# Set these environment variables BEFORE importing app.py.
#
# db.py reads CONTRACT_DB_PATH when it is imported.
os.environ["CONTRACT_DB_PATH"] = db_path
os.environ["SEED_DEV_DATA"] = "1"


# Now that the environment is configured, import the Flask app.
from app import app


# ---------------------------------------------------------------------------
# FLASK TEST CLIENT
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    """
    Give each test a Flask test client.

    All tests use the temporary test database rather than
    the normal development contracts.db file.
    """

    app.config["TESTING"] = True

    with app.test_client() as test_client:
        yield test_client


# ---------------------------------------------------------------------------
# TEST DATABASE CLEANUP
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_database():
    """
    Delete the temporary test database after the entire
    pytest test session has finished.
    """

    yield

    os.close(db_fd)

    if os.path.exists(db_path):
        os.unlink(db_path)