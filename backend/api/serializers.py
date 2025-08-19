import json
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    CustomUser, Question, QuizResult, NewsArticle, 
    Challenge, ChallengeAttempt, StudyMaterial
)

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password2')
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_active:
            raise serializers.ValidationError("Account not active. Please verify your email first.")
        return data

class QuizQuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_image', 'question_type', 'options', 'marks']
    def get_options(self, obj):
        if obj.options:
            try:
                # If options is a string, load it as JSON
                return json.loads(obj.options)
            except (json.JSONDecodeError, TypeError):
                # If it's already a dict (from JSONField), return it directly
                return obj.options
        return {}

class QuizResultSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(source='get_subject_display')
    class Meta:
        model = QuizResult
        fields = ['id', 'subject', 'score', 'total_marks', 'timestamp']

class NewsArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = ['id', 'title', 'link', 'description', 'publication_date', 'source']


# --- SERIALIZERS FOR CHALLENGE ZONE ---

class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = ['id', 'title', 'description']

class ChallengeAttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for when a challenge is started.
    Returns the attempt ID and the full list of (safe) questions.
    """

    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = ChallengeAttempt
        fields = ['id', 'challenge', 'status', 'start_time', 'questions']

class ChallengeResultSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    detailed_results = serializers.SerializerMethodField()
    correct_count = serializers.SerializerMethodField()
    positive_marks = serializers.SerializerMethodField()
    negative_marks = serializers.SerializerMethodField()

    class Meta:
        model = ChallengeAttempt
        fields = ['id', 'score', 'challenge_title', 'end_time', 'correct_count', 
                  'positive_marks', 'negative_marks', 'detailed_results']

    def _get_scoring_details(self, obj):
        # Helper method to avoid redundant calculations
        if hasattr(self, '_scoring_details'):
            return self._scoring_details

        correct_count = 0
        positive_marks = 0.0
        negative_marks = 0.0

        for question in obj.questions.all():
            user_answer = obj.answers.get(str(question.id))
            if user_answer is None or user_answer == '' or user_answer == []:
                continue

            is_correct = False
            correct_answer_str = str(question.correct_answer).strip()
            
            if question.question_type == 'MSQ':
                user_answer_sorted = "".join(sorted(user_answer))
                correct_answer_sorted = "".join(sorted(correct_answer_str))
                if user_answer_sorted == correct_answer_sorted:
                    is_correct = True
            else: # MCQ and NAT
                if str(user_answer).strip() == correct_answer_str:
                    is_correct = True

            if is_correct:
                correct_count += 1
                positive_marks += question.marks
            elif question.question_type == 'MCQ': # Incorrect MCQ
                if question.marks == 1:
                    negative_marks += 1/3
                elif question.marks == 2:
                    negative_marks += 2/3

        self._scoring_details = {
            'correct_count': correct_count,
            'positive_marks': round(positive_marks, 2),
            'negative_marks': round(negative_marks, 2),
        }
        return self._scoring_details

    def get_correct_count(self, obj):
        return self._get_scoring_details(obj)['correct_count']

    def get_positive_marks(self, obj):
        return self._get_scoring_details(obj)['positive_marks']

    def get_negative_marks(self, obj):
        return self._get_scoring_details(obj)['negative_marks']

    def get_detailed_results(self, obj):
        results = []
        request = self.context.get('request')
        for question in obj.questions.all().order_by('id'):
            user_answer = obj.answers.get(str(question.id))
            is_correct = False
            
            correct_answer_str = str(question.correct_answer).strip()
            if user_answer is not None:
                if question.question_type == 'MSQ':
                    if isinstance(user_answer, list):
                        user_answer = "".join(sorted(user_answer))
                    correct_answer_sorted = "".join(sorted(correct_answer_str))
                    if user_answer == correct_answer_sorted:
                        is_correct = True
                else:
                    if str(user_answer).strip() == correct_answer_str:
                        is_correct = True
            
            image_url = None
            if question.question_image and hasattr(question.question_image, 'url'):
                image_url = request.build_absolute_uri(question.question_image.url) if request else question.question_image.url
            
            results.append({
                'id': question.id,
                'question_text': question.question_text,
                'question_image': image_url,
                'options': question.options or {},
                'user_answer': user_answer,
                'correct_answer': question.correct_answer,
                'explanation': question.explanation,
                'is_correct': is_correct,
            })
        return results
    
class StudyMaterialSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='get_subject_display', read_only=True)
    # --- NEW: Use a method to build the full file URL ---
    file = serializers.SerializerMethodField()

    class Meta:
        model = StudyMaterial
        fields = ['id', 'title', 'description', 'subject', 'subject_name', 'file', 'uploaded_at']

    def get_file(self, obj):
        # Get the request from the context
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            # build_absolute_uri creates the full URL, e.g., http://localhost:8000/media/...
            return request.build_absolute_uri(obj.file.url)
        return None