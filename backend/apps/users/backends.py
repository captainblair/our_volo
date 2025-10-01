import logging
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.conf import settings

logger = logging.getLogger(__name__)
User = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Get email from either username parameter or email parameter
        email = username or kwargs.get('email')
        logger.info(f"\n{'='*50}")
        logger.info(f"Authentication attempt for email: {email}")
        logger.info(f"Request: {request}")
        logger.info(f"Auth backends: {settings.AUTHENTICATION_BACKENDS}")
        
        if not email or not password:
            logger.warning("Email or password not provided")
            logger.info(f"Email provided: {bool(email)}")
            logger.info(f"Password provided: {bool(password)}")
            return None
            
        try:
            # Try to find user by email
            logger.info(f"Looking up user with email: {email}")
            user = User.objects.get(email=email)
            logger.info(f"User found: {user.email}")
            logger.info(f"User active status: {user.is_active}")
            logger.info(f"User staff status: {user.is_staff}")
            logger.info(f"User superuser status: {user.is_superuser}")
            
            if not user.is_active:
                logger.warning(f"Authentication failed: User {user.email} is not active")
                return None
                
            logger.info("Checking password...")
            if user.check_password(password):
                logger.info(f"Password validation SUCCESSFUL for user: {user.email}")
                return user
            else:
                logger.warning(f"Password validation FAILED for user: {user.email}")
                # Log the actual password hash for debugging (remove in production)
                logger.debug(f"Password hash: {user.password}")
                return None
                
        except User.DoesNotExist:
            logger.warning(f"No user found with email: {email}")
            # Check if any users exist at all
            if User.objects.count() > 0:
                logger.info(f"Found {User.objects.count()} users in database")
                logger.info("Sample user emails:")
                for u in User.objects.all()[:5]:
                    logger.info(f"- {u.email} (active: {u.is_active})")
            else:
                logger.warning("No users found in the database")
            return None
            
        except Exception as e:
            logger.error(f"Unexpected error during authentication: {str(e)}", exc_info=True)
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Error args: {e.args}")
            return None

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
            logger.debug(f"Retrieved user by ID {user_id}: {user.email}")
            return user
        except User.DoesNotExist:
            logger.warning(f"No user found with ID: {user_id}")
            return None