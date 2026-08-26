from django.urls import path

from accounts.views import CurrentUserAPIView, LoginAPIView, UserListAPIView

urlpatterns = [
    path("users/", UserListAPIView.as_view(), name="user-list"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("me/", CurrentUserAPIView.as_view(), name="current-user"),
]
