from bson import ObjectId

def serialize_overlay(overlay):
    """Convert MongoDB document into JSON serializable format."""
    if overlay:
        overlay['id'] = str(overlay.pop('_id'))
        return overlay
    return None
