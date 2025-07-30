from django.urls import path
from .views import UserRoleView, AdminUserListView, UpdateUserRoleView

urlpatterns = [
    path('roles/', UserRoleView.as_view(), name='user-role'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/role/', UpdateUserRoleView.as_view(), name='update-user-role'),
]
