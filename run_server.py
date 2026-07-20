import sys
sys.path.insert(0, r'C:\Users\DELL\OneDrive\Desktop\smart factory monitoring')
from backend.app import create_app
app = create_app()
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
