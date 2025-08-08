# File: backend/api/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Question 

class CustomUserAdmin(UserAdmin):
    # You can customize the admin for your user model here if needed
    pass

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'topic', 'question_type', 'difficulty', 'marks')
    list_filter = ('subject', 'difficulty', 'question_type')
    search_fields = ('question_text', 'topic')


admin.site.register(CustomUser, CustomUserAdmin)