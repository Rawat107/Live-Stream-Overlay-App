# Production run script for Render

# Start the app using Gunicorn (production server)
gunicorn app:app --bind 0.0.0.0:$PORT --workers 4
