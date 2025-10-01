import os
import django
import logging

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

# Configure logging
log_file = 'serializer_test.log'
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

logger = logging.getLogger(__name__)

from apps.users.authentication import EmailTokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

def test_serializer():
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
    
    logger.info(f"Testing serializer with user: {user.email}")
    
    # Test 1: Valid credentials
    logger.info("\nTest 1: Valid credentials")
    serializer = EmailTokenObtainPairSerializer(data={
        'email': test_email,
        'password': test_password
    })
    
    if serializer.is_valid():
        logger.info("Serializer validation successful")
        tokens = serializer.validated_data
        logger.info(f"Tokens: {tokens}")
    else:
        logger.error("Serializer validation failed")
        logger.error(f"Errors: {serializer.errors}")
    
    # Test 2: Invalid password
    logger.info("\nTest 2: Invalid password")
    serializer = EmailTokenObtainPairSerializer(data={
        'email': test_email,
        'password': 'wrongpassword'
    })
    
    if serializer.is_valid():
        logger.error("Serializer validation should have failed but succeeded!")
    else:
        logger.info("Serializer validation failed as expected")
        logger.info(f"Errors: {serializer.errors}")
    
    # Test 3: Non-existent email
    logger.info("\nTest 3: Non-existent email")
    serializer = EmailTokenObtainPairSerializer(data={
        'email': 'nonexistent@example.com',
        'password': 'somepassword'
    })
    
    if serializer.is_valid():
        logger.error("Serializer validation should have failed but succeeded!")
    else:
        logger.info("Serializer validation failed as expected")
        logger.info(f"Errors: {serializer.errors}")

if __name__ == '__main__':
    test_serializer()
