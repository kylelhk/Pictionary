import unittest
from flask_testing import TestCase
from app import create_app, db
from app.models import User
from app.routes import handle_login_ajax
from http import HTTPStatus


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
        user = User(username="user1", email="user1@example.com")
        user.set_password("password")
        db.session.add(user)
        db.session.commit()

    def test_password_hashing(self):
        user = User.query.filter_by(username="user1").first()
        self.assertIsNotNone(user)
        self.assertTrue(user.check_password("password"))
        self.assertFalse(user.check_password("incorrect"))

    def test_handle_login_correct_credentials(self):
        response = self.client.post(
            "/login",
            json={
                "action": "Login",
                "login-username": "user1",
                "login-password": "password",
                "remember_me": False,
            },
            headers={"X-Requested-With": "XMLHttpRequest"},
        )

        status_code = response.status_code
        json_data = response.get_json()

        self.assertFalse(json_data["error"])
        self.assertEqual(status_code, HTTPStatus.OK)


if __name__ == "__main__":
    unittest.main()
