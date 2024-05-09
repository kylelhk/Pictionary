from datetime import datetime, timezone
from http import HTTPStatus

import pytz
from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import current_user, login_user, logout_user
from sqlalchemy.sql.expression import func
from werkzeug.urls import url_parse

from app import app, db
from app.forms import LoginForm, SignupForm
from app.models import User, Word, Drawing

timezone = pytz.timezone("Australia/Perth")
now = datetime.now(timezone)


# Login and Signup Page
@app.route("/login", methods=["GET", "POST"])
def login_signup():
    if current_user.is_authenticated:
        return redirect(url_for("home"))

    login_form = LoginForm(prefix="login")
    signup_form = SignupForm(prefix="signup")
    action = None

    if request.method == "POST":
        action = request.form.get("action")

        # Handle login form submission
        if action == "Login" and login_form.validate_on_submit():
            user = User.query.filter_by(
                username=login_form.username.data).first()

            # Time-based locking and exponential backoff mechanism
            # If user exists, check if they are in lockout period
            if user:
                lockout_time = user.get_lockout_time()
                current_time = datetime.now(timezone.utc)

                # If user has failed login attempts and is still in lockout period
                # fmt: off
                if user.last_failed_login and (current_time - user.last_failed_login).seconds < lockout_time:
                    wait_time = int(
                        lockout_time - (current_time - user.last_failed_login).seconds)
                    flash(f"Please wait {wait_time} seconds before trying again.", "danger")
                    return render_template("login.html", login_form=login_form, signup_form=signup_form, title="Log In / Sign Up")
                # fmt: on

                # If user exists and password is correct
                if user.check_password(login_form.password.data):
                    user.failed_login_attempts = 0
                    user.last_failed_login = None
                    db.session.commit()
                    login_user(user, remember=login_form.remember_me.data)
                    next_page = request.args.get("next")
                    if not next_page or url_parse(next_page).netloc != "":
                        next_page = url_for("home")
                    return redirect(next_page)

                # If user exists but password is incorrect
                else:
                    user.failed_login_attempts += 1
                    user.last_failed_login = datetime.now(timezone.utc)
                    db.session.commit()
                    flash("Invalid Username or Password", "danger")

            # If user does not exist
            else:
                flash("Invalid Username or Password", "danger")

        # Handle signup form submission
        elif action == "Sign Up" and signup_form.validate_on_submit():
            user = User(
                username=signup_form.username.data, email=signup_form.email.data
            )
            user.set_password(signup_form.password.data)
            db.session.add(user)
            db.session.commit()
            flash("Congratulations, you are now a registered user!", "success")
            return redirect(url_for("login"))

    return render_template(
        "login.html",
        login_form=login_form,
        signup_form=signup_form,
        title="Log In / Sign Up",
    )


@app.route("/logout")
def logout():
    logout_user()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


# Home Page
@app.route("/")
@app.route("/home")
def home():
    if not current_user.is_authenticated:
        flash('You must be logged in to access the Home page.', 'error')
        return redirect(url_for('login_signup'))
    return render_template("home.html", title="Home")


# Guessing Gallery Page
@app.route("/gallery")
def gallery():
    if not current_user.is_authenticated:
        flash('You must be logged in to access the Guessing Gallery page.', 'error')
        return redirect(url_for('login_signup'))
    return render_template("gallery.html", title="Guessing Gallery")


# Create Drawing Page
@app.route("/drawing")
def drawing():
    # consider using @login_required decorator from Flask-Login to label routes that require a login
    # instead of the code commented out below
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
