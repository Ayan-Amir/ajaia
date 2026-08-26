from django.db import models


class SharePermission(models.TextChoices):
    VIEW = "VIEW", "Can view"
    EDIT = "EDIT", "Can edit"


class DocumentRole(models.TextChoices):
    OWNER = "OWNER", "Owner"
    EDITOR = "EDITOR", "Editor"
    VIEWER = "VIEWER", "Viewer"
