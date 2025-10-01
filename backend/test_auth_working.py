import os
import django
import requests
from django.contrib.auth import get_user_model

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

User = get_user_model()

def test_authentication():
    # Test data
    test_email = 'test@volo.africa'
    test_password = 'Test@1234'
    
    print(f"Testing authentication for user: {test_email}")
    
    # Ensure test user exists with known password
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
    
    # Test login endpoint
    print("\nTesting login endpoint...")
    response = requests.post(
        'http://localhost:8000/api/auth/token/',
        data={
            'email': test_email,
            'password': test_password
        },
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    
    print(f"Status Code: {response.status_code}")
    print("Response:", response.json())
    
    if response.status_code == 200:
        access_token = response.json().get('access')
        print("\nTesting authenticated endpoint with token...")
        
        # Test authenticated endpoint
        response = requests.get(
            'http://localhost:8000/api/auth/user/',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
        )
        
        print(f"Status Code: {response.status_code}")
        print("User Info:", response.json())

if __name__ == '__main__':
    test_authentication()
