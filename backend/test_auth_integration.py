import os
import django
import json

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from rest_framework import status

User = get_user_model()

class AuthIntegrationTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.test_email = 'test@volo.africa'
        self.test_password = 'Test@1234'
        self.user = self.create_test_user()
    
    def create_test_user(self):
        """Create a test user if it doesn't exist"""
        user, created = User.objects.get_or_create(
            email=self.test_email,
            defaults={
                'username': 'testuser',
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True,
                'is_staff': False,
                'email_confirmed': True
            }
        )
        if created or not user.check_password(self.test_password):
            user.set_password(self.test_password)
            user.save()
        return user
    
    def test_successful_login(self):
        """Test successful login with correct credentials"""
        # Test with form data
        response = self.client.post(
            '/api/auth/token/',
            {'email': self.test_email, 'password': self.test_password},
            content_type='application/x-www-form-urlencoded',
            HTTP_HOST='localhost'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.json())
        self.assertIn('refresh', response.json())
        self.assertIn('user_id', response.json())
        self.assertEqual(response.json()['email'], self.test_email)
    
    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        # Test with wrong password
        response = self.client.post(
            '/api/auth/token/',
            {'email': self.test_email, 'password': 'wrongpassword'},
            content_type='application/x-www-form-urlencoded',
            HTTP_HOST='localhost'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.json())
        self.assertEqual(response.json()['detail'], 'Invalid email or password')
    
    def test_missing_credentials(self):
        """Test login with missing credentials"""
        # Test with missing email
        response = self.client.post(
            '/api/auth/token/',
            {'password': self.test_password},
            content_type='application/x-www-form-urlencoded',
            HTTP_HOST='localhost'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test with missing password
        response = self.client.post(
            '/api/auth/token/',
            {'email': self.test_email},
            content_type='application/x-www-form-urlencoded',
            HTTP_HOST='localhost'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

if __name__ == '__main__':
    import unittest
    unittest.main()
