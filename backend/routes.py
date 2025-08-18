from .controllers.overlays_controller import bp as overlays_bp


def register_blueprints(app):
    app.register_blueprint(overlays_bp)