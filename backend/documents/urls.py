from django.urls import path

from documents.views import (
    DocumentDetailAPIView,
    DocumentImportAPIView,
    DocumentListCreateAPIView,
    DocumentShareAPIView,
)

urlpatterns = [
    path("", DocumentListCreateAPIView.as_view(), name="document-list"),
    path("import/", DocumentImportAPIView.as_view(), name="document-import"),
    path("<int:pk>/", DocumentDetailAPIView.as_view(), name="document-detail"),
    path("<int:pk>/shares/", DocumentShareAPIView.as_view(), name="document-share"),
    path(
        "<int:pk>/shares/<int:share_id>/",
        DocumentShareAPIView.as_view(),
        name="document-share-detail",
    ),
]
