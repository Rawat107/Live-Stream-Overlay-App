# This creates a Python venv (Linux/Mac only), installs deps, and runs Flask

python -m venv venv || true
source venv/bin/activate   # For Linux/Mac
# On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py
