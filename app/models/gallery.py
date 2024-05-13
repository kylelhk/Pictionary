from app import db
import datetime

class Gallery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    creator = db.Column(db.Text, nullable=False)
    category = db.Column(db.Text, nullable=False)
    status = db.Column(db.Text, nullable=False)
    date_created = db.Column(db.DateTime)

    def __repr__(self):
        return f'<Gallery {self.id} {self.category} {self.status}>'
