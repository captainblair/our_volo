import logging
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()

def authenticate_user(email, password):
    try:
        user = User.objects.get(email=email)
        if not user.check_password(password):
            logger.warning(f"Invalid password for user: {email}")
            return None
        return user
    except User.DoesNotExist:
        logger.warning(f"No user found with email: {email}")
        return None
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        raise e
