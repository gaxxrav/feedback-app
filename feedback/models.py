
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

'''BOARD-RELATIONSHIPS:
	> a board can have many users
	> a board can have many feedback items'''

class Board(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)  # Changed default to False for better security
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_boards')
    allowed_users = models.ManyToManyField(User, related_name='boards_allowed', blank=True)
    allowed_roles = models.ManyToManyField(Group, related_name='boards_allowed_roles', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
'''	One field: name
	Will be used to group or filter feedback
	Feedbacks can have many tags'''

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
    
'''	Each feedback:
	    > Belongs to one board
	    > Can have many tags
	    > Can be upvoted by many users
	    > has a status (open, in progress, completed)
	    > Tracks who created it'''

class Feedback(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='feedbacks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    tags = models.ManyToManyField(Tag, blank=True, related_name='feedbacks')
    upvotes = models.ManyToManyField(User, blank=True, related_name='upvoted_feedbacks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_feedbacks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
'''	Each comment:
	    > Belongs to a feedback post
	    > Is written by a user
	    > Can optionally reply to another comment (nested comments)'''

class Comment(models.Model):
    feedback = models.ForeignKey(Feedback, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user} on {self.feedback}"