import click
from flask.cli import with_appcontext
from utils.word_data_loader import load_data


@click.command("load-data")
@with_appcontext
def load_data_command():
    # Command to load Word data into the database
    load_data()
    click.echo("Data loaded successfully.")
