import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .authentication import EmailTokenObtainPairSerializer

# Setup logger
logger = logging.getLogger(__name__)

class EmailTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view that authenticates users by email instead of username.
    Includes detailed logging for debugging and error tracking.
    """
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        logger.info("🔐 Login request received")

        # Log the request content type and data
        logger.debug(f"Request content type: {request.content_type}")
        logger.debug(f"Raw request data: {request.data}")

        # Handle both JSON and form-encoded requests
        if request.content_type == 'application/x-www-form-urlencoded':
            email = request.POST.get('email') or request.data.get('email')
            password = request.POST.get('password') or request.data.get('password')
        else:
            email = request.data.get('email')
            password = request.data.get('password')

        logger.info(f"Login attempt for email: {email}")

        # Validate that email and password were provided
        if not email or not password:
            logger.warning("Email or password not provided in request")
            return Response(
                {"detail": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        User = get_user_model()

        try:
            user = User.objects.get(email=email)
            logger.debug(f"User found: {user.email}, active: {user.is_active}")

            # Validate password
            if not user.check_password(password):
                logger.warning(f"Invalid password for user: {email}")
                return Response(
                    {"detail": "Invalid email or password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        except User.DoesNotExist:
            logger.warning(f"No user found with email: {email}")
            return Response(
                {"detail": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as user_error:
            logger.error(f"Unexpected error during user lookup: {user_error}", exc_info=True)
            return Response(
                {"detail": "Error during authentication process"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Try generating JWT token via SimpleJWT
        try:
            logger.info(f"Authenticating user {email} through SimpleJWT serializer...")
            response = super().post(request, *args, **kwargs)
            logger.info(f"✅ Authentication successful for user: {email}")
            return response

        except Exception as e:
            logger.error(f"JWT generation error for {email}: {e}", exc_info=True)
            if getattr(settings, 'DEBUG', False):
                raise
            return Response(
                {"detail": "An internal authentication error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
