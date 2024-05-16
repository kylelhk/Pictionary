import unittest
from flask_testing import TestCase
from app import create_app, db
from config import TestConfig
from app.models import User

# Add test cases here


class BasicTests(TestCase):
    def setUp(self):
        test_app = create_app(TestConfig)
        self.app_context = test_app.app_context()
        self.app_context.push()
        # db.create_all()
        # add_test_data_to_db()

    def tearDown(self):
        # db.session.remove()
        # db.drop_all()
        self.app_context.pop()


if __name__ == "__main__":
    unittest.main()
