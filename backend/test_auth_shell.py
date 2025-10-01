from django.contrib.auth import get_user_model
from django.test import Client
import json

User = get_user_model()

# Test user credentials
test_email = 'test@volo.africa'
test_password = 'Test@1234'

def setup_test_user():
    """Create or update test user"""
    try:
        user = User.objects.get(email=test_email)
        user.set_password(test_password)
        user.is_active = True
        user.save()
        print(f"✓ Updated existing user: {test_email}")
    except User.DoesNotExist:
        user = User.objects.create_user(
            email=test_email,
            password=test_password,
            is_active=True
        )
        print(f"✓ Created new user: {test_email}")
    
    # Verify password
    if user.check_password(test_password):
        print("✓ Password verified successfully")
    else:
        print("✗ Password verification failed")
    
    return user

def test_login():
    """Test login with test user"""
    print("\nTesting login...")
    
    # Create test client
    client = Client()
    
    # Test with form data
    print("\n1. Testing with form data:")
    response = client.post(
        '/api/auth/token/',
        {'email': test_email, 'password': test_password},
        content_type='application/x-www-form-urlencoded'
    )
    print(f"Status Code: {response.status_code}")
    print("Response:", response.json() if response.status_code == 200 else response.content)
    
    # Test with JSON
    print("\n2. Testing with JSON:")
    response = client.post(
        '/api/auth/token/',
        json.dumps({'email': test_email, 'password': test_password}),
        content_type='application/json'
    )
    print(f"Status Code: {response.status_code}")
    print("Response:", response.json() if response.status_code == 200 else response.content)

if __name__ == "__main__":
    # Setup Django environment
    import os
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
    django.setup()
    
    print("=== Setting up test user ===")
    user = setup_test_user()
    
    print("\n=== Testing authentication ===")
    test_login()
