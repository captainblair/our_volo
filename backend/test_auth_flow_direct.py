import os
import django
import logging

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

from django.contrib.auth import authenticate, get_user_model
from django.test import RequestFactory

User = get_user_model()

def test_authentication():
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
    
    # Test 1: Authenticate with email and password
    logger.info("\nTest 1: Authenticate with email and password")
    user = authenticate(email=test_email, password=test_password)
    if user:
        logger.info(f"Authentication successful: {user.email}")
    else:
        logger.error("Authentication failed")
    
    # Test 2: Authenticate with username and password
    logger.info("\nTest 2: Authenticate with username and password")
    user = authenticate(username=user.username, password=test_password)
    if user:
        logger.info(f"Authentication successful: {user.email}")
    else:
        logger.error("Authentication failed")
    
    # Test 3: Test with wrong password
    logger.info("\nTest 3: Test with wrong password")
    user = authenticate(email=test_email, password='wrongpassword')
    if user:
        logger.error("Authentication should have failed but succeeded!")
    else:
        logger.info("Authentication failed as expected with wrong password")
    
    # Test 4: Test with non-existent email
    logger.info("\nTest 4: Test with non-existent email")
    user = authenticate(email='nonexistent@example.com', password=test_password)
    if user:
        logger.error("Authentication should have failed but succeeded!")
    else:
        logger.info("Authentication failed as expected with non-existent email")

if __name__ == '__main__':
    test_authentication()
