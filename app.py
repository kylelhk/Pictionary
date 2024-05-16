from flask_migrate import Migrate

from app import create_app, db
from config import DeploymentConfig

app = create_app(DeploymentConfig)
migrate = Migrate(app, db)


@app.shell_context_processor
def make_shell_context():
    from app.models import User

    return {"db": db, "User": User}
