from app import db, login
import pytz
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

timezone = pytz.timezone("Australia/Perth")
now = datetime.now(timezone)

# User class to store user login information


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    last_login = db.Column(db.DateTime, default=now)

    # Format how the object is printed for debugging
    def __repr__(self):
        return '<User {}>'.format(self.username)

    # Set password hash
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    # Check password hash
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# User loader function for flask-login


@login.user_loader
def load_user(id):
    return User.query.get(int(id))
