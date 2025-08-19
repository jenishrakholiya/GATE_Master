import json
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Avg, F, Max, Count
from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    CustomUser, Question, QuizResult, NewsArticle, 
    Challenge, ChallengeAttempt, StudyMaterial
)
from .serializers import (
    RegisterSerializer, MyTokenObtainPairSerializer, QuizQuestionSerializer, 
    QuizResultSerializer, NewsArticleSerializer, ChallengeSerializer, 
    ChallengeAttemptSerializer, ChallengeResultSerializer, StudyMaterialSerializer
)
from .utils import send_verification_email


# ====================================================================
# CORE & AUTHENTICATION VIEWS
# ====================================================================

@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok', 'message': 'Django backend is running!'})

class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = CustomUser.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
            is_active=False
        )
        send_verification_email(user)
        return Response(
            {"detail": "User registered successfully. Please check your email to verify your account."},
            status=status.HTTP_201_CREATED
        )

class VerifyEmailView(views.APIView):
    permission_classes = (AllowAny,)
    def get(self, request, uidb64, token, *args, **kwargs):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            user = None
        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"detail": "Email successfully verified."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid verification link."}, status=status.HTTP_400_BAD_REQUEST)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# ====================================================================
# PRACTICE ZONE VIEWS
# ====================================================================

class QuizGenerationView(generics.ListAPIView):
    serializer_class = QuizQuestionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        subject = self.kwargs['subject']
        valid_subjects = [choice[0] for choice in Question.SUBJECT_CHOICES]
        if subject not in valid_subjects:
            return Question.objects.none()
        return Question.objects.filter(subject=subject).order_by('?')[:20]

class QuizSubmissionView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        answers_data = request.data.get('answers', {})
        subject = request.data.get('subject')
        all_question_ids = request.data.get('question_ids', [])
        revealed_ids = request.data.get('revealed_ids', [])
        revealed_ids_set = set(revealed_ids)

        if not all_question_ids:
            return Response({"detail": "Question IDs are missing."}, status=status.HTTP_400_BAD_REQUEST)

        all_questions_in_quiz = Question.objects.filter(id__in=all_question_ids)
        total_questions = all_questions_in_quiz.count()
        
        # --- UPDATED LOGIC ---
        total_marks = sum(q.marks for q in all_questions_in_quiz if q.id not in revealed_ids_set)
        
        score = 0
        correct_count = 0
        positive_marks = 0.0 
        detailed_results = []

        for question in all_questions_in_quiz:
            question_id_str = str(question.id)
            user_answer = answers_data.get(question_id_str)
            is_correct = False
            was_revealed = question.id in revealed_ids_set

            if user_answer is not None and not was_revealed:
                correct_answer_str = str(question.correct_answer).strip()
                
                if question.question_type == 'MSQ':
                    user_answer_sorted = "".join(sorted(user_answer))
                    correct_answer_sorted = "".join(sorted(correct_answer_str))
                    if user_answer_sorted == correct_answer_sorted:
                        is_correct = True
                else:
                    if str(user_answer).strip() == correct_answer_str:
                        is_correct = True
                
                if is_correct:
                    score += question.marks
                    positive_marks += question.marks 
                    correct_count += 1
            
            detailed_results.append({
                'id': question.id,
                'question_text': question.question_text,
                'options': question.options or {},
                'question_type': question.question_type,
                'user_answer': user_answer,
                'correct_answer': question.correct_answer,
                'explanation': question.explanation,
                'is_correct': is_correct,
                'was_revealed': was_revealed,
            })
        
        if subject:
            QuizResult.objects.create(
                user=request.user,
                subject=subject,
                score=score,
                total_marks=total_marks
            )

        return Response({
            'score': score,
            'total_marks': total_marks,
            'correct_count': correct_count,
            'total_questions': total_questions,
            'positive_marks': positive_marks, 
            'negative_marks': 0, 
            'detailed_results': detailed_results
        }, status=status.HTTP_200_OK)

class QuestionAnswerView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Question.objects.all()
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {'correct_answer': instance.correct_answer, 'explanation': instance.explanation}
        return Response(data)

# ====================================================================
# CHALLENGE ZONE VIEWS
# ====================================================================

class ChallengeListView(generics.ListAPIView):
    queryset = Challenge.objects.filter(is_active=True)
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated]

class StartChallengeView(views.APIView):
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        challenge_id = request.data.get('challenge_id')
        if not challenge_id:
            return Response({"detail": "Challenge ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            challenge = Challenge.objects.get(id=challenge_id, is_active=True)
        except Challenge.DoesNotExist:
            return Response({"detail": "Challenge not found or is not active."}, status=status.HTTP_404_NOT_FOUND)
        questions_to_add = []
        try:
            for subject_code, count in challenge.config.items():
                questions = Question.objects.filter(subject=subject_code).order_by('?')[:count]
                if questions.count() < count:
                    return Response({"detail": f"Not enough questions for subject {subject_code}. Required: {count}, Found: {questions.count()}"}, status=status.HTTP_400_BAD_REQUEST)
                questions_to_add.extend(questions)
        except Exception as e:
            return Response({"detail": f"Invalid challenge configuration: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        attempt = ChallengeAttempt.objects.create(user=request.user, challenge=challenge)
        attempt.questions.set(questions_to_add)
        serializer = ChallengeAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SubmitChallengeView(views.APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        attempt_id = request.data.get('attempt_id')
        answers_data = request.data.get('answers', {})
        try:
            attempt = ChallengeAttempt.objects.get(id=attempt_id, user=request.user, status='IN_PROGRESS')
        except ChallengeAttempt.DoesNotExist:
            return Response({"detail": "Active challenge attempt not found."}, status=status.HTTP_404_NOT_FOUND)
        questions = attempt.questions.all()
        score = 0.0
        for question in questions:
            question_id_str = str(question.id)
            user_answer = answers_data.get(question_id_str)
            if user_answer is None or user_answer == '' or user_answer == []:
                continue
            is_correct = False
            correct_answer_str = str(question.correct_answer).strip()
            if question.question_type == 'MSQ':
                user_answer_sorted = "".join(sorted(user_answer))
                correct_answer_sorted = "".join(sorted(correct_answer_str))
                if user_answer_sorted == correct_answer_sorted:
                    is_correct = True
            else: 
                if str(user_answer).strip() == correct_answer_str:
                    is_correct = True
            if is_correct:
                score += question.marks
            elif question.question_type == 'MCQ':
                if question.marks == 1:
                    score -= 1/3
                elif question.marks == 2:
                    score -= 2/3
        attempt.score = round(score, 2)
        attempt.end_time = timezone.now()
        attempt.status = 'COMPLETED'
        attempt.answers = answers_data
        attempt.save()
        return Response({'attempt_id': attempt.id, 'score': attempt.score}, status=status.HTTP_200_OK)

class ChallengeResultView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChallengeResultSerializer
    def get_queryset(self):
        return ChallengeAttempt.objects.filter(user=self.request.user, status='COMPLETED')

# ====================================================================
# INFORMATION & ANALYTICS VIEWS
# ====================================================================

class AnalyticsSummaryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        results = QuizResult.objects.filter(user=user)
        
        if not results.exists():
            return Response({
                "overall_accuracy": 0, "quizzes_taken": 0,
                "subject_performance": [], "recent_activity": [],
                "subject_distribution": [] # Add new key for empty state
            })

        # 1. Overall Performance (unchanged)
        overall_stats = results.aggregate(total_score=Sum('score'), total_possible=Sum('total_marks'))
        overall_accuracy = (overall_stats['total_score'] / overall_stats['total_possible']) * 100 if overall_stats['total_possible'] > 0 else 0

        # 2. Subject-wise Performance (unchanged)
        subject_performance = results.values('subject').annotate(
            subject_name=F('subject'),
            avg_accuracy=Avg(F('score') * 100.0 / F('total_marks'))
        ).order_by('-avg_accuracy')
        
        subject_map = dict(Question.SUBJECT_CHOICES)
        subject_performance_data = [{**item, 'subject_name': subject_map.get(item['subject_name'])} for item in subject_performance]

        # 3. Recent Activity (now fetches last 10 for the trend chart)
        recent_activity = results.order_by('-timestamp')[:10]
        recent_activity_data = QuizResultSerializer(recent_activity, many=True).data

        # 4. NEW: Calculate Subject Distribution (for the doughnut chart)
        subject_distribution = results.values('subject').annotate(
            count=Count('id')
        ).order_by('-count')
        subject_distribution_data = [{**item, 'subject_name': subject_map.get(item['subject'])} for item in subject_distribution]

        response_data = {
            "overall_accuracy": round(overall_accuracy, 2),
            "quizzes_taken": results.count(),
            "subject_performance": subject_performance_data,
            "recent_activity": recent_activity_data,
            "subject_distribution": subject_distribution_data, 
        }
        
        return Response(response_data)

class NewsArticleListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = NewsArticleSerializer
    def get_queryset(self):
        two_months_ago = timezone.now() - relativedelta(months=2)
        return NewsArticle.objects.filter(publication_date__gte=two_months_ago)
    

class LeaderboardView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # --- 1. Get the Top 100 users based on their max score ---
        top_users_data = ChallengeAttempt.objects.filter(status='COMPLETED').values(
            'user__username' # Group by username
        ).annotate(
            max_score=Max('score') # Find the max score for each user
        ).order_by('-max_score')[:100] # Order by score descending, take top 100

        # Add rank to the top users data
        top_100_leaderboard = []
        for i, user_data in enumerate(top_users_data, 1):
            top_100_leaderboard.append({
                'rank': i,
                'username': user_data['user__username'],
                'score': user_data['max_score'],
            })
            
        # --- 2. Get the current user's personal rank and best score ---
        current_user = request.user
        user_best_attempt = ChallengeAttempt.objects.filter(
            user=current_user, status='COMPLETED'
        ).order_by('-score').first()

        current_user_rank_data = None
        if user_best_attempt:
            # Count how many unique users have a better max score
            higher_ranked_users_count = ChallengeAttempt.objects.filter(
                status='COMPLETED', 
                score__gt=user_best_attempt.score
            ).values('user').distinct().count()
            
            user_rank = higher_ranked_users_count + 1
            current_user_rank_data = {
                'rank': user_rank,
                'username': current_user.username,
                'score': user_best_attempt.score,
            }

        # --- 3. Compile the final response ---
        response_data = {
            'leaderboard': top_100_leaderboard,
            'user_rank': current_user_rank_data,
        }

        return Response(response_data)
    
# ====================================================================
# MATERIAL ZONE VIEWS
# ====================================================================

class StudyMaterialListView(generics.ListAPIView):
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Optionally filters the materials by a 'subject' query parameter.
        e.g., /api/materials/?subject=ALGO
        """
        queryset = StudyMaterial.objects.all()
        subject = self.request.query_params.get('subject')
        if subject:
            queryset = queryset.filter(subject=subject)
        return queryset