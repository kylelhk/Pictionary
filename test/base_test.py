# Base test case class to share common functions across unit tests

from flask_testing import TestCase
from app import create_app, db
from app.models import Drawing, Guess, User, Word
from datetime import datetime


class BaseTestCase(TestCase):
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
        with self.app_context:
            user1 = User(username="user1", email="user1@email.com")
            user1.set_password("Password1")
            user2 = User(username="user2", email="user2@email.com")
            user2.set_password("password")
            db.session.add_all([user1, user2])

            word1 = Word(category="Action", text="Cook")
            word2 = Word(category="Difficult", text="Sunburn")
            word3 = Word(category="Object", text="Spoon")
            db.session.add_all([word1, word2, word3])

            drawing1 = Drawing(
                word_id=1, creator_id=2, drawing_data="data1", created_at=datetime.now()
            )
            drawing2 = Drawing(
                word_id=2, creator_id=2, drawing_data="data2", created_at=datetime.now()
            )
            drawing3 = Drawing(
                word_id=3, creator_id=2, drawing_data="data3", created_at=datetime.now()
            )
            drawing4 = Drawing(
                word_id=1, creator_id=1, drawing_data="data4", created_at=datetime.now()
            )
            db.session.add_all([drawing1, drawing2, drawing3, drawing4])

            guess1 = Guess(
                drawing_id=2,
                guesser_id=1,
                is_correct=True,
                guessed_at=datetime.now(),
                guessed_word="Sunburn",
            )
            guess2 = Guess(
                drawing_id=3,
                guesser_id=1,
                is_correct=False,
                guessed_at=datetime.now(),
                guessed_word="wrongword",
            )
            db.session.add_all([guess1, guess2])

            db.session.commit()

    def login_test_user(self):
        self.client.post(
            "/login",
            json={
                "action": "Login",
                "login-username": "user1",
                "login-password": "Password1",
                "remember_me": False,
            },
            headers={"X-Requested-With": "XMLHttpRequest"},
        )
