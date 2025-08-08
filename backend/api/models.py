# File: backend/api/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

# ... (Your existing CustomUser model remains here) ...
class CustomUser(AbstractUser):
    pass


# Add the new Question model below
class Question(models.Model):
    SUBJECT_CHOICES = [
        ('MATH', 'Engineering Mathematics'),
        ('DL', 'Digital Logic'),
        ('COA', 'Computer Organization and Architecture'),
        ('PROG', 'Programming and Data Structures'),
        ('ALGO', 'Algorithms'),
        ('TOC', 'Theory of Computation'),
        ('CD', 'Compiler Design'),
        ('OS', 'Operating Systems'),
        ('DB', 'Database Management Systems'),
        ('CN', 'Computer Networks'),
        ('GA', 'General Aptitude'),
    ]

    DIFFICULTY_CHOICES = [
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    ]

    TYPE_CHOICES = [
        ('MCQ', 'Multiple Choice Question'), # Single correct answer
        ('MSQ', 'Multiple Select Question'),  # One or more correct answers
        ('NAT', 'Numerical Answer Type'),   # Answer is a number
    ]

    subject = models.CharField(max_length=4, choices=SUBJECT_CHOICES)
    topic = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=6, choices=DIFFICULTY_CHOICES, default='MEDIUM')
    question_type = models.CharField(max_length=4, choices=TYPE_CHOICES, default='MCQ')
    
    question_text = models.TextField()
    # For MCQ/MSQ, this will store a list of options, e.g., ["Option A", "Option B", ...]. For NAT, it can be empty.
    options = models.JSONField(blank=True, null=True) 
    
    # For MCQ, stores the correct option key (e.g., "A"). For MSQ, a list (e.g., ["A", "C"]). For NAT, the numerical answer.
    correct_answer = models.CharField(max_length=200) 
    explanation = models.TextField(blank=True, null=True)
    marks = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.get_subject_display()} - {self.topic} ({self.id})"
    
class QuizResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=4, choices=Question.SUBJECT_CHOICES)
    score = models.IntegerField()
    total_marks = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_subject_display()} - {self.score}/{self.total_marks}"