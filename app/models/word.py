from app import db


class Word(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.Text)
    text = db.Column(db.Text, index=True, unique=True)

    drawing = db.relationship("Drawing", back_populates="word")

    def __repr__(self):
        return f'<Word "{self.text}">'
