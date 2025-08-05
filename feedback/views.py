
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import models
from django_filters import rest_framework as filters

#import models and serializers
from .models import Board, Tag, Feedback, Comment
from .serializers import BoardSerializer, TagSerializer, FeedbackSerializer, CommentSerializer
from .permissions import IsBoardMemberOrPublic, IsBoardCreator, IsBoardEditorOrCreator, IsFeedbackCreatorOrModerator, IsFeedbackBoardMember

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
            permission_classes = [IsBoardEditorOrCreator]
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
        
        # Check if user has permission to edit the board
        if not (board.created_by == self.request.user or 
                self.request.user in board.allowed_users.all() or
                board.allowed_roles.filter(user=self.request.user).exists()):
            raise permissions.PermissionDenied("You don't have permission to edit this board")
        
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_authenticated:
            raise permissions.PermissionDenied("You must be logged in to delete boards")
        
        # Check if user has permission to delete the board
        if not (instance.created_by == self.request.user or 
                self.request.user in instance.allowed_users.all() or
                instance.allowed_roles.filter(user=self.request.user).exists()):
            raise permissions.PermissionDenied("You don't have permission to delete this board")
        
        instance.delete()

    @action(detail=False, methods=['get'])
    def available_users(self, request):
        """Get list of available users for board access assignment"""
        # Temporarily allow unauthenticated access for testing
        # if not request.user.is_authenticated:
        #     return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        users = User.objects.all().values('id', 'username', 'first_name', 'last_name', 'email')
        return Response(users)

    @action(detail=False, methods=['get'])
    def available_roles(self, request):
        """Get list of available roles for board access assignment"""
        # Temporarily allow unauthenticated access for testing
        # if not request.user.is_authenticated:
        #     return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
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

class FeedbackFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=Feedback.STATUS_CHOICES)
    board = filters.NumberFilter()
    created_by = filters.NumberFilter()
    tags = filters.NumberFilter(field_name='tags', lookup_expr='id')
    
    class Meta:
        model = Feedback
        fields = ['status', 'board', 'created_by', 'tags']

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = FeedbackFilter
    
    def get_queryset(self):
        user = self.request.user
        
        # Get base queryset
        queryset = Feedback.objects.select_related('board', 'created_by').prefetch_related('tags', 'upvotes')
        
        if user.is_admin() or user.is_moderator():
            return queryset
        else:
            # Regular users can only see feedback from boards they have access to
            return queryset.filter(
                models.Q(board__is_public=True) |
                models.Q(board__created_by=user) |
                models.Q(board__allowed_users=user) |
                models.Q(board__allowed_roles__user=user)
            ).distinct()
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsFeedbackCreatorOrModerator]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Validate that user has access to the board
        board = serializer.validated_data.get('board')
        user = self.request.user
        
        # Check if user has access to the board
        if not (board.is_public or 
                board.created_by == user or 
                user in board.allowed_users.all() or
                board.allowed_roles.filter(user=user).exists()):
            raise permissions.PermissionDenied("You don't have permission to create feedback on this board")
        
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        feedback = self.get_object()
        
        # Check if user has permission to edit the feedback
        if not (feedback.created_by == self.request.user or 
                self.request.user.is_admin() or 
                self.request.user.is_moderator()):
            raise permissions.PermissionDenied("You don't have permission to edit this feedback")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Check if user has permission to delete the feedback
        if not (instance.created_by == self.request.user or 
                self.request.user.is_admin() or 
                self.request.user.is_moderator()):
            raise permissions.PermissionDenied("You don't have permission to delete this feedback")
        
        instance.delete()

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
        
        if not (request.user.is_admin() or request.user.is_moderator() or feedback.created_by == request.user):
            return Response(
                {'error': 'Only admins, moderators, or the feedback creator can change status'}, 
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

    @action(detail=False, methods=['get'])
    def by_board(self, request):
        """Get feedback filtered by board"""
        board_id = request.query_params.get('board_id')
        if board_id:
            queryset = self.get_queryset().filter(board_id=board_id)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response({'error': 'board_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def most_upvoted(self, request):
        """Get feedback sorted by most upvoted"""
        queryset = self.get_queryset().annotate(
            upvotes_count=models.Count('upvotes')
        ).order_by('-upvotes_count')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def kanban(self, request):
        """Get feedback grouped by status for Kanban board"""
        try:
            queryset = self.get_queryset()
            
            # Group feedback by status
            kanban_data = {}
            for status_choice in Feedback.STATUS_CHOICES:
                status_key = status_choice[0]
                status_label = status_choice[1]
                
                status_feedbacks = queryset.filter(status=status_key).order_by('-created_at')
                serializer = self.get_serializer(status_feedbacks, many=True)
                
                kanban_data[status_key] = {
                    'label': status_label,
                    'feedbacks': serializer.data
                }
            
            return Response(kanban_data)
        except Exception as e:
            print(f"Error in kanban endpoint: {e}")
            return Response({'error': str(e)}, status=500)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin() or user.is_moderator():
            return Comment.objects.all()
        else:
            # Regular users can only see comments from boards they have access to
            return Comment.objects.filter(
                models.Q(feedback__board__is_public=True) |
                models.Q(feedback__board__created_by=user) |
                models.Q(feedback__board__allowed_users=user) |
                models.Q(feedback__board__allowed_roles__user=user)
            ).distinct()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
