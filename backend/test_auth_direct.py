import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.test import Client
import json

User = get_user_model()

# Create test client
client = Client()

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
    
    # Prepare login data
    login_data = {
        'email': test_email,
        'password': test_password
    }
    
    # Make the request with form data
    response = client.post(
        '/api/auth/token/',
        data=login_data,
        content_type='application/x-www-form-urlencoded'
    )
    
    # Print results
    print(f"Status Code: {response.status_code}")
    print("Response:")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 200:
        print("✓ Login successful!")
    else:
        print("✗ Login failed")

if __name__ == "__main__":
    print("=== Setting up test user ===")
    user = setup_test_user()
    
    print("\n=== Testing authentication ===")
    test_login()
