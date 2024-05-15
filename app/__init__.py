# fmt: off
from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

def create_app(config_name='DefaultConfig'):
    app = Flask(__name__)

    # Dynamically select the configuration based on the input parameter
    if config_name == 'DeploymentConfig':
        app.config.from_object('config.DeploymentConfig')
    elif config_name == 'TestConfig':
        app.config.from_object('config.TestConfig')
    else:
        app.config.from_object('config.Config')

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'main.login_signup'

    from app.blueprints import main
    app.register_blueprint(main)

    from app.cli import load_data_command
    app.cli.add_command(load_data_command)

    return app


# fmt: on
