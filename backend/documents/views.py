from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from documents.models import Document, DocumentShare
from documents.permissions import IsDocumentOwner, IsOwnerOrSharedWith
from documents.serializers import (
    DocumentDetailSerializer,
    DocumentImportSerializer,
    DocumentListSerializer,
    DocumentShareSerializer,
    ShareCreateSerializer,
)
from documents.services import build_document_from_upload, grant_share


def accessible_documents(user):
    """Documents the user owns or has been shared on."""
    return (
        Document.objects.filter(Q(owner=user) | Q(shares__shared_with=user))
        .distinct()
        .select_related("owner")
        .prefetch_related("shares__shared_with")
    )


class DocumentListCreateAPIView(generics.ListCreateAPIView):
    def get_queryset(self):
        return accessible_documents(self.request.user)

    def get_serializer_class(self):
        return (
            DocumentDetailSerializer
            if self.request.method == "POST"
            else DocumentListSerializer
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class DocumentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentDetailSerializer
    permission_classes = [*generics.RetrieveUpdateDestroyAPIView.permission_classes, IsOwnerOrSharedWith]

    def get_queryset(self):
        return accessible_documents(self.request.user)


class DocumentImportAPIView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        serializer = DocumentImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            document = build_document_from_upload(
                request.user, serializer.validated_data["file"]
            )
        except DjangoValidationError as exc:
            raise ValidationError({"file": exc.messages})
        return Response(
            DocumentDetailSerializer(document, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class DocumentShareAPIView(APIView):
    permission_classes = [*APIView.permission_classes, IsDocumentOwner]

    def get_document(self, pk):
        document = get_object_or_404(accessible_documents(self.request.user), pk=pk)
        self.check_object_permissions(self.request, document)
        return document

    def post(self, request, pk):
        document = self.get_document(pk)
        serializer = ShareCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            share = grant_share(
                document,
                shared_with_id=serializer.validated_data["user_id"],
                permission=serializer.validated_data["permission"],
            )
        except DjangoValidationError as exc:
            raise ValidationError({"user_id": exc.messages})
        return Response(
            DocumentShareSerializer(share).data, status=status.HTTP_201_CREATED
        )

    def delete(self, request, pk, share_id):
        document = self.get_document(pk)
        share = get_object_or_404(DocumentShare, pk=share_id, document=document)
        share.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
