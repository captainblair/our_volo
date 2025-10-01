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

def test_auth():
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
    
    print(f"Testing authentication for user: {user.email}")
    
    # Test 1: Login with form data
    print("\nTest 1: Login with form data")
    response = client.post(
        '/api/auth/token/',
        data=f'email={test_email}&password={test_password}',
        content_type='application/x-www-form-urlencoded',
        HTTP_HOST='localhost'
    )
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test 2: Get user info with token
    if response.status_code == 200:
        token = response.json().get('access')
        print("\nTest 2: Get user info with token")
        response = client.get(
            '/api/auth/user/',
            HTTP_AUTHORIZATION=f'Bearer {token}',
            HTTP_HOST='localhost'
        )
        print(f"Status code: {response.status_code}")
        print(f"User info: {response.json()}")
    
    # Test 3: Login with wrong password
    print("\nTest 3: Login with wrong password")
    response = client.post(
        '/api/auth/token/',
        data='email=test@volo.africa&password=wrongpassword',
        content_type='application/x-www-form-urlencoded',
        HTTP_HOST='localhost'
    )
    print(f"Status code: {response.status_code}")
    print(f"Error response: {response.json()}")

if __name__ == '__main__':
    test_auth()
