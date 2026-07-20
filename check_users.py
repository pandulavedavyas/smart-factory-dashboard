import sys
sys.path.insert(0, r'C:\Users\DELL\OneDrive\Desktop\smart factory monitoring')
from backend.app import create_app
app = create_app()
with app.app_context():
    from backend.models.database import User
    users = User.query.all()
    for u in users:
        print(f'ID={u.id} Name={u.full_name} Email={u.email} Role={u.role}')
    # Promote admin@factory.com to admin
    admin = User.query.filter_by(email='admin@factory.com').first()
    if admin and admin.role != 'admin':
        admin.role = 'admin'
        from backend.models.database import db
        db.session.commit()
        print(f'\nPromoted {admin.email} to admin role')
    else:
        print(f'\n{admin.email} already has role: {admin.role}')
