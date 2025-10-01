from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model, authenticate
from django.conf import settings
import sys

User = get_user_model()

class Command(BaseCommand):
    help = 'Verify user authentication directly in the database'

    def handle(self, *args, **options):
        email = 'wangolotony4@gmail.com'
        password = 'yournewpassword'
        
        self.stdout.write(f"Verifying authentication for: {email}")
        self.stdout.write("-" * 50)
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            self.stdout.write(self.style.SUCCESS(f"User found: {user}"))
            self.stdout.write(f"Active: {user.is_active}")
            self.stdout.write(f"Staff: {user.is_staff}")
            self.stdout.write(f"Superuser: {user.is_superuser}")
            self.stdout.write(f"Password set: {bool(user.password)}")
            
            # Verify password
            password_ok = user.check_password(password)
            self.stdout.write(f"Password check: {'OK' if password_ok else 'FAILED'}")
            
            # Try direct authentication
            auth_user = authenticate(email=email, password=password)
            if auth_user:
                self.stdout.write(self.style.SUCCESS("Authentication SUCCESSFUL"))
            else:
                self.stdout.write(self.style.ERROR("Authentication FAILED"))
                
            # Check database connection
            from django.db import connection
            self.stdout.write("\nDatabase Info:")
            self.stdout.write(f"Database: {settings.DATABASES['default']['NAME']}")
            self.stdout.write(f"User: {settings.DATABASES['default']['USER']}")
            self.stdout.write(f"Host: {settings.DATABASES['default']['HOST']}")
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"User with email {email} does not exist"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))
            import traceback
            traceback.print_exc()
