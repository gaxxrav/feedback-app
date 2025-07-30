from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin()

class IsModeratorUser(permissions.BasePermission):
    """
    Custom permission to only allow moderator users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin() or request.user.is_moderator()
        )

class IsContributorUser(permissions.BasePermission):
    """
    Custom permission to only allow contributor users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

class IsBoardMember(permissions.BasePermission):
    """
    Custom permission to only allow board members.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Check if user is a member of the board
        if hasattr(obj, 'board'):
            return obj.board.members.filter(id=request.user.id).exists()
        elif hasattr(obj, 'members'):
            return obj.members.filter(id=request.user.id).exists()
        return False

class IsFeedbackCreator(permissions.BasePermission):
    """
    Custom permission to only allow feedback creators or admins/moderators.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admins and moderators can edit any feedback
        if request.user.is_admin() or request.user.is_moderator():
            return True
        
        # Creator can edit their own feedback
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False 