from controllers.overlays_controller import register_overlay_routes
import extensions   # import the whole module, not just db

def register_blueprints(app):
    overlays_bp = register_overlay_routes(extensions.db)  # now db is set after init_extensions
    app.register_blueprint(overlays_bp)
