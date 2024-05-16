from app import db


class Drawing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word_id = db.Column(db.Integer, db.ForeignKey("word.id"), index=True)
    creator_id = db.Column(db.Integer, db.ForeignKey("user.id"), index=True)
    drawing_data = db.Column(db.Text)
    created_at = db.Column(db.DateTime)

    word = db.relationship("Word", back_populates="drawing")
    creator = db.relationship("User", back_populates="drawing")
    guess = db.relationship("Guess", back_populates="drawing")

    def __repr__(self):
        return f'<Drawing "id={self.id}, word_id={self.word_id}, creator_id={self.creator_id}">'
