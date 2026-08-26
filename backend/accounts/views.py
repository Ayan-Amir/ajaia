from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers import LoginSerializer, UserSerializer


class UserListAPIView(generics.ListAPIView):
    """Seeded accounts, used by both the login picker and the share picker.

    Public by design: auth is mocked and passwordless for this demo, so the
    account list is not a secret. A real build would require authentication.
    """

    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    queryset = User.objects.filter(is_active=True).order_by("username")


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.get(pk=serializer.validated_data["user_id"])
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data})


class CurrentUserAPIView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
