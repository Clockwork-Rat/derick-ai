import os
import requests
from flask import Flask, jsonify, request
from datetime import datetime
from flask_cors import CORS
from config import config
from models import db, User, Transaction, UserConfig
from agent import MultiRoundAgent


def create_app(config_name=None):
    """Application factory"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize database
    db.init_app(app)

    # Add request logging
    @app.before_request
    def log_request():
        print(f"[REQUEST] {request.method} {request.path}")

    @app.after_request
    def log_response(response):
        print(f"[RESPONSE] {response.status_code} for {request.method} {request.path}")
        return response

    # Register blueprints (routes)
    register_routes(app)

    return app


def register_routes(app):
    """Register all API routes"""

    DEFAULT_NEEDS = ['Housing', 'Food', 'Utilities', 'Healthcare']
    DEFAULT_WANTS = ['Transport', 'Entertainment', 'Other']
    DEFAULT_SAVINGS = []
    DEFAULT_CATEGORIES = list(dict.fromkeys(DEFAULT_NEEDS + DEFAULT_WANTS + DEFAULT_SAVINGS))

    def normalize_categories(categories):
        if not isinstance(categories, list):
            categories = []
        cleaned = []
        for c in categories:
            if not isinstance(c, str):
                continue
            name = c.strip()
            if not name:
                continue
            if name not in cleaned:
                cleaned.append(name)
        if 'Other' not in cleaned:
            cleaned.append('Other')
        return cleaned

    def normalize_grouped(needs, wants, savings):
        needs_clean = normalize_categories(needs)
        wants_clean = normalize_categories(wants)
        savings_clean = normalize_categories(savings)

        # Ensure Other lives in wants by default
        if 'Other' not in wants_clean:
            wants_clean.append('Other')
        # Remove Other from needs/savings if present
        needs_clean = [c for c in needs_clean if c != 'Other']
        savings_clean = [c for c in savings_clean if c != 'Other']

        return needs_clean, wants_clean, savings_clean

    def union_categories(needs, wants, savings):
        return list(dict.fromkeys((needs or []) + (wants or []) + (savings or [])))

    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({'status': 'healthy'}), 200

    @app.route('/api/debug/ping', methods=['GET'])
    def debug_ping():
        """Debug endpoint to validate reachability"""
        return jsonify({
            'ok': True,
            'message': 'pong',
            'has_openai_key': bool(os.getenv('OPENAI_API_KEY'))
        }), 200

    @app.route('/api/users', methods=['GET'])
    def get_users():
        """Get all users"""
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200

    @app.route('/api/users', methods=['POST'])
    def create_user():
        """Create a new user"""
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        if not data.get('username') or not data.get('email'):
            return jsonify({'error': 'Username and email are required'}), 400

        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 409

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 409

        try:
            user = User(username=data['username'], email=data['email'])
            db.session.add(user)
            db.session.commit()
            # initialize user config with default categories
            config = UserConfig(
                user_id=user.id,
                categories=DEFAULT_CATEGORIES,
                needs_categories=DEFAULT_NEEDS,
                wants_categories=DEFAULT_WANTS,
                savings_categories=DEFAULT_SAVINGS
            )
            db.session.add(config)
            db.session.commit()
            return jsonify(user.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/users/<int:user_id>/categories', methods=['GET'])
    def get_user_categories(user_id):
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        config = UserConfig.query.filter_by(user_id=user_id).first()
        if not config:
            config = UserConfig(
                user_id=user_id,
                categories=DEFAULT_CATEGORIES,
                needs_categories=DEFAULT_NEEDS,
                wants_categories=DEFAULT_WANTS,
                savings_categories=DEFAULT_SAVINGS
            )
            db.session.add(config)
            db.session.commit()
        # backfill grouped categories if missing
        needs = config.needs_categories or DEFAULT_NEEDS
        wants = config.wants_categories or DEFAULT_WANTS
        savings = config.savings_categories or DEFAULT_SAVINGS
        needs, wants, savings = normalize_grouped(needs, wants, savings)

        return jsonify({
            'categories': union_categories(needs, wants, savings),
            'needs_categories': needs,
            'wants_categories': wants,
            'savings_categories': savings
        }), 200

    @app.route('/api/users/<int:user_id>/categories', methods=['PUT'])
    def update_user_categories(user_id):
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json() or {}
        needs, wants, savings = normalize_grouped(
            data.get('needs_categories', []),
            data.get('wants_categories', []),
            data.get('savings_categories', [])
        )
        categories = union_categories(needs, wants, savings)

        config = UserConfig.query.filter_by(user_id=user_id).first()
        if not config:
            config = UserConfig(
                user_id=user_id,
                categories=categories,
                needs_categories=needs,
                wants_categories=wants,
                savings_categories=savings
            )
            db.session.add(config)
        else:
            config.categories = categories
            config.needs_categories = needs
            config.wants_categories = wants
            config.savings_categories = savings

        db.session.commit()
        return jsonify({
            'categories': categories,
            'needs_categories': needs,
            'wants_categories': wants,
            'savings_categories': savings
        }), 200

    @app.route('/api/users/<int:user_id>/transactions', methods=['GET'])
    def get_user_transactions(user_id):
        """Get all transactions for a user"""
        print(f"[DEBUG] Fetching transactions for user_id={user_id}")
        user = User.query.get(user_id)

        # If user doesn't exist, create them
        if not user:
            print(f"[DEBUG] User {user_id} not found, creating new user")
            username = request.args.get('username', f'user_{user_id}')
            email = request.args.get('email', f'user_{user_id}@example.com')

            # Check if username or email already exists
            if User.query.filter_by(username=username).first():
                username = f'{username}_{user_id}'
            if User.query.filter_by(email=email).first():
                email = f'user_{user_id}_{int(__import__("time").time())}@example.com'

            user = User(id=user_id, username=username, email=email)
            db.session.add(user)
            db.session.commit()
            print(f"[DEBUG] Created user: {user}")

            # initialize user config
            config = UserConfig(
                user_id=user.id,
                categories=DEFAULT_CATEGORIES,
                needs_categories=DEFAULT_NEEDS,
                wants_categories=DEFAULT_WANTS,
                savings_categories=DEFAULT_SAVINGS
            )
            db.session.add(config)
            db.session.commit()

        transactions = Transaction.query.filter_by(user_id=user_id).all()
        print(f"[DEBUG] Found {len(transactions)} transactions for user {user_id}")
        result = [transaction.to_dict() for transaction in transactions]
        print(f"[DEBUG] Returning: {result}")
        return jsonify(result), 200

    @app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
    def delete_transaction(transaction_id):
        """Delete a transaction"""
        transaction = Transaction.query.get(transaction_id)

        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404

        try:
            db.session.delete(transaction)
            db.session.commit()
            return jsonify({'message': 'Transaction deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/transactions', methods=['POST'])
    def create_transaction():
        """Create a new transaction"""
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        required = ['user_id', 'description', 'amount', 'transaction_type']
        for key in required:
            if key not in data:
                return jsonify({'error': f'Missing field: {key}'}), 400

        try:
            user_id = int(data['user_id'])
            amount = float(data['amount'])
            date_val = None
            if data.get('date'):
                try:
                    date_val = datetime.fromisoformat(data['date'])
                except Exception:
                    date_val = datetime.utcnow()
            else:
                date_val = datetime.utcnow()

            # enforce category membership for expenses
            category = data.get('category')
            if data.get('transaction_type') == 'expense':
                config = UserConfig.query.filter_by(user_id=user_id).first()
                if config:
                    needs = config.needs_categories or DEFAULT_NEEDS
                    wants = config.wants_categories or DEFAULT_WANTS
                    savings = config.savings_categories or DEFAULT_SAVINGS
                    allowed = union_categories(needs, wants, savings)
                else:
                    allowed = DEFAULT_CATEGORIES
                if category not in allowed:
                    category = 'Other'

            transaction = Transaction(
                user_id=user_id,
                description=data['description'],
                amount=amount,
                transaction_type=data['transaction_type'],
                category=category,
                date=date_val
            )
            db.session.add(transaction)
            db.session.commit()
            return jsonify(transaction.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/advice', methods=['POST'])
    def get_budget_advice():
        data = request.get_json() or {}
        question = data.get('question', '').strip()
        context = data.get('context', {})

        if not question:
            return jsonify({'error': 'Question is required'}), 400

        if not os.getenv('OPENAI_API_KEY'):
            return jsonify({'error': 'OPENAI_API_KEY not set'}), 500

        try:
            agent = MultiRoundAgent(max_rounds=3)
            result = agent.run(question=question, context=context)
            return jsonify({'answer': result.answer, 'steps': [s.__dict__ for s in result.steps]}), 200
        except Exception as e:
            print(f"[ADVICE ERROR] {e}")
            return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
