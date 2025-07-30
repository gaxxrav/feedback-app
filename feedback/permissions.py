from rest_framework import permissions

class IsBoardMemberOrPublic(permissions.BasePermission):
    """
    Custom permission to allow access to boards based on:
    - Public boards: accessible by anyone
    - Private boards: only accessible by:
      - Board creator
      - Users explicitly allowed
      - Users with allowed roles
    """
    
    def has_object_permission(self, request, view, obj):
        # Public boards are accessible by anyone
        if obj.is_public:
            return True
            
        # Board creator always has access
        if request.user == obj.created_by:
            return True
            
        # Check if user is explicitly allowed
        if request.user in obj.allowed_users.all():
            return True
            
        # Check if user has any of the allowed roles
        if obj.allowed_roles.filter(user=request.user).exists():
            return True
            
        return False

class IsBoardCreator(permissions.BasePermission):
    """
    Permission to allow only board creators to modify their boards
    """
    
    def has_object_permission(self, request, view, obj):
        return request.user == obj.created_by 