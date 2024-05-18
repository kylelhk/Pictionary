import unittest
from test.base_test import BaseTestCase
from app.models import User
from http import HTTPStatus


class LoginTests(BaseTestCase):
    def test_password_hashing(self):
        user = User.query.filter_by(username="user1").first()
        self.assertIsNotNone(user)
        self.assertTrue(user.check_password("Password1"))
        self.assertFalse(user.check_password("incorrect"))

    def test_login_correct_credentials(self):
        response = self.client.post(
            "/login",
            json={
                "action": "Login",
                "login-username": "user1",
                "login-password": "Password1",
                "remember_me": False,
            },
            headers={"X-Requested-With": "XMLHttpRequest"},
        )

        status_code = response.status_code
        json_data = response.get_json()

        self.assertFalse(json_data["error"])
        self.assertEqual(status_code, HTTPStatus.OK)

    def test_login_incorrect_password(self):
        response = self.client.post(
            "/login",
            json={
                "action": "Login",
                "login-username": "user1",
                "login-password": "incorrect",
                "remember_me": False,
            },
            headers={"X-Requested-With": "XMLHttpRequest"},
        )

        status_code = response.status_code
        json_data = response.get_json()

        self.assertTrue(json_data["error"])
        self.assertEqual(status_code, HTTPStatus.UNAUTHORIZED)

    def test_login_incorrect_username(self):
        response = self.client.post(
            "/login",
            json={
                "action": "Login",
                "login-username": "unknown",
                "login-password": "password",
                "remember_me": False,
            },
            headers={"X-Requested-With": "XMLHttpRequest"},
        )

        status_code = response.status_code
        json_data = response.get_json()

        self.assertTrue(json_data["error"])
        self.assertEqual(status_code, HTTPStatus.UNAUTHORIZED)


class RegisterTests(BaseTestCase):
    def test_register_successful(self):
        response = self.client.post(
            "/login",
            json={
                "action": "Sign Up",
                "signup-username": "newuser",
                "signup-email": "newuser@email.com",
                "signup-password": "password",
            },
            headers={"X-Requested-With": "XMLHttpRequest"},
        )

        status_code = response.status_code
        json_data = response.get_json()

        self.assertFalse(json_data["error"])
        self.assertEqual(status_code, HTTPStatus.CREATED)

        user = User.query.filter_by(username="newuser").first()
        self.assertIsNotNone(user)
        self.assertEqual(user.email, "newuser@email.com")
        self.assertTrue(user.check_password("password"))

    def test_validate_username_existing(self):
        response = self.client.post(
            "/validate-username",
            json={"value": "user1"},
            headers={"X-Requested-With": "XMLHttpRequest"},
        )

        status_code = response.status_code
        json_data = response.get_json()

        self.assertEqual(json_data, "This username is already taken.")
        self.assertEqual(status_code, HTTPStatus.BAD_REQUEST)

    def test_validate_email_existing(self):
        response = self.client.post(
            "/validate-email",
            json={"value": "user1@email.com"},
            headers={"X-Requested-With": "XMLHttpRequest"},
        )

        status_code = response.status_code
        json_data = response.get_json()

        self.assertEqual(json_data, "This email is already in use.")
        self.assertEqual(status_code, HTTPStatus.BAD_REQUEST)

    def test_validate_email_invalid_format(self):
        response = self.client.post(
            "/validate-email",
            json={"value": "invalidemail"},
            headers={"X-Requested-With": "XMLHttpRequest"},
        )

        status_code = response.status_code
        json_data = response.get_json()

        self.assertEqual(json_data, "Invalid email format.")
        self.assertEqual(status_code, HTTPStatus.BAD_REQUEST)


if __name__ == "__main__":
    unittest.main()
