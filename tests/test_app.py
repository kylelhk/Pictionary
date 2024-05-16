import unittest
from flask_testing import TestCase
from app import create_app, db
from config import TestConfig
from app.models import User

# Add test cases here

class LoginTests(TestCase):
    def create_app(self):
        return create_app("TestConfig")

    def setUp(self):
        self.app = self.create_app()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.add_test_data_to_db()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def add_test_data_to_db(self):
        user1 = User(username="user1", email="user1@example.com")
        user1.set_password("password")
        db.session.add(user1)
        db.session.commit()

    def test_password_hashing(self):
        u = User.query.filter_by(username="user1").first()
        self.assertIsNotNone(u)
        self.assertTrue(u.check_password("password"))
        self.assertFalse(u.check_password("incorrect"))

if __name__ == "__main__":
    unittest.main()
