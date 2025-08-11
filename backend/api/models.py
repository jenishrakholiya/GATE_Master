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
        ('MCQ', 'Multiple Choice Question'),
        ('MSQ', 'Multiple Select Question'),
        ('NAT', 'Numerical Answer Type'),
    ]

    # --- Question Body (Supports both text and image) ---
    question_text = models.TextField(blank=True, null=True)
    question_image = models.ImageField(upload_to='question_images/', blank=True, null=True)

    # --- Text-based Options ---
    # For MCQ/MSQ with text options, e.g., {"A": "Option A", "B": "Option B"}
    options = models.JSONField(blank=True, null=True)

    # --- Image-based Options (NEW) ---
    option_a_image = models.ImageField(upload_to='option_images/', blank=True, null=True)
    option_b_image = models.ImageField(upload_to='option_images/', blank=True, null=True)
    option_c_image = models.ImageField(upload_to='option_images/', blank=True, null=True)
    option_d_image = models.ImageField(upload_to='option_images/', blank=True, null=True)

    # --- Answer (Text-based) & Explanation (Text or Image) ---
    correct_answer = models.CharField(max_length=200)
    explanation = models.TextField(blank=True, null=True)
    explanation_image = models.ImageField(upload_to='explanation_images/', blank=True, null=True)

    # --- Metadata ---
    subject = models.CharField(max_length=4, choices=SUBJECT_CHOICES)
    topic = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=6, choices=DIFFICULTY_CHOICES, default='MEDIUM')
    question_type = models.CharField(max_length=4, choices=TYPE_CHOICES, default='MCQ')
    marks = models.IntegerField(default=1)
    source_paper = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., GATE 2024 Session 1")

    def __str__(self):
        return f"({self.source_paper}) {self.topic} - QID {self.id}"
    
class QuizResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=4, choices=Question.SUBJECT_CHOICES)
    score = models.IntegerField()
    total_marks = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_subject_display()} - {self.score}/{self.total_marks}"
    
class NewsArticle(models.Model):
    title = models.CharField(max_length=255)
    link = models.URLField(max_length=255, unique=True) # unique=True prevents duplicate articles
    description = models.TextField(blank=True, null=True)
    publication_date = models.DateTimeField()
    source = models.CharField(max_length=100)

    class Meta:
        ordering = ['-publication_date'] # Show newest articles first

    def __str__(self):
        return self.title
    
class Challenge(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    config = models.JSONField(
        default=dict,
        help_text="Define the number of questions per subject. E.g., {\"GA\": 10, \"ALGO\": 8}"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ChallengeAttempt(models.Model):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    questions = models.ManyToManyField(Question)
    answers = models.JSONField(default=dict, blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    predicted_rank = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='IN_PROGRESS')
    def __str__(self):
        return f"{self.user.username}'s attempt at {self.challenge.title}"