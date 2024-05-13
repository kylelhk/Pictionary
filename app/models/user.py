from app import db, login
import pytz
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

timezone = pytz.timezone("Australia/Perth")
now = datetime.now(timezone)


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    last_login = db.Column(db.DateTime, default=lambda: datetime.now(timezone))
    # last_failed_login & failed_login_attempts: For time-based locking and exponential backoff to prevent brute force attacks
    last_failed_login = db.Column(db.DateTime, nullable=True)
    failed_login_attempts = db.Column(db.Integer, default=0)
    points_as_creator = db.Column(db.Integer, default=0)
    points_as_guesser = db.Column(db.Integer, default=0)

    drawing = db.relationship('Drawing', back_populates='creator')
    guesser = db.relationship('Guess', back_populates='guesser')

    # Format how the object is printed for debugging
    def __repr__(self):
        return '<User {}>'.format(self.username)

    # Set password hash
    def set_password(self, password):
        # Werkzeug automatically handles salting with generate_password_hash()
        self.password_hash = generate_password_hash(password)

    # Check password hash
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # For implementing time-based locking and exponential backoff
    def get_lockout_time(self):
        if self.failed_login_attempts > 0:
            # Cap the cooling-off period at 10 minutes (600 seconds)
            return min(600, 10 * 2 ** (self.failed_login_attempts - 1))
        return 0

# User loader function for flask-login


@login.user_loader
def load_user(id):
    return User.query.get(int(id))
