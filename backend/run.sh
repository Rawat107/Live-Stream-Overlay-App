gunicorn backend.app:app --bind 0.0.0.0:$PORT --workers 4
# This script sets up a Python virtual environment, installs dependencies, and runs the Flask app using Gunicorn