import sys
from pathlib import Path

import pytest

SERVER_ROOT = Path(__file__).resolve().parents[1]
if str(SERVER_ROOT) not in sys.path:
  sys.path.insert(0, str(SERVER_ROOT))

from app import create_app
from models import db


@pytest.fixture()
def app():
  app = create_app('testing')
  with app.app_context():
    db.create_all()
    yield app
    db.session.remove()
    db.drop_all()


@pytest.fixture()
def client(app):
  return app.test_client()
