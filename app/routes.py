from app import app, db
import pytz
from datetime import datetime
from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import current_user, login_user, logout_user
from app.models import User, Word
from app.forms import LoginForm, SignupForm
from werkzeug.urls import url_parse
from http import HTTPStatus
from sqlalchemy.sql.expression import func

timezone = pytz.timezone("Australia/Perth")
now = datetime.now(timezone)

# Combined route for login and signup pages


@app.route('/login', methods=['GET', 'POST'])
def login_signup():
    if current_user.is_authenticated:
        return redirect(url_for('home'))

    login_form = LoginForm(prefix='login')
    signup_form = SignupForm(prefix='signup')
    action = None

    if request.method == 'POST':
        action = request.form.get('action')

        # Handle login form submission
        if action == 'Login' and login_form.validate_on_submit():
            user = User.query.filter_by(
                username=login_form.username.data).first()
            if user is None or not user.check_password(login_form.password.data):
                flash('Invalid Username or Password')
                return redirect(url_for('login'))
            login_user(user, remember=login_form.remember_me.data)
            next_page = request.args.get('next')
            if not next_page or url_parse(next_page).netloc != '':
                next_page = url_for('home')
            return redirect(next_page)

        # Handle signup form submission
        elif action == 'Sign Up' and signup_form.validate_on_submit():
            user = User(username=signup_form.username.data,
                        email=signup_form.email.data)
            user.set_password(signup_form.password.data)
            db.session.add(user)
            db.session.commit()
            flash('Congratulations, you are now a registered user!', 'success')
            return redirect(url_for('login'))

    return render_template('login.html', login_form=login_form, signup_form=signup_form, title='Log In / Sign Up')

# Decorator for Log out


@app.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))


# Decorator for Home page

@app.route('/')
@app.route('/home')
def home():
    """ if not current_user.is_authenticated:
        flash('You must be logged in to access the Home page.', 'error')
        return redirect(url_for('login_signup')) """
    return render_template('home.html', title='Home')


@app.route('/gallery')
def gallery():
    """ if not current_user.is_authenticated:
        flash('You must be logged in to access the Guessing Gallery page.', 'error')
        return redirect(url_for('login_signup')) """
    return render_template('gallery.html', title='Guessing Gallery')


@app.route('/drawing')
def drawing():
    """ if not current_user.is_authenticated:
        flash('You must be logged in to access the Create Drawing page.', 'error')
        return redirect(url_for('login_signup')) """
    return render_template('drawing.html', title='Create Drawing')

@app.route('/get-random-word', methods=['GET'])
# @login_required
def get_random_word():
    # Get category from request parameters
    category = request.args.get('category')
    # If no category given, return an error
    if not category:
        return jsonify({'error': 'Category is required'}), HTTPStatus.BAD_REQUEST
    
    # Query database to get a random word from the given category
    if category == 'all':
        random_word = Word.query.order_by(func.random()).first()
    else:
        random_word = Word.query.filter_by(category=category).order_by(func.random()).first()
    # If no word found, return an error
    if not random_word:
        return jsonify({'error': 'No words found in the given category'}), HTTPStatus.NOT_FOUND

    return jsonify({'word_id': random_word.id, 'word': random_word.text}), HTTPStatus.OK

@app.route('/profile')
def profile():
    """ if not current_user.is_authenticated:
        flash('You must be logged in to view your profile.', 'error')
        return redirect(url_for('login_signup')) """
    return render_template('profile.html', title='Profile')


if __name__ == '__main__':
    app.run(debug=True)
