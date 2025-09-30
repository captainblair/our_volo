import os
import django
import sys

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

# Test authentication
print("Testing authentication...")

# List all users
users = User.objects.all()
print(f"\nAll users in database:")
for user in users:
    print(f"- {user.email} (username: {user.username})")

# Test authentication with email
email = "admin@volo.africa"
password = "Admin@123"

print(f"\nTesting authentication with email: {email}")
user = authenticate(username=email, password=password)

if user:
    print(f"✓ Authentication successful! User: {user.email}")
    print(f"  - Username: {user.username}")
    print(f"  - First name: {user.first_name}")
    print(f"  - Last name: {user.last_name}")
    print(f"  - Is active: {user.is_active}")
else:
    print("✗ Authentication failed!")
    
    # Check if user exists
    try:
        user_obj = User.objects.get(email=email)
        print(f"  - User exists: {user_obj.email}")
        print(f"  - Is active: {user_obj.is_active}")
        print(f"  - Password check: {user_obj.check_password(password)}")
    except User.DoesNotExist:
        print(f"  - User with email {email} does not exist")