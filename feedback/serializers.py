# serializers are needed to convert model instances to JSON format and vice versa
 # This allows the API to send and receive data in a structured format.

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from .models import Board, Tag, Feedback, Comment

User = get_user_model()

class BoardSerializer(serializers.ModelSerializer):
    allowed_users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        many=True, 
        required=False
    )
    allowed_roles = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), 
        many=True, 
        required=False
    )
    
    class Meta:
        model = Board
        fields = [
            'id', 'name', 'description', 'is_public', 'created_by', 
            'allowed_users', 'allowed_roles', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
