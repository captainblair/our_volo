from django.core.management.base import BaseCommand
from apps.users.models import Role, Department, User

class Command(BaseCommand):
    help = 'Initialize system with default roles, departments, and admin user'

    def handle(self, *args, **kwargs):
        # Create Roles
        roles_data = ['Admin', 'Manager', 'Employee']
        for role_name in roles_data:
            role, created = Role.objects.get_or_create(name=role_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role: {role_name}'))
            else:
                self.stdout.write(f'Role already exists: {role_name}')

        # Create Departments
        departments_data = [
            'Engineering',
            'Marketing',
            'Sales',
            'Human Resources',
            'Finance',
            'Operations',
            'Customer Support'
        ]
        for dept_name in departments_data:
            dept, created = Department.objects.get_or_create(name=dept_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created department: {dept_name}'))
            else:
                self.stdout.write(f'Department already exists: {dept_name}')

        # Create default admin user if no admin exists
        admin_role = Role.objects.get(name='Admin')
        admin_exists = User.objects.filter(role=admin_role).exists()
        
        if not admin_exists:
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@voloafrica.com',
                password='Admin@123',
                first_name='System',
                last_name='Administrator',
                role=admin_role,
                department=Department.objects.first(),
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(self.style.SUCCESS(f'Created admin user: {admin_user.email}'))
            self.stdout.write(self.style.WARNING('Default password: Admin@123 - CHANGE THIS IMMEDIATELY!'))
        else:
            self.stdout.write('Admin user already exists')

        self.stdout.write(self.style.SUCCESS('\nSystem initialization complete!'))
