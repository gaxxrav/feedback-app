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
    created_by = serializers.ReadOnlyField(source='created_by.username')
    upvotes_count = serializers.SerializerMethodField()
    is_upvoted = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'title', 'description', 'status', 'board', 'created_by',
            'tags', 'upvotes', 'upvotes_count', 'is_upvoted', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'upvotes_count', 'is_upvoted']
    
    def get_upvotes_count(self, obj):
        return obj.upvotes.count()
    
    def get_is_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(id=request.user.id).exists()
        return False
    
    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long.")
        return value.strip()
    
    def validate_description(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long.")
        return value.strip()
    
    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in Feedback.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(valid_statuses)}")
        return value

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Comment
        fields = ['id', 'feedback', 'user', 'parent', 'content', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'user']
    
    def validate_content(self, value):
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Comment content cannot be empty.")
        return value.strip()
