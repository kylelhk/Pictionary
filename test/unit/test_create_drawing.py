import unittest
from app.models import Drawing
from test.base_test import BaseTestCase
from http import HTTPStatus


class CreateDrawingsTest(BaseTestCase):

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
            self.assertIn(response.get_json()["word"], ["Cook", "Sunburn", "Spoon"])

    def test_get_random_word_no_category(self):
        with self.client:
            self.login_test_user()
            response = self.client.get("/get-random-word")
            self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
            self.assertIn("Category is required", response.get_json()["error"])

    def test_get_random_word_no_word_found(self):
        with self.client:
            self.login_test_user()
            response = self.client.get("/get-random-word?category=invalidcategory")
            self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
            self.assertIn(
                "No words found in the given category", response.get_json()["error"]
            )


if __name__ == "__main__":
    unittest.main()
