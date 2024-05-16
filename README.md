# Pictionary

CITS5505 Agile Web Development - Group Project

## Table of Contents

- Purpose
- Architecture
- Launch
- Unit tests
- System Tests
- License
- Contributors

## Purpose

[Draw, guess, and chill with friends in a game of wits and sketches ;)]

## Architecture

### Client-Side (Frontend):

- **HTML**: The markup language used to create and structure sections, paragraphs, and links on a web page.
- **CSS**: The style sheet language used for describing the presentation of the web pages, including colors, layout, and
  fonts.
- **JavaScript**: The programming language used to create interactive effects within web browsers, including the use of
  two JavaScript libraries:
    - **AJAX (Asynchronous JavaScript and XML)**: A set of web development techniques that allows a web page to
      communicate with a server asynchronously, without reloading the page.
    - **jQuery**: A fast, small, and feature-rich JavaScript library that simplifies things like HTML document traversal
      and manipulation, event handling, and animation.
- **Bootstrap**: An open-source toolkit for developing with HTML, CSS, and JavaScript, providing design templates and
  themes for typography, forms, buttons, navigation, and other interface components.

### Server-Side (Backend):

- **Flask**: A micro web framework written in Python. It's used to handle requests and responses, interact with the
  database, and render templates into HTML to be sent to the client.

### Database:

- **SQLite**: A compact and reliable SQL database engine that offers a self-contained, serverless, and
  zero-configuration database system. It's embedded directly into the application, providing robust data storage
  capabilities.

## Launch

1. Clone the repository

```bash
git clone https://github.com/kylelhk/Pictionary
```

2. Setup virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

3. Create a `.flaskenv` environment file to setup environment variables.
   (Save the file in the same location as `.flaskenv.example`). Copy the content of `.flaskenv.example` to `.flaskenv`.


4. Download and install the required packages by running the following command

```bash

pip install -r requirements.txt

```

Note: Whenever a new package is used, they should be added into the requirements.txt file for the markers to download
all the packages required for running this app.

5. Initialise the database

```bash
flask db init
flask db migrate
flask db upgrade
```

Run this command to add words to draw and guess to the app's database

```bash
flask load-data
```

6. Run the app

```bash
flask run
```

Enjoy!

## Unit Tests

Unit tests are found in `test/unit/`

To run all tests, use the following command:  

```py
python -m unittest
```  

Or for a more detailed output:

```py
python -m unittest -v
```

If you would like to run a specific unit test class file, use the command:

```py
python -m unittest test.unit.<filename without .py extension>
```

## System Tests

[ ]

## License

This project is licensed under the MIT license.

## Contributors

- Pritam Suwal Shrestha (23771397)
- Trieu Huynh (23728208)
- Weiqiao Xu (23464412)
- Kyle Leung (23601964)
