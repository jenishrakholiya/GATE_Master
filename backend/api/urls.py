# File: backend/api/urls.py

from django.urls import path
from .views import (
    health_check, 
    RegisterView, 
    VerifyEmailView, 
    MyTokenObtainPairView,
    QuizGenerationView,
    QuestionAnswerView,
    AnalyticsSummaryView,
    NewsArticleListView,
    ChallengeListView, 
    StartChallengeView,
    SubmitChallengeView, 
    ChallengeResultView,
    LeaderboardView,
    StudyMaterialListView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from .views import QuizSubmissionView

urlpatterns = [
    path('health-check/', health_check, name='health-check'),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('analytics/summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
    path('practice/quiz/<str:subject>/', QuizGenerationView.as_view(), name='generate-quiz'),
    path('practice/submit/', QuizSubmissionView.as_view(), name='submit-quiz'),
    path('practice/question/<int:pk>/answer/', QuestionAnswerView.as_view(), name='question-answer'),
    path('challenges/', ChallengeListView.as_view(), name='challenge-list'),
    path('challenges/start/', StartChallengeView.as_view(), name='challenge-start'),
    path('challenges/submit/', SubmitChallengeView.as_view(), name='challenge-submit'),
    path('challenges/result/<int:pk>/', ChallengeResultView.as_view(), name='challenge-result'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('information/news/', NewsArticleListView.as_view(), name='news-list'),
    path('materials/', StudyMaterialListView.as_view(), name='material-list'),
]