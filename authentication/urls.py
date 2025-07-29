from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserProfileView, logout_view

urlpatterns = [
    # JWT Token endpoints
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Custom auth endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', logout_view, name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
] 