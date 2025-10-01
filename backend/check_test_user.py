import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def check_test_user():
    test_email = 'test@volo.africa'
    test_password = 'Test@1234'
    
    # Check if user exists
    try:
        user = User.objects.get(email=test_email)
        print(f"User found: {user.email}")
        print(f"Is active: {user.is_active}")
        print(f"Is staff: {user.is_staff}")
        print(f"Is superuser: {user.is_superuser}")
        print(f"Password correct: {user.check_password(test_password)}")
        
        # Check permissions
        print("\nUser permissions:")
        for perm in user.get_all_permissions():
            print(f"- {perm}")
            
    except User.DoesNotExist:
        print(f"User with email {test_email} does not exist")
        
        # Create test user if it doesn't exist
        print("\nCreating test user...")
        user = User.objects.create_user(
            email=test_email,
            username='testuser',
            password=test_password,
            first_name='Test',
            last_name='User',
            is_active=True,
            is_staff=False
        )
        print(f"Created user: {user.email}")
        print(f"Password set: {user.check_password(test_password)}")

if __name__ == '__main__':
    check_test_user()
