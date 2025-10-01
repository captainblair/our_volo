import os
import django
import logging

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
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
    
    # Test login with form data
    logger.info("\nTesting login with form data...")
    response = client.post(
        '/api/auth/token/',
        {'email': test_email, 'password': test_password},
        content_type='application/x-www-form-urlencoded',
        HTTP_HOST='localhost'
    )
    
    logger.info(f"Status code: {response.status_code}")
    logger.info(f"Response: {response.json()}")
    
    # Test login with JSON data
    logger.info("\nTesting login with JSON data...")
    response = client.post(
        '/api/auth/token/',
        {'email': test_email, 'password': test_password},
        content_type='application/json',
        HTTP_HOST='localhost'
    )
    
    logger.info(f"Status code: {response.status_code}")
    logger.info(f"Response: {response.json()}")

if __name__ == '__main__':
    test_authentication()
