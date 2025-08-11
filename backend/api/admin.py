# File: backend/api/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Question, QuizResult, Challenge, ChallengeAttempt

class CustomUserAdmin(UserAdmin):
    # You can customize the admin for your user model here if needed
    pass

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    # ... (this class is unchanged) ...
    list_display = ('id', 'subject', 'topic', 'question_type', 'difficulty', 'marks', 'source_paper')
    list_filter = ('subject', 'difficulty', 'question_type', 'source_paper')
    search_fields = ('question_text', 'topic', 'source_paper')
    fieldsets = (
        ('Question Metadata', {'fields': ('subject', 'topic', 'source_paper', 'difficulty', 'question_type', 'marks')}),
        ('Question Body', {'fields': ('question_text', 'question_image')}),
        ('Options (Choose one type)', {'description': "...", 'fields': ('options', ('option_a_image', 'option_b_image'), ('option_c_image', 'option_d_image'))}),
        ('Answer and Explanation', {'fields': ('correct_answer', 'explanation', 'explanation_image')}),
    )

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'created_at')
    list_filter = ('is_active',)
    fields = ('title', 'description', 'config', 'is_active')

@admin.register(ChallengeAttempt)
class ChallengeAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge', 'status', 'score', 'start_time')
    list_filter = ('status', 'challenge')


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(QuizResult)