from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Check user authentication data'

    def handle(self, *args, **options):
        email = input("Enter user email to check: ")
        try:
            user = User.objects.get(email=email)
            self.stdout.write(self.style.SUCCESS(f'User found: {user}'))
            self.stdout.write(f'User active: {user.is_active}')
            self.stdout.write(f'User password set: {bool(user.password)}')
            self.stdout.write(f'Email confirmed: {user.email_confirmed}')
            
            # Try to authenticate
            if user.check_password(input("Enter password to verify: ")):
                self.stdout.write(self.style.SUCCESS('Password matches!'))
            else:
                self.stdout.write(self.style.ERROR('Password does not match!'))
                
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User with email {email} not found'))
