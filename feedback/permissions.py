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

class IsBoardEditorOrCreator(permissions.BasePermission):
    """
    Permission to allow board creators and users with edit permissions to modify/delete boards
    """
    
    def has_object_permission(self, request, view, obj):
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

class IsFeedbackCreatorOrModerator(permissions.BasePermission):
    """
    Permission to allow feedback creators or moderators/admins to edit/delete feedback
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admins and moderators can edit any feedback
        if request.user.is_admin() or request.user.is_moderator():
            return True
        
        # Creator can edit their own feedback
        return obj.created_by == request.user

class IsFeedbackBoardMember(permissions.BasePermission):
    """
    Permission to allow board members to create feedback
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Check if user has access to the board this feedback belongs to
        board = obj.board
        
        # Public boards are accessible by anyone
        if board.is_public:
            return True
            
        # Board creator always has access
        if request.user == board.created_by:
            return True
            
        # Check if user is explicitly allowed
        if request.user in board.allowed_users.all():
            return True
            
        # Check if user has any of the allowed roles
        if board.allowed_roles.filter(user=request.user).exists():
            return True
            
        return False 