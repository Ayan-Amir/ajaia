from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction
from rest_framework.authtoken.models import Token

from documents.choices import SharePermission
from documents.models import Document
from documents.services import grant_share

SEED_USERS = [
    {"username": "alice", "first_name": "Alice", "last_name": "Nguyen", "email": "alice@example.com"},
    {"username": "bob", "first_name": "Bob", "last_name": "Martinez", "email": "bob@example.com"},
    {"username": "carol", "first_name": "Carol", "last_name": "Osei", "email": "carol@example.com"},
]

WELCOME_HTML = (
    "<h1>Welcome to Ajaia Docs</h1>"
    "<p>This is a <strong>rich text</strong> document. Try <em>italic</em>, "
    "<u>underline</u>, and headings from the toolbar.</p>"
    "<h2>Things you can do</h2>"
    "<ul><li>Create and rename documents</li>"
    "<li>Import a .txt or .md file</li>"
    "<li>Share a document with another user</li></ul>"
)

SHARED_HTML = (
    "<h2>Q3 Planning Notes</h2>"
    "<p>Alice shared this document with Bob so he can edit it.</p>"
    "<ol><li>Confirm scope</li><li>Draft timeline</li><li>Review with team</li></ol>"
)


class Command(BaseCommand):
    help = "Seed demo users and documents so reviewers can test the sharing flow."

    @transaction.atomic
    def handle(self, *args, **options):
        users = {}
        for data in SEED_USERS:
            user, created = User.objects.get_or_create(
                username=data["username"], defaults=data
            )
            if created:
                user.set_unusable_password()
                user.save(update_fields=["password"])
            users[user.username] = user
            Token.objects.get_or_create(user=user)
            self.stdout.write(f"{'Created' if created else 'Found'} user {user.username}")

        alice, bob = users["alice"], users["bob"]

        welcome, _ = Document.objects.get_or_create(
            owner=alice,
            title="Welcome to Ajaia Docs",
            defaults={"content": WELCOME_HTML},
        )
        shared, created_shared = Document.objects.get_or_create(
            owner=alice,
            title="Q3 Planning Notes",
            defaults={"content": SHARED_HTML},
        )
        grant_share(shared, shared_with_id=bob.pk, permission=SharePermission.EDIT)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(users)} users. '{welcome.title}' owned by alice; "
                f"'{shared.title}' shared with bob (can edit)."
            )
        )
