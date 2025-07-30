from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserRole

User = get_user_model()

class UserRoleSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = UserRole
        fields = ['id', 'user', 'username', 'email', 'first_name', 'last_name', 'role', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'role']
        read_only_fields = ['id', 'date_joined']

    def get_role(self, obj):
        try:
            return obj.role.role
        except UserRole.DoesNotExist:
            return 'contributor'
