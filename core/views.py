from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import UserRole
from .serializers import UserRoleSerializer, AdminUserSerializer

# Create your views here.

User = get_user_model()

class UserRoleView(generics.RetrieveUpdateAPIView):
    """
    View to get and update user roles (admin only)
    """
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return UserRole.objects.filter(user=self.request.user)

class AdminUserListView(generics.ListAPIView):
    """
    List all users with their roles (admin only)
    """
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]

class UpdateUserRoleView(generics.UpdateAPIView):
    """
    Update a user's role (admin only)
    """
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAdminUser]
