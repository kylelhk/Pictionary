import unittest
from test.base_test import BaseTestCase
from app.models import User
from http import HTTPStatus


class GalleryTests(BaseTestCase):
    def test_get_gallery_data(self):
        self.login_test_user()
        response = self.client.get(
            "/get-gallery-data", headers={"X-Requested-With": "XMLHttpRequest"}
        )

        status_code = response.status_code
        json_data = response.get_json()

        self.assertEqual(status_code, HTTPStatus.OK)

        # Ensure the correct number of drawings is fetched
        self.assertEqual(len(json_data), 4)

        # Verify the statuses of the guesses
        drawing1_data = next(item for item in json_data if item["drawing_id"] == 1)
        drawing2_data = next(item for item in json_data if item["drawing_id"] == 2)
        drawing3_data = next(item for item in json_data if item["drawing_id"] == 3)
        self.assertEqual(drawing1_data["status"], "New")
        self.assertEqual(drawing2_data["status"], "Guessed Correctly")
        self.assertEqual(drawing3_data["status"], "Guessed Incorrectly")


if __name__ == "__main__":
    unittest.main()
