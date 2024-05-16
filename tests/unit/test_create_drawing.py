import unittest
from flask_testing import TestCase
from app import create_app, db
from app.models import User, Word, Drawing
from http import HTTPStatus


class CreateDrawingsTest(TestCase):
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

        word1 = Word(category="Action", text="Cook")
        word2 = Word(category="Difficult", text="Sunburn")
        db.session.add_all([word1, word2])
        db.session.commit()

    def login_test_user(self):
        self.client.post(
            "/login",
            json={
                "action": "Login",
                "login-username": "user1",
                "login-password": "password",
                "remember_me": False,
            },
            headers={"X-Requested-With": "XMLHttpRequest"},
        )

    def test_submit_drawing_successfully(self):
        with self.client:  # use self.client to make requests
            self.login_test_user()
            initial_drawings_len = len(Drawing.query.all())
            response = self.client.post(
                "/submit-drawing", json={"wordId": 1, "drawingData": "base64string"}
            )
            self.assertEqual(response.status_code, HTTPStatus.CREATED)
            self.assertEqual(len(Drawing.query.all()), initial_drawings_len + 1)

    def test_submit_drawing_no_json(self):
        with self.client:
            self.login_test_user()
            initial_drawings_len = len(Drawing.query.all())
            response = self.client.post(
                "/submit-drawing", headers={"Content-Type": "application/json"}
            )
            self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
            self.assertEqual(len(Drawing.query.all()), initial_drawings_len)

    def test_submit_drawing_missing_data(self):
        with self.client:
            self.login_test_user()
            initial_drawings_len = len(Drawing.query.all())
            # If wordId is missing
            response = self.client.post(
                "/submit-drawing", json={"drawingData": "base64string"}
            )
            self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
            self.assertIn("Missing necessary data", response.get_json()["error"])
            self.assertEqual(len(Drawing.query.all()), initial_drawings_len)
            # If drawingData is missing
            response = self.client.post("/submit-drawing", json={"wordId": 1})
            self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
            self.assertIn("Missing necessary data", response.get_json()["error"])
            self.assertEqual(len(Drawing.query.all()), initial_drawings_len)

    def test_get_random_word_success(self):
        with self.client:
            self.login_test_user()
            response = self.client.get("/get-random-word?category=Action")
            self.assertEqual(response.status_code, HTTPStatus.OK)
            self.assertIn("Cook", response.get_json()["word"])

    def test_get_random_word_category_all_success(self):
        with self.client:
            self.login_test_user()
            response = self.client.get("/get-random-word?category=all")
            self.assertEqual(response.status_code, HTTPStatus.OK)
            self.assertIn(response.get_json()["word"], ["Cook", "Sunburn"])

    def test_get_random_word_no_category(self):
        with self.client:
            self.login_test_user()
            response = self.client.get("/get-random-word")
            self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
            self.assertIn("Category is required", response.get_json()["error"])

    def test_get_random_word_no_word_found(self):
        with self.client:
            self.login_test_user()
            response = self.client.get("/get-random-word?category=Object")
            self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
            self.assertIn(
                "No words found in the given category", response.get_json()["error"]
            )


if __name__ == "__main__":
    unittest.main()
