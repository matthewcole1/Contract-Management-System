import os
import sqlite3

from flask import g

from schema import SCHEMA

# Absolute path to the folder containing this app.py file.
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Where the SQLite database lives.
# If CONTRACT_DB_PATH is defined in the environment, use that path.
# Otherwise, create/use contracts.db next to app.py.
DB_PATH = os.environ.get(
    "CONTRACT_DB_PATH",
    os.path.join(BASE_DIR, "contracts.db")
)

def get_db():
    """Return the SQLite connection for the current Flask request.

    Flask's g object is request-scoped storage. The first call opens the
    connection and stores it as g.db; later calls during the same request reuse
    that same connection.
    """
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)

        # Return rows that support both numeric indexes and column names.
        # Example: row["kch_number"] instead of row[1].
        g.db.row_factory = sqlite3.Row

        # SQLite requires foreign-key enforcement to be enabled per connection.
        g.db.execute("PRAGMA foreign_keys = ON")

    return g.db

def close_db(exception=None):
    """Close the request's DB connection when Flask finishes the request."""
    db = g.pop("db", None)

    if db is not None:
        db.close()


def init_db():
    """Create the SQLite database/tables/indexes if they do not already exist."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()