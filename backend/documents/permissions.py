from rest_framework import permissions

from documents.choices import DocumentRole

SAFE_ROLES = {DocumentRole.OWNER, DocumentRole.EDITOR, DocumentRole.VIEWER}
WRITE_ROLES = {DocumentRole.OWNER, DocumentRole.EDITOR}


class IsOwnerOrSharedWith(permissions.BasePermission):
    """Read for owner and any shared user, write for owner and editors, delete for owner."""

    def has_object_permission(self, request, view, obj):
        role = obj.role_for(request.user)
        if role is None:
            return False
        if request.method in permissions.SAFE_METHODS:
            return role in SAFE_ROLES
        if request.method == "DELETE":
            return role == DocumentRole.OWNER
        return role in WRITE_ROLES


class IsDocumentOwner(permissions.BasePermission):
    """Only the owner may manage who a document is shared with."""

    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id
