import logging
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.conf import settings

logger = logging.getLogger(__name__)
User = get_user_model()

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # Use email as the username field
    
    def validate(self, attrs):
        # Get email from the request
        email = attrs.get('email', '').strip()
        password = attrs.get('password', '')
        
        logger.info(f"Authentication attempt for email: {email}")
        
        if not email or not password:
            error_msg = 'Email and password are required'
            logger.warning(error_msg)
            raise serializers.ValidationError(error_msg)
        
        try:
            # Get user by email
            user = User.objects.get(email=email)
            logger.info(f"User found: {user.email}, is_active: {user.is_active}")
            
            # Verify password
            if not user.check_password(password):
                logger.warning(f"Invalid password for user: {email}")
                raise serializers.ValidationError('Invalid email or password')
            
            # Check if user is active
            if not user.is_active:
                logger.warning(f"Login attempt for inactive user: {email}")
                raise serializers.ValidationError('User account is disabled')
            
            # Generate tokens with the user object
            refresh = self.get_token(user)
            logger.info(f"Token generated successfully for user: {email}")
            
            # Return token and user data
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'email': user.email,
                'username': user.username or user.email.split('@')[0]
            }
            
        except User.DoesNotExist:
            logger.warning(f"No user found with email: {email}")
            raise serializers.ValidationError('Invalid email or password')
            
        except Exception as e:
            logger.error(f"Unexpected error during authentication for {email}: {str(e)}", 
                        exc_info=True)
            raise serializers.ValidationError(
                'An error occurred during authentication. Please try again.'
            )
    
    @classmethod
    def get_token(cls, user):
        # Get the token from the parent class
        token = super().get_token(user)
        
        # Add required claims
        token['user_id'] = str(user.id)
        token['email'] = user.email
        token['username'] = user.username or user.email.split('@')[0]
        
        # Add optional claims if available
        if hasattr(user, 'first_name') and user.first_name:
            token['first_name'] = user.first_name
        if hasattr(user, 'last_name') and user.last_name:
            token['last_name'] = user.last_name
            
        # Ensure username is set (use email if username is not available)
        if hasattr(user, 'username') and user.username:
            token['username'] = user.username
        else:
            token['username'] = user.email
            
        # Add any additional claims needed by your application
        token['type'] = 'access'
        
        logger.debug(f"Generated token with claims: {token}")
        return token