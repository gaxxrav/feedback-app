from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Board, Tag, Feedback, Comment

# imported from models.py

admin.site.register(Board)
admin.site.register(Tag)
admin.site.register(Feedback)
admin.site.register(Comment)