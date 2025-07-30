from django.db import models
from django.contrib.auth.models import Group, Permission
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRole(models.Model):
    """
    Custom user role model that extends Django's Group system
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('moderator', 'Moderator'), 
        ('contributor', 'Contributor'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='role')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='contributor')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_moderator(self):
        return self.role == 'moderator'
    
    @property
    def is_contributor(self):
        return self.role == 'contributor'

# Add methods to User model
def get_user_role(self):
    """Get the user's role"""
    try:
        return self.role.role
    except UserRole.DoesNotExist:
        return 'contributor'  # Default role

def is_admin(self):
    """Check if user is admin"""
    try:
        return self.role.is_admin
    except UserRole.DoesNotExist:
        return False

def is_moderator(self):
    """Check if user is moderator"""
    try:
        return self.role.is_moderator
    except UserRole.DoesNotExist:
        return False

def is_contributor(self):
    """Check if user is contributor"""
    try:
        return self.role.is_contributor
    except UserRole.DoesNotExist:
        return True

# Add methods to User model
User.add_to_class('get_user_role', get_user_role)
User.add_to_class('is_admin', is_admin)
User.add_to_class('is_moderator', is_moderator)
User.add_to_class('is_contributor', is_contributor)
