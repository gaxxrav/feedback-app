from rest_framework import routers
from feedback.views import BoardViewSet, TagViewSet, FeedbackViewSet, CommentViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'boards', BoardViewSet)
router.register(r'tags', TagViewSet)
router.register(r'feedback', FeedbackViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
