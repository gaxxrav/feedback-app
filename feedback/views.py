
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import models

#import models and serializers
from .models import Board, Tag, Feedback, Comment
from .serializers import BoardSerializer, TagSerializer, FeedbackSerializer, CommentSerializer
from .permissions import IsBoardMemberOrPublic, IsBoardCreator

from core.permissions import IsAdminUser, IsModeratorUser, IsBoardMember, IsFeedbackCreator

User = get_user_model()

class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.is_admin():
                return Board.objects.all()
            elif user.is_moderator():
                return Board.objects.all()
            else:
                # Users can see boards they have access to:
                # - Public boards
                # - Boards they created
                # - Boards they're explicitly allowed to access
                # - Boards where they have allowed roles
                return Board.objects.filter(
                    models.Q(is_public=True) |
                    models.Q(created_by=user) |
                    models.Q(allowed_users=user) |
                    models.Q(allowed_roles__user=user)
                ).distinct()
        else:
            # Unauthenticated users can only see public boards
            return Board.objects.filter(is_public=True)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsBoardCreator]
        else:
            permission_classes = [IsBoardMemberOrPublic]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        if not self.request.user.is_authenticated:
            raise permissions.PermissionDenied("You must be logged in to create boards")
        board = serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        board = self.get_object()
        if not self.request.user.is_authenticated:
            raise permissions.PermissionDenied("You must be logged in to edit boards")
        
        # Only the creator can edit the board
        if board.created_by != self.request.user:
            raise permissions.PermissionDenied("Only the board creator can edit this board")
        
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_authenticated:
            raise permissions.PermissionDenied("You must be logged in to delete boards")
        
        # Only the creator can delete the board
        if instance.created_by != self.request.user:
            raise permissions.PermissionDenied("Only the board creator can delete this board")
        
        instance.delete()

    @action(detail=False, methods=['get'])
    def available_users(self, request):
        """Get list of available users for board access assignment"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        users = User.objects.all().values('id', 'username', 'first_name', 'last_name', 'email')
        return Response(users)

    @action(detail=False, methods=['get'])
    def available_roles(self, request):
        """Get list of available roles for board access assignment"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        roles = Group.objects.all().values('id', 'name')
        return Response(roles)

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin() or user.is_moderator():
            return Tag.objects.all()
        else:
            # Contributors can see all tags but only admins/moderators can create/edit
            return Tag.objects.all()

    def perform_create(self, serializer):
        if not (self.request.user.is_admin() or self.request.user.is_moderator()):
            raise permissions.PermissionDenied("Only admins and moderators can create tags")
        serializer.save()

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Feedback.objects.all()
        elif user.is_moderator():
            return Feedback.objects.all()
        else:
            # Contributors can only see feedback from boards they're members of
            return Feedback.objects.filter(
                board__members=user
            ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def upvote(self, request, pk=None):
        feedback = self.get_object()
        user = request.user
        
        if feedback.upvotes.filter(id=user.id).exists():
            feedback.upvotes.remove(user)
            return Response({'status': 'unvoted'})
        else:
            feedback.upvotes.add(user)
            return Response({'status': 'upvoted'})

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        feedback = self.get_object()
        new_status = request.data.get('status')
        
        if not (request.user.is_admin() or request.user.is_moderator()):
            return Response(
                {'error': 'Only admins and moderators can change feedback status'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if new_status in dict(Feedback.STATUS_CHOICES):
            feedback.status = new_status
            feedback.save()
            return Response({'status': 'updated'})
        else:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Comment.objects.all()
        elif user.is_moderator():
            return Comment.objects.all()
        else:
            # Contributors can only see comments from boards they're members of
            return Comment.objects.filter(
                feedback__board__members=user
            ).distinct()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
