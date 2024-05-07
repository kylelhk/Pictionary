from app import db


class Guess(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    drawing_id = db.Column(db.Integer, db.ForeignKey('drawing.id'), index=True)
    guesser_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True)
    is_correct = db.Column(db.Boolean)
    points_for_creator = db.Column(db.Integer, default=0)
    points_for_guesser = db.Column(db.Integer, default=0)
    time_shown = db.Column(db.DateTime)
    time_guessed = db.Column(db.DateTime)
    time_taken = db.Column(db.Float)

    drawing = db.relationship('Drawing', back_populates='guess')
    guesser = db.relationship('User', back_populates='guesser')

    def __repr__(self):
        return f'<Guess "id={self.id}, drawing_id={self.drawing_id}, guesser_id={self.guesser_id}">'
