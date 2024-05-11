from datetime import datetime, timezone
from http import HTTPStatus

import pytz
from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import current_user, login_user, logout_user
from sqlalchemy.sql.expression import func
from werkzeug.urls import url_parse

import json

from app import app, db
from app.forms import LoginForm, SignupForm
from app.models import User, Word, Drawing

import re  # Regular expressions library for password validation
from sqlalchemy.exc import SQLAlchemyError  # For debugging database errors

timezone = pytz.timezone("Australia/Perth")
now = datetime.now(timezone)


# Determine if a request is made via AJAX
def is_ajax():
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest'

# Login and Signup Page


@app.route("/login", methods=["GET", "POST"])
def login_signup():
    # Redirect to Home page if user is already authenticated
    if current_user.is_authenticated:
        return redirect(url_for("home"))

    if request.method == "POST" and is_ajax():
        data = request.json
        action = data.get("action")
        if action == "Login":
            return handle_login_ajax()
        elif action == "Sign Up":
            return handle_signup_ajax(data)
        else:
            return jsonify({'error': True, 'message': 'Unexpected action'}), 400

    elif request.method == "POST":
        return jsonify({'error': True, 'message': 'Invalid request type'}), 400

    # Serve login/signup page on GET request or non-AJAX POST
    login_form = LoginForm(prefix="login")
    signup_form = SignupForm(prefix="signup")
    return render_template(
        "login.html",
        login_form=login_form,
        signup_form=signup_form,
        title="Log In / Sign Up"
    )

# Handle login form input and submission


def handle_login_ajax():
    username = request.json.get('username')
    password = request.json.get('password')
    remember_me = request.json.get('remember_me', False)
    user = User.query.filter_by(username=username).first()

    # Time-based locking and exponential backoff mechanism
    # If user exists, check if they are in lockout period
    if user:
        lockout_time = user.get_lockout_time()
        current_time = datetime.now(timezone)

        # If user has failed login attempts and is still in lockout period
        if user.last_failed_login and (current_time - user.last_failed_login).seconds < lockout_time:
            wait_time = int(lockout_time - (current_time -
                            user.last_failed_login).seconds)
            return jsonify({'error': True, 'errors': {'Lockout': f"Please wait {wait_time} seconds before trying again."}}), 423

        # If user exists and password is correct
        if user.check_password(password):
            user.failed_login_attempts = 0
            user.last_failed_login = None
            db.session.commit()
            login_user(user, remember=remember_me)
            next_page = request.args.get("next") or url_for("home")
            return jsonify({'error': False, 'redirect': next_page})

        # If user exists but password is incorrect
        else:
            user.failed_login_attempts += 1
            user.last_failed_login = datetime.now(timezone)
            db.session.commit()
            return jsonify({'error': True, 'errors': {'Password': 'Invalid Username or Password'}}), 401

    # If user does not exist
    else:
        return jsonify({'error': True, 'errors': {'User': 'Invalid Username or Password'}}), 404

# Handle signup form input and submission


def handle_signup_ajax(data):
    try:
        username = data.get('signup-username')
        email = data.get('signup-email')
        password = data.get('signup-password')
        confirm_password = data.get('signup-confirm_password')

        if User.query.filter_by(username=username).first():
            return jsonify({'error': True, 'errors': {'username': 'Username already taken'}}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': True, 'errors': {'email': 'This email is already in use'}}), 400

        if password != confirm_password:
            return jsonify({'error': True, 'errors': {'confirm_password': 'Passwords must match'}}), 400

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash("Congratulations, you are now a registered user!", "success")
        return jsonify({'error': False, 'redirect': url_for("login_signup")})

    except Exception as e:
        # Detailed logging for errors
        app.logger.error(f'Error during signup: {e}', exc_info=True)
        db.session.rollback()
        return jsonify({'error': True, 'message': 'Signup failed due to server error'}), 500


# Additional validations for username, email, and password inputs

@app.route('/validate-username', methods=['POST'])
def validate_username():
    username = request.json.get('value')
    # Default to 'signup' if not specified
    context = request.json.get('context', 'signup')

    # Check if the username field is empty
    if not username.strip():  # Catch empty strings after stripping whitespace
        return jsonify('No username provided.'), 400

    user = User.query.filter_by(username=username).first()
    if context == 'signup':
        if user:
            return jsonify('This username is already taken.'), 400
    elif context == 'login':
        if not user:
            return jsonify('This username does not exist.'), 404

    return jsonify({'error': False})


@app.route('/validate-email', methods=['POST'])
def validate_email():
    email = request.json.get('value')

    # Check if the email field is empty
    if not email.strip():  # Catch empty strings after stripping whitespace
        return jsonify('No email provided.'), 400

    # Check if email is already in use
    if User.query.filter_by(email=email).first():
        return jsonify('This email is already in use.'), 400

    # Validate email format using regex
    email_regex = r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$'
    if not re.match(email_regex, email.strip()):
        return jsonify('Invalid email format.'), 400

    return jsonify({'error': False}), 200


@app.route('/validate-password', methods=['POST'])
def validate_password():
    password = request.json.get('value')

    if not password:  # Ensure password is actually provided
        return jsonify('No password provided.'), 400

    if len(password) < 8:
        return jsonify('Password must be at least 8 characters.'), 400

    if not (re.search("[a-z]", password) and re.search("[A-Z]", password) and re.search("[0-9]", password)):
        return jsonify('Password must include lower, upper, and numeric characters.'), 400

    return jsonify({'error': False}), 200


@app.route('/validate-confirmpassword', methods=['POST'])
def validate_confirm_password():
    password = request.json.get('password')
    confirm_password = request.json.get('value')

    if not password or not confirm_password:
        return jsonify('Password and confirm password must not be empty.'), 400

    if password != confirm_password:
        return jsonify('Passwords must match.'), 400

    return jsonify({'error': False}), 200


@app.route("/logout")
def logout():
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


# For access control via AJAX in login.js
@app.route('/check-authentication')
def check_authentication():
    return jsonify(isAuthenticated=current_user.is_authenticated)


# Home Page
@app.route("/")
@app.route("/home")
def home():
    # Regular handling for non-AJAX requests (in case AJAX fails or is disabled)
    if not current_user.is_authenticated:
        flash('You must be logged in to access the Home page.', 'error')
        return redirect(url_for('login_signup'))
    return render_template("home.html", title="Home")


# Guessing Gallery Page
@app.route("/gallery")
def gallery():
    # Regular handling for non-AJAX requests (in case AJAX fails or is disabled)
    if not current_user.is_authenticated:
        flash('You must be logged in to access the Guessing Gallery page.', 'error')
        return redirect(url_for('login_signup'))
    return render_template("gallery.html", title="Guessing Gallery")


# Create Drawing Page
@app.route("/drawing")
def drawing():
    # Regular handling for non-AJAX requests (in case AJAX fails or is disabled)
    if not current_user.is_authenticated:
        flash('You must be logged in to access the Create Drawing page.', 'error')
        return redirect(url_for('login_signup'))
    return render_template("drawing.html", title="Create Drawing")


@app.route("/drawings/<int:drawing_id>")
def drawing_detail(drawing_id):
    image = Drawing.query.get(drawing_id)

    if image:
        return render_template("guess.html", image=image)

    return jsonify({"error": "Image does not exist"}), HTTPStatus.NOT_FOUND


# Save a drawing in the database
@app.route("/submit-drawing", methods=["POST"])
# @login_required
def submit_drawing():
    if not request.json:
        return jsonify({"error": "No JSON in request"}), HTTPStatus.BAD_REQUEST

    word_id = request.json.get("wordId")
    creator_id = (
        current_user.id if current_user.is_authenticated else None
    )  # TODO: remove else None once users implemented
    drawing_data = request.json.get("drawingData")

    if not word_id or not drawing_data:
        return jsonify({"error": "Missing necessary data"}), HTTPStatus.BAD_REQUEST

    new_drawing = Drawing(
        word_id=word_id,
        creator_id=creator_id,
        drawing_data=drawing_data,
        # TODO: Using `now` defined above, but it's not saving the correct date and time?
        created_at=now,
    )

    db.session.add(new_drawing)
    db.session.commit()

    flash("Your drawing has been successfully submitted")

    return jsonify({"message": "Drawing saved successfully!"}), HTTPStatus.CREATED


# Retrieve a random word to draw
@app.route("/get-random-word", methods=["GET"])
# @login_required
def get_random_word():
    # Get category from request parameters
    category = request.args.get("category")
    # If no category given, return an error
    if not category:
        return jsonify({"error": "Category is required"}), HTTPStatus.BAD_REQUEST

    # Query database to get a random word from the given category
    if category == "all":
        random_word = Word.query.order_by(func.random()).first()
    else:
        random_word = (
            Word.query.filter_by(category=category).order_by(
                func.random()).first()
        )
    # If no word found, return an error
    if not random_word:
        return (
            jsonify({"error": "No words found in the given category"}),
            HTTPStatus.NOT_FOUND,
        )

    return jsonify({"word_id": random_word.id, "word": random_word.text}), HTTPStatus.OK


if __name__ == "__main__":
    app.run(debug=True)
