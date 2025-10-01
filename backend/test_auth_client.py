import os
import django
import logging

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('auth_test.log')
    ]
)

logger = logging.getLogger(__name__)

from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()

def test_authentication():
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
    
    logger.info(f"Testing authentication for user: {user.email}")
    
    # Test 1: Login with form data
    logger.info("\nTest 1: Login with form data")
    try:
        response = client.post(
            '/api/auth/token/',
            data=f'email={test_email}&password={test_password}',
            content_type='application/x-www-form-urlencoded',
            HTTP_HOST='localhost'
        )
        logger.info(f"Status code: {response.status_code}")
        try:
            logger.info(f"Response: {response.json()}")
        except Exception as e:
            logger.error(f"Error parsing JSON response: {e}")
            logger.info(f"Raw response: {response.content}")
    except Exception as e:
        logger.error(f"Error during form data login: {e}", exc_info=True)
    
    # Test 2: Login with JSON data
    logger.info("\nTest 2: Login with JSON data")
    try:
        import json
        response = client.post(
            '/api/auth/token/',
            data=json.dumps({'email': test_email, 'password': test_password}),
            content_type='application/json',
            HTTP_HOST='localhost'
        )
        logger.info(f"Status code: {response.status_code}")
        try:
            logger.info(f"Response: {response.json()}")
        except Exception as e:
            logger.error(f"Error parsing JSON response: {e}")
            logger.info(f"Raw response: {response.content}")
    except Exception as e:
        logger.error(f"Error during JSON login: {e}", exc_info=True)
    
    # Test 3: Get user info with token
    if response.status_code == 200:
        logger.info("\nTest 3: Get user info with token")
        token = response.json().get('access')
        response = client.get(
            '/api/auth/user/',
            HTTP_AUTHORIZATION=f'Bearer {token}',
            HTTP_HOST='localhost'
        )
        logger.info(f"Status code: {response.status_code}")
        logger.info(f"User info: {response.json()}")

if __name__ == '__main__':
    test_authentication()
