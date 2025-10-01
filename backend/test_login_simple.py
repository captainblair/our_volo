import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

from django.test import Client

def test_login():
    client = Client(HTTP_HOST='localhost')
    
    # Test data
    test_email = 'test@volo.africa'
    test_password = 'Test@1234'
    
    print(f"Testing login with email: {test_email}")
    
    # Make the login request
    response = client.post(
        '/api/auth/token/',
        data=f'email={test_email}&password={test_password}',
        content_type='application/x-www-form-urlencoded',
        HTTP_HOST='localhost'
    )
    
    # Print results
    print(f"Status Code: {response.status_code}")
    print("Response:")
    print(response.json())

if __name__ == '__main__':
    test_login()
