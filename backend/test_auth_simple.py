import os
import django
import json

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.test import Client

User = get_user_model()

def test_auth():
    # Create test client
    client = Client()
    
    # Test user credentials
    test_email = 'test@volo.africa'
    test_password = 'Test@1234'
    
    # Create or get test user
    user, created = User.objects.get_or_create(
        email=test_email,
        defaults={
            'is_active': True,
            'is_staff': True
        }
    )
    user.set_password(test_password)
    user.save()
    
    print(f"Created/updated test user: {user.email}")
    print(f"Password correct: {user.check_password(test_password)}")
    
    # Test login with form data
    print("\nTesting login with form data:")
    response = client.post(
        '/api/auth/token/',
        {'email': test_email, 'password': test_password},
        content_type='application/x-www-form-urlencoded',
        HTTP_HOST='localhost'
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Login successful!")
        print("Access token:", response.json().get('access', 'No access token'))
    else:
        print("Login failed")
        print("Response:", response.content.decode())

if __name__ == '__main__':
    test_auth()
