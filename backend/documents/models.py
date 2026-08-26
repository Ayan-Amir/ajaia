from django.contrib.auth.models import User
from django.db import models
from django_extensions.db.models import TimeStampedModel

from documents.choices import DocumentRole, SharePermission

DEFAULT_TITLE = "Untitled document"


class Document(TimeStampedModel):
    title = models.CharField(max_length=255, default=DEFAULT_TITLE)
    content = models.TextField(blank=True, default="")
    owner = models.ForeignKey(
        User, related_name="owned_documents", on_delete=models.CASCADE
    )

    class Meta:
        ordering = ["-modified"]

    def __str__(self):
        return f"{self.title} ({self.owner.username})"

    def role_for(self, user):
        """Return the DocumentRole this user holds, or None if they have no access."""
        if self.owner_id == user.id:
            return DocumentRole.OWNER
        share = next(
            (s for s in self.shares.all() if s.shared_with_id == user.id), None
        )
        if share is None:
            return None
        return (
            DocumentRole.EDITOR
            if share.permission == SharePermission.EDIT
            else DocumentRole.VIEWER
        )


class DocumentShare(TimeStampedModel):
    document = models.ForeignKey(
        Document, related_name="shares", on_delete=models.CASCADE
    )
    shared_with = models.ForeignKey(
        User, related_name="document_shares", on_delete=models.CASCADE
    )
    permission = models.CharField(
        max_length=16, choices=SharePermission.choices, default=SharePermission.VIEW
    )

    class Meta:
        ordering = ["-created"]
        constraints = [
            models.UniqueConstraint(
                fields=["document", "shared_with"], name="unique_share_per_user"
            )
        ]

    def __str__(self):
        return f"{self.document.title} → {self.shared_with.username} ({self.permission})"
