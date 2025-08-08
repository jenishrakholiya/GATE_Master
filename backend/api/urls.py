# File: backend/api/urls.py

from django.urls import path
from .views import (
    health_check, 
    RegisterView, 
    VerifyEmailView, 
    MyTokenObtainPairView,
    get_dashboard_data ,
    QuizGenerationView,
    QuestionAnswerView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from .views import QuizSubmissionView

urlpatterns = [
    path('health-check/', health_check, name='health-check'),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard/', get_dashboard_data, name='dashboard-data'),
    path('practice/quiz/<str:subject>/', QuizGenerationView.as_view(), name='generate-quiz'),
    path('practice/submit/', QuizSubmissionView.as_view(), name='submit-quiz'),
    path('practice/question/<int:pk>/answer/', QuestionAnswerView.as_view(), name='question-answer'),
]