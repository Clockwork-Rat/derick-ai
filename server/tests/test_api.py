from models import db, User, UserConfig


def test_health_check(client):
  res = client.get('/api/health')
  assert res.status_code == 200
  assert res.get_json()['status'] == 'healthy'


def test_create_user_and_default_categories(client, app):
  res = client.post('/api/users', json={'username': 'alice', 'email': 'alice@example.com'})
  assert res.status_code == 201
  user_id = res.get_json()['id']

  cats_res = client.get(f'/api/users/{user_id}/categories')
  assert cats_res.status_code == 200
  payload = cats_res.get_json()

  assert 'Other' in payload['wants_categories']
  assert 'Other' not in payload['needs_categories']
  assert 'Other' not in payload['savings_categories']


def test_create_transaction_enforces_category(client, app):
  user = User(username='bob', email='bob@example.com')
  db.session.add(user)
  db.session.commit()

  config = UserConfig(
    user_id=user.id,
    categories=['Housing', 'Food', 'Other'],
    needs_categories=['Housing'],
    wants_categories=['Food', 'Other'],
    savings_categories=[]
  )
  db.session.add(config)
  db.session.commit()

  res = client.post('/api/transactions', json={
    'user_id': user.id,
    'description': 'Invalid category expense',
    'amount': 25,
    'transaction_type': 'expense',
    'category': 'NotAllowed'
  })

  assert res.status_code == 201
  assert res.get_json()['category'] == 'Other'
