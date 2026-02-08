# Budget App Server

A Flask-based Python server for the Budget App with PostgreSQL database support.

## Setup

### Prerequisites
- Python 3.8+
- PostgreSQL 12+

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection details
```

4. Create database tables:
```bash
python -c "from app import create_app; app = create_app(); app.app_context().push()"
```

### Running the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Users
- `GET /api/users` - Get all users

### Transactions
- `GET /api/users/<user_id>/transactions` - Get transactions for a user

## Database Models

### User
- `id` (Integer, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `created_at` (DateTime)

### Transaction
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key)
- `description` (String)
- `amount` (Float)
- `transaction_type` (String) - 'income' or 'expense'
- `category` (String)
- `date` (DateTime)
- `created_at` (DateTime)

## Project Structure

```
server/
├── app.py          # Main Flask application
├── models.py       # SQLAlchemy database models
├── config.py       # Configuration management
├── requirements.txt # Python dependencies
├── .env.example    # Environment variables template
└── README.md       # This file
```
