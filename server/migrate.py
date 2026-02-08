"""
Database initialization and migration script
Run this to create tables and populate initial data
"""
import os
from app import create_app, db
from models import User, Transaction
from datetime import datetime, timedelta

def init_db():
    """Initialize the database with tables"""
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("✓ Database tables created successfully")

def seed_db():
    """Populate the database with sample data"""
    app = create_app()
    
    with app.app_context():
        # Check if data already exists
        if User.query.first():
            print("Database already populated. Skipping seed.")
            return
        
        print("Seeding database with sample data...")
        
        # Create sample users
        user1 = User(username='john_doe', email='john@example.com')
        user2 = User(username='jane_smith', email='jane@example.com')
        
        db.session.add(user1)
        db.session.add(user2)
        db.session.flush()  # Flush to get the IDs
        
        # Create sample transactions for user1
        transactions = [
            Transaction(
                user_id=user1.id,
                description='Monthly Salary',
                amount=5000.00,
                transaction_type='income',
                category='Salary',
                date=datetime.utcnow() - timedelta(days=5)
            ),
            Transaction(
                user_id=user1.id,
                description='Rent Payment',
                amount=1200.00,
                transaction_type='expense',
                category='Housing',
                date=datetime.utcnow() - timedelta(days=3)
            ),
            Transaction(
                user_id=user1.id,
                description='Grocery Shopping',
                amount=150.75,
                transaction_type='expense',
                category='Food',
                date=datetime.utcnow() - timedelta(days=2)
            ),
            Transaction(
                user_id=user1.id,
                description='Freelance Project',
                amount=800.00,
                transaction_type='income',
                category='Freelance',
                date=datetime.utcnow() - timedelta(days=1)
            ),
        ]
        
        for transaction in transactions:
            db.session.add(transaction)
        
        # Create sample transactions for user2
        transactions2 = [
            Transaction(
                user_id=user2.id,
                description='Annual Bonus',
                amount=2000.00,
                transaction_type='income',
                category='Bonus',
                date=datetime.utcnow() - timedelta(days=10)
            ),
            Transaction(
                user_id=user2.id,
                description='Electricity Bill',
                amount=85.50,
                transaction_type='expense',
                category='Utilities',
                date=datetime.utcnow() - timedelta(days=4)
            ),
        ]
        
        for transaction in transactions2:
            db.session.add(transaction)
        
        db.session.commit()
        print("✓ Sample data added successfully")
        print(f"  - Created {User.query.count()} users")
        print(f"  - Created {Transaction.query.count()} transactions")

def reset_db():
    """Drop all tables and recreate them"""
    app = create_app()
    
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("✓ All tables dropped")
        
        print("Recreating tables...")
        db.create_all()
        print("✓ Tables recreated")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == 'init':
            init_db()
        elif command == 'seed':
            seed_db()
        elif command == 'reset':
            reset_db()
        elif command == 'all':
            init_db()
            seed_db()
        else:
            print("Unknown command. Use: init, seed, reset, or all")
    else:
        # Default: initialize and seed
        init_db()
        seed_db()
