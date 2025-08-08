import json  # FIX 1: Add the missing import
from django.db import transaction
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import CustomUser, Question, QuizResult
from .serializers import RegisterSerializer, MyTokenObtainPairSerializer, QuizQuestionSerializer
from .utils import send_verification_email


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_data(request):
    user = request.user
    data = {
        'username': user.username,
        'email': user.email,
        'date_joined': user.date_joined.strftime('%Y-%m-%d'),
    }
    return Response(data)


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
        # Ensure revealed_ids are integers for comparison
        revealed_ids = request.data.get('revealed_ids', [])
        revealed_ids_set = set(revealed_ids)

        if not all_question_ids:
            return Response({"detail": "Question IDs are missing."}, status=status.HTTP_400_BAD_REQUEST)

        all_questions_in_quiz = Question.objects.filter(id__in=all_question_ids)
        total_questions = all_questions_in_quiz.count()
        
        # FIX 1: Correctly calculate total_marks, excluding revealed questions
        total_marks = sum(q.marks for q in all_questions_in_quiz if q.id not in revealed_ids_set)

        answered_question_ids = answers_data.keys()
        answered_questions = all_questions_in_quiz.filter(id__in=answered_question_ids)
        questions_map = {str(q.id): q for q in answered_questions}
        
        score = 0
        correct_count = 0 # NEW: Initialize correct answer counter
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
                    correct_count += 1 # NEW: Increment counter if correct
            
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
            'detailed_results': detailed_results
        }, status=status.HTTP_200_OK)
    
class QuestionAnswerView(generics.RetrieveAPIView):
    """
    Provides the correct answer and explanation for a single question.
    """
    permission_classes = [IsAuthenticated]
    queryset = Question.objects.all()

    # We're not using a full serializer, just returning specific fields
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {
            'correct_answer': instance.correct_answer,
            'explanation': instance.explanation
        }
        return Response(data)