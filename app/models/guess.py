from datetime import datetime

from app import db


class Guess(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    drawing_id = db.Column(db.Integer, db.ForeignKey("drawing.id"), index=True)
    guesser_id = db.Column(db.Integer, db.ForeignKey("user.id"), index=True)
    guessed_word = db.Column(db.String(255), nullable=False)
    guessed_at = db.Column(db.DateTime, default=datetime.utcnow)

    is_correct = db.Column(db.Boolean)

    # FIXME: Might need discussion on why these are needed
    time_shown = db.Column(db.DateTime)
    time_taken = db.Column(db.Float)

    drawing = db.relationship("Drawing", back_populates="guess")
    guesser = db.relationship("User", back_populates="guesser")

    def __repr__(self):
        return f'<Guess "id={self.id}, drawing_id={self.drawing_id}, guesser_id={self.guesser_id}">'
