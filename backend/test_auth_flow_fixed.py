import os
import django
import logging

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

# Configure logging
log_file = 'auth_test_fixed.log'
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(log_file, mode='w', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)
logger.info(f"Logging to file: {os.path.abspath(log_file)}")

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

User = get_user_model()

def test_authentication_flow():
    client = Client(HTTP_HOST='localhost')
    
    # Test data
    test_email = 'test@volo.africa'
    test_password = 'Test@1234'
    
    # Ensure test user exists
    user, created = User.objects.get_or_create(
        email=test_email,
        defaults={
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'is_active': True,
            'is_staff': False,
            'email_confirmed': True
        }
    )
    
    if created or not user.check_password(test_password):
        user.set_password(test_password)
        user.save()
    
    logger.info(f"Testing authentication flow for user: {user.email}")
    
    # Test 1: Get tokens with email/password
    logger.info("\n=== Test 1: Get tokens with email/password ===")
    try:
        response = client.post(
            '/api/auth/token/',
            data=f'email={test_email}&password={test_password}',
            content_type='application/x-www-form-urlencoded',
            HTTP_HOST='localhost'
        )
        
        logger.info(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            tokens = response.json()
            logger.info("Successfully obtained tokens!")
            logger.info(f"Access token: {tokens.get('access')[:50]}...")
            logger.info(f"Refresh token: {tokens.get('refresh')[:50]}...")
            
            # Verify the access token
            try:
                access_token = AccessToken(tokens['access'])
                logger.info("\nAccess token claims:")
                for key, value in access_token.payload.items():
                    logger.info(f"  {key}: {value}")
                
                # Test 2: Access protected endpoint
                logger.info("\n=== Test 2: Access protected endpoint ===")
                response = client.get(
                    '/api/auth/user/',
                    HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}',
                    HTTP_HOST='localhost'
                )
                logger.info(f"Status code: {response.status_code}")
                if response.status_code == 200:
                    logger.info("Successfully accessed protected endpoint!")
                    logger.info(f"User data: {response.json()}")
                else:
                    logger.error(f"Failed to access protected endpoint: {response.content}")
                
            except Exception as e:
                logger.error(f"Error verifying token: {str(e)}", exc_info=True)
                
        else:
            logger.error(f"Failed to obtain tokens: {response.content}")
            
    except Exception as e:
        logger.error(f"Error during authentication test: {str(e)}", exc_info=True)

if __name__ == '__main__':
    test_authentication_flow()
