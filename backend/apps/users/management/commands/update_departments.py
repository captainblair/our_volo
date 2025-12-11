from django.core.management.base import BaseCommand
from apps.users.models import Department, User, Role
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Update departments to ride-hailing company structure'

    def handle(self, *args, **options):
        # First, set all users' departments to None
        User.objects.update(department=None)
        
        # Clear existing departments
        Department.objects.all().delete()
        
        # Create new ride-hailing departments
        departments = [
            'Driver Management',
            'Operations & Dispatch', 
            'Customer Support',
            'Product & Engineering',
            'Data Analytics',
            'Marketing & Growth',
            'Finance & Accounting',
            'Legal & Compliance',
            'Human Resources',
            'Safety & Security',
            'Quality Assurance',
            'Corporate Accounts',
            'Parcel Delivery'
        ]
        
        created_depts = []
        for dept_name in departments:
            dept = Department.objects.create(name=dept_name)
            created_depts.append(dept)
            self.stdout.write(f'Created: {dept_name}')
        
        # Update admin user to Driver Management department
        try:
            admin_role = Role.objects.get(name='Admin')
            driver_mgmt = Department.objects.get(name='Driver Management')
            
            admin_user, created = User.objects.get_or_create(
                email='admin@voloafrica.com',
                defaults={
                    'username': 'admin@voloafrica.com',
                    'first_name': 'Admin',
                    'last_name': 'User',
                    'password': make_password('Admin@123'),
                    'role': admin_role,
                    'department': driver_mgmt,
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True
                }
            )
            
            if not created:
                admin_user.department = driver_mgmt
                admin_user.save()
                self.stdout.write('Updated admin user department')
            
        except Exception as e:
            self.stdout.write(f'⚠️ Error updating admin: {e}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(created_depts)} departments!')
        )
        self.stdout.write('Admin login: admin@voloafrica.com / Admin@123')