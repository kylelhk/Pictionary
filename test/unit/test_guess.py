import unittest
from test.base_test import BaseTestCase
from http import HTTPStatus


class GuessTests(BaseTestCase):
    def test_successful_guess(self):
        with self.client:
            self.login_test_user()
            guess_data = {"guess": "Cook"}
            response = self.client.post(
                "/drawings/1",
                json=guess_data,
                headers={"Content-Type": "application/json"},
            )
            status_code = response.status_code
            json_data = response.get_json()

            self.assertEqual(status_code, HTTPStatus.CREATED)
            self.assertTrue(json_data["is_correct"])
            self.assertEqual(json_data["correct_word"], "Cook")

    def test_unsuccessful_guess(self):
        with self.client:
            self.login_test_user()
            guess_data = {"guess": "Pig"}
            response = self.client.post(
                "/drawings/1",
                json=guess_data,
                headers={"Content-Type": "application/json"},
            )
            status_code = response.status_code
            json_data = response.get_json()

            self.assertEqual(status_code, HTTPStatus.CREATED)
            self.assertFalse(json_data["is_correct"])
            self.assertEqual(json_data["correct_word"], "Cook")

    def test_prevent_multiple_guesses(self):
        with self.client:
            self.login_test_user()
            guess_data = {"guess": "Cook"}
            response = self.client.post(
                "/drawings/1",
                json=guess_data,
                headers={"Content-Type": "application/json"},
            )
            status_code = response.status_code
            self.assertEqual(status_code, HTTPStatus.CREATED)

            # Attempt to guess again
            response = self.client.post(
                "/drawings/1",
                json=guess_data,
                headers={"Content-Type": "application/json"},
            )
            status_code = response.status_code
            json_data = response.get_json()

            self.assertEqual(status_code, HTTPStatus.FORBIDDEN)
            self.assertIn(
                "You have already made a guess on this image", json_data["error"]
            )


if __name__ == "__main__":
    unittest.main()
