import os
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings

def user_profile_picture_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/profile_pictures/user_<id>/<filename>
    return f'profile_pictures/user_{instance.id}/{filename}'

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self):
        return self.name

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to=user_profile_picture_path,
        null=True,
        blank=True,
        help_text='Profile picture for the user'
    )
    role = models.ForeignKey(Role, on_delete=models.PROTECT, null=True, blank=True, related_name='users')
    department = models.ForeignKey(Department, on_delete=models.PROTECT, null=True, blank=True, related_name='users')
    email_confirmed = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.username} ({self.email})"

    @property
    def role_name(self):
        return self.role.name if self.role else None
