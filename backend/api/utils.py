# File: backend/api/utils.py

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

def send_verification_email(user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # This is the frontend URL that the user will be redirected to
    verification_link = f"http://localhost:3000/verify/{uid}/{token}"
    
    subject = "Verify Your Email for GATE Master"
    message = f"""
    Hello {user.username},

    Thank you for registering at GATE Master. Please click the link below to verify your email address and complete your registration:
    {verification_link}

    If you did not register for this account, please ignore this email.

    Best regards,
    The GATE Master Team
    """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )