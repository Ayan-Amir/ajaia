from django.contrib.auth.models import User
from rest_framework import serializers

from accounts.serializers import UserSerializer
from documents.choices import SharePermission
from documents.models import Document, DocumentShare
from documents.services import sanitize_document_html


class DocumentShareSerializer(serializers.ModelSerializer):
    shared_with = UserSerializer(read_only=True)

    class Meta:
        model = DocumentShare
        fields = ["id", "shared_with", "permission", "created"]


class DocumentListSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ["id", "title", "owner", "role", "created", "modified"]

    def get_role(self, obj):
        return obj.role_for(self.context["request"].user)


class DocumentDetailSerializer(DocumentListSerializer):
    shares = DocumentShareSerializer(many=True, read_only=True)

    class Meta(DocumentListSerializer.Meta):
        fields = DocumentListSerializer.Meta.fields + ["content", "shares"]

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_content(self, value):
        return sanitize_document_html(value)


class ShareCreateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    permission = serializers.ChoiceField(
        choices=SharePermission.choices, default=SharePermission.VIEW
    )

    def validate_user_id(self, value):
        if not User.objects.filter(pk=value, is_active=True).exists():
            raise serializers.ValidationError("No such user.")
        return value


class DocumentImportSerializer(serializers.Serializer):
    file = serializers.FileField()
