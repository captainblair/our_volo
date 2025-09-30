from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test user for authentication testing'

    def handle(self, *args, **options):
        email = 'test@volo.africa'
        password = 'Test@123'
        
        # Delete existing user if exists
        User.objects.filter(email=email).delete()
        
        # Create new user
        user = User.objects.create_user(
            username='testuser',
            email=email,
            password=password,
            first_name='Test',
            last_name='User',
            phone_number='+1234567890',
            email_confirmed=True
        )
        
        self.stdout.write(f'Created test user: {email}')
        self.stdout.write(f'Password: {password}')
        
        # Test password verification
        if user.check_password(password):
            self.stdout.write(self.style.SUCCESS('✓ Password verification works'))
        else:
            self.stdout.write(self.style.ERROR('✗ Password verification failed'))
        
        self.stdout.write(f'User is active: {user.is_active}')
        self.stdout.write(f'User ID: {user.id}')