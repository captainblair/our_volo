import logging
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
from .authentication import EmailTokenObtainPairSerializer

DEBUG = getattr(settings, 'DEBUG', False)

logger = logging.getLogger(__name__)

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        # Log the raw request data
        logger.info(f"Raw request data: {request.data}")
        logger.info(f"Request content type: {request.content_type}")
        
        # Handle both form data and JSON
        if request.content_type == 'application/x-www-form-urlencoded':
            email = request.POST.get('email') or request.data.get('email')
            password = request.POST.get('password') or request.data.get('password')
        else:
            email = request.data.get('email')
            password = request.data.get('password')
            
        logger.info(f"Login attempt for email: {email}")
        
        try:
            # Log the incoming request data
            logger.debug(f"Request data: {request.data}")
            logger.debug(f"Request POST: {request.POST}")
            
            # Try to get the user for additional context
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(email=email) if email else None
                if user:
                    logger.info(f"User found: {user.email}, is_active: {user.is_active}")
                    # Verify password
                    if not user.check_password(password):
                        logger.warning(f"Invalid password for user: {email}")
                        return Response(
                            {"detail": "Invalid email or password"},
                            status=status.HTTP_401_UNAUTHORIZED
                        )
                else:
                    logger.warning(f"No user found with email: {email}")
                    return Response(
                        {"detail": "Invalid email or password"},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Exception as user_lookup_error:
                logger.error(f"Error looking up user: {str(user_lookup_error)}", exc_info=True)
                return Response(
                    {"detail": "Error during authentication"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Attempt authentication
            logger.info("Attempting authentication...")
            response = super().post(request, *args, **kwargs)
            logger.info(f"Authentication successful for user: {email}")
            return response
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            logger.error(f"Request data: {request.data}")
            logger.error(f"Request headers: {request.headers}")
            
            if DEBUG:
                raise
                
            return Response(
                {"detail": "An error occurred during authentication"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )