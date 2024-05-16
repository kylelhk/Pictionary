import re  # Regular expressions library for password validation
from datetime import datetime, timezone
from http import HTTPStatus

import pytz
from flask import (
    flash,
    jsonify,
    request,
    url_for,
    redirect,
    current_app,
    render_template,
)
from flask_login import current_user, login_required, login_user, logout_user
from sqlalchemy import case
from sqlalchemy.sql.expression import func

from app import db
from app.blueprints import main
from app.forms import LoginForm, SignupForm
from app.models import Drawing, Guess, Word, User

timezone = pytz.timezone("Australia/Perth")


# Determine if a request is made via AJAX
def is_ajax():
    return request.headers.get("X-Requested-With") == "XMLHttpRequest"


# Login and Signup Page


@main.route("/login", methods=["GET", "POST"])
def login_signup():
    # Redirect to Home page if user is already authenticated
    if current_user.is_authenticated:
        return redirect(url_for("main.home"))

    # Handle AJAX requests for login and signup
    if request.method == "POST" and is_ajax():
        data = request.json
        action = data.get("action")
        if action == "Login":
            return handle_login_ajax(data)
        elif action == "Sign Up":
            return handle_signup_ajax(data)
        else:
            return jsonify({"error": True, "message": "Unexpected action"}), 400

    # Handle non-AJAX POST requests
    elif request.method == "POST":
        return jsonify({"error": True, "message": "Invalid request type"}), 400

    # Render the login/signup page for GET requests
    login_form = LoginForm(prefix="login")
    signup_form = SignupForm(prefix="signup")
    return render_template(
        "login.html",
        login_form=login_form,
        signup_form=signup_form,
        title="Log In / Sign Up",
    )


# Process login form inputs and submission


def handle_login_ajax(data):
    try:
        username = data.get("login-username")
        password = data.get("login-password")
        remember_me = data.get("remember_me", False)
        user = User.query.filter_by(username=username).first()

        # Server-side input validation for login form
        # If user exists and password is correct, commit the last login time and log in the user
        if user and user.check_password(password):
            user.last_login = datetime.now(timezone)
            db.session.commit()
            login_user(user, remember=remember_me)
            return jsonify({"error": False, "redirect": url_for("main.home")}), 200
        else:
            return (
                jsonify(
                    {
                        "error": True,
                        "errors": {"Password": "Invalid Username or Password"},
                    }
                ),
                (
                    401
                    if user
                    else jsonify({"error": True, "errors": {"User": "User not found"}})
                ),
                404,
            )

    # Handle unexpected errors
    except Exception as e:
        current_app.logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({"error": True, "message": "Internal server error"}), 500


# Process signup form inputs and submission


def handle_signup_ajax(data):
    try:
        username = data.get("signup-username")
        email = data.get("signup-email")
        password = data.get("signup-password")

        # Create new user in the database
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        flash("Congratulations, you are now a registered user!", "success")
        return jsonify({"error": False, "redirect": url_for("main.login_signup")}), 201

    # Handle unexpected errors
    except Exception as e:
        current_app.logger.error(f"Error during signup: {e}", exc_info=True)
        db.session.rollback()
        return (
            jsonify({"error": True, "message": "Signup failed due to server error"}),
            500,
        )


# Server-side input validation for signup form


# Validate username
@main.route("/validate-username", methods=["POST"])
def validate_username():
    username = request.json.get("value")

    # Check if the username field is empty
    if not username.strip():  # Catch empty strings after stripping whitespace
        return jsonify("Username is required."), 400

    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify("This username is already taken."), 400

    return jsonify({"error": False}), 200


# Validate email


@main.route("/validate-email", methods=["POST"])
def validate_email():
    email = request.json.get("value")

    # Check if the email field is empty
    if not email.strip():  # Catch empty strings after stripping whitespace
        return jsonify("Email is required."), 400

    # Check if email is already in use
    if User.query.filter_by(email=email).first():
        return jsonify("This email is already in use."), 400

    # Validate email format using regex (generated by ChatGPT)
    email_regex = r"^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,6}$"
    if not re.match(email_regex, email.strip()):
        return jsonify("Invalid email format."), 400

    return jsonify({"error": False}), 200


# Validate password


@main.route("/validate-password", methods=["POST"])
def validate_password():
    password = request.json.get("value")

    # Ensure password is actually provided
    if not password:
        return jsonify("Password is required."), 400

    if len(password) < 8:
        return jsonify("Password must be at least 8 characters."), 400

    if not (
        re.search("[a-z]", password)
        and re.search("[A-Z]", password)
        and re.search("[0-9]", password)
    ):
        return jsonify("At least one uppercase, lowercase, and numeric character."), 400

    return jsonify({"error": False}), 200


# Confirm password match


@main.route("/validate-confirmpassword", methods=["POST"])
def validate_confirm_password():
    password = request.json.get("password")
    confirm_password = request.json.get("value")

    if not password or not confirm_password:
        return jsonify("Password and confirm password must not be empty."), 400

    if password != confirm_password:
        return jsonify("Passwords do not match."), 400

    return jsonify({"error": False}), 200


# Logout route


@main.route("/logout")
def logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("main.login_signup"))


# For access control via AJAX in login.js
@main.route("/check-authentication")
def check_authentication():
    return jsonify(isAuthenticated=current_user.is_authenticated)


# Home Page
@main.route("/")
@main.route("/home")
@login_required
def home():
    return render_template("home.html", title="Home")


# Guessing Gallery Page
@main.route("/gallery")
@login_required
def gallery():
    return render_template("gallery.html", title="Guessing Gallery")


# Get Gallery Data
@main.route("/get-gallery-data", methods=["GET"])
@login_required
def get_gallery_data():
    # Query database to get view of gallery for the currently logged in user
    gallery_query = (
        db.session.query(
            Drawing.id.label("drawing_id"),
            User.username.label("username"),
            Word.category.label("category"),
            case(
                (Drawing.creator_id == current_user.id, "My Creation"),
                (Guess.is_correct == True, "Guessed Correctly"),
                (Guess.is_correct == False, "Guessed Incorrectly"),
                else_="New",
            ).label("status"),
            Drawing.created_at.label("created_at"),
        )
        .join(User, User.id == Drawing.creator_id)
        .join(Word, Word.id == Drawing.word_id)
        .outerjoin(
            Guess,
            (Guess.drawing_id == Drawing.id) & (Guess.guesser_id == current_user.id),
        )
        .all()
    )

    results = [
        {
            "drawing_id": data.drawing_id,
            "creator": data.username,
            "category": data.category,
            "status": data.status,
            "date_created": data.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for data in gallery_query
    ]

    return jsonify(results)


# Create Drawing Page
@main.route("/drawing")
@login_required
def drawing():
    return render_template("drawing.html", title="Create Drawing")


@main.route("/drawings/<int:drawing_id>", methods=["GET", "POST"])
@login_required
def drawing_detail(drawing_id):
    image = Drawing.query.get_or_404(drawing_id)

    # Check if the current user is the creator of the drawing
    if image.creator_id == current_user.id:
        flash("You cannot guess your own drawing.", "error")
        return redirect(url_for("main.gallery"))

    if request.method == "POST":

        # Fetch the guess from JSON data
        guessed_word = request.get_json().get("guess")

        # Check if a guess already exists for this drawing and user to prevent multiple guesses
        existing_guess = Guess.query.filter_by(
            drawing_id=drawing_id, guesser_id=current_user.id
        ).first()

        if existing_guess:
            return (
                jsonify({"error": "You have already made a guess on this image"}),
                HTTPStatus.FORBIDDEN,
            )

        # Check whether the guess is correct
        is_correct = guessed_word.lower() == image.word.text.lower()

        # Increase the score of guesser and creator by 1
        if is_correct:
            image.creator.points_as_creator += 1
            current_user.points_as_guesser += 1
            db.session.commit()

        guess = Guess(
            drawing_id=drawing_id,
            guesser_id=current_user.id,
            is_correct=is_correct,
            guessed_at=datetime.utcnow(),
            guessed_word=guessed_word,
        )

        db.session.add(guess)
        db.session.commit()

        return (
            jsonify({"success": "Guess recorded", "is_correct": is_correct}),
            HTTPStatus.CREATED,
        )

    current_user_guess = Guess.query.filter_by(
        drawing_id=drawing_id, guesser_id=current_user.id
    ).all()

    return render_template(
        "guess.html",
        image=image,
        current_user_guess=current_user_guess,
    )


# Save a drawing in the database
@main.route("/submit-drawing", methods=["POST"])
@login_required
def submit_drawing():
    if not request.json:
        return jsonify({"error": "No JSON in request"}), HTTPStatus.BAD_REQUEST

    word_id = request.json.get("wordId")
    creator_id = current_user.id
    drawing_data = request.json.get("drawingData")

    # If any data missing from request, return an error
    if not word_id or not drawing_data or not creator_id:
        return jsonify({"error": "Missing necessary data"}), HTTPStatus.BAD_REQUEST

    new_drawing = Drawing(
        word_id=word_id,
        creator_id=creator_id,
        drawing_data=drawing_data,
        created_at=datetime.now(timezone),
    )
    db.session.add(new_drawing)
    db.session.commit()

    flash("Your drawing has been successfully submitted", "success")

    return jsonify({"message": "Drawing saved successfully!"}), HTTPStatus.CREATED


# Retrieve a random word to draw
@main.route("/get-random-word", methods=["GET"])
@login_required
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
            Word.query.filter_by(category=category).order_by(func.random()).first()
        )

    # If no word found, return an error
    if not random_word:
        return (
            jsonify({"error": "No words found in the given category"}),
            HTTPStatus.NOT_FOUND,
        )

    return jsonify({"word_id": random_word.id, "word": random_word.text}), HTTPStatus.OK
