from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import Role, Department

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with initial roles, departments, and admin user'

    def handle(self, *args, **options):
        # Create roles
        roles_data = ['Admin', 'Department Manager', 'Staff']
        for role_name in roles_data:
            role, created = Role.objects.get_or_create(name=role_name)
            if created:
                self.stdout.write(f'Created role: {role_name}')

        # Create departments
        departments_data = ['Operations', 'Finance', 'HR', 'Engineering', 'Sales']
        for dept_name in departments_data:
            dept, created = Department.objects.get_or_create(name=dept_name)
            if created:
                self.stdout.write(f'Created department: {dept_name}')

        # Create admin user
        admin_role = Role.objects.get(name='Admin')
        ops_dept = Department.objects.get(name='Operations')
        
        if not User.objects.filter(email='admin@volo.africa').exists():
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@volo.africa',
                password='Admin@123',
                first_name='Alice',
                last_name='Admin',
                role=admin_role,
                department=ops_dept,
                phone_number='+1234567890',
                email_confirmed=True
            )
            self.stdout.write('Created admin user: admin@volo.africa / Admin@123')
        else:
            self.stdout.write('Admin user already exists')

        # Create a test staff user without role/department (to demonstrate role assignment)
        if not User.objects.filter(email='staff@volo.africa').exists():
            staff_user = User.objects.create_user(
                username='staff',
                email='staff@volo.africa',
                password='Staff@123',
                first_name='John',
                last_name='Staff',
                phone_number='+1234567891',
                email_confirmed=True
            )
            self.stdout.write('Created staff user: staff@volo.africa / Staff@123 (no role assigned)')
        
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
        self.stdout.write('\nLogin credentials:')
        self.stdout.write('Admin: admin@volo.africa / Admin@123')
        self.stdout.write('Staff: staff@volo.africa / Staff@123 (needs role assignment)')