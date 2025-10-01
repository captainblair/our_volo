import os
import django
import json
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'volo_africa.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse

User = get_user_model()

class AuthTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.test_email = 'test@volo.africa'
        self.test_password = 'Test@1234'
        self.user = self.create_test_user()
    
    def create_test_user(self):
        logger.info("Creating test user...")
        try:
            user = User.objects.get(email=self.test_email)
            logger.info(f"Using existing user: {user.email}")
        except User.DoesNotExist:
            user = User.objects.create_user(
                email=self.test_email,
                password=self.test_password,
                is_active=True,
                is_staff=True
            )
            logger.info(f"Created new user: {user.email}")
        return user
    
    def test_simple_login(self):
        """Test the most basic login functionality"""
        logger.info("\n=== Starting simple login test ===")
        
        # 1. Verify user exists and is active
        self.assertTrue(User.objects.filter(email=self.test_email).exists(), 
                       "Test user does not exist")
        
        user = User.objects.get(email=self.test_email)
        self.assertTrue(user.is_active, "User is not active")
        
        # 2. Test login with direct user authentication
        logger.info("Testing direct user authentication...")
        authenticated = self.client.login(
            email=self.test_email, 
            password=self.test_password
        )
        self.assertTrue(authenticated, "Direct login failed")
        
        # 3. Test JWT token endpoint
        logger.info("Testing JWT token endpoint...")
        url = reverse('token_obtain_pair')
        response = self.client.post(
            url,
            data={
                'email': self.test_email,
                'password': self.test_password
            },
            content_type='application/json'
        )
        
        logger.info(f"Status Code: {response.status_code}")
        logger.info(f"Response: {response.content.decode()}")
        
        self.assertEqual(response.status_code, 200, 
                       f"Expected status 200, got {response.status_code}")
        
        try:
            data = response.json()
            self.assertIn('access', data, "Access token not in response")
            self.assertIn('refresh', data, "Refresh token not in response")
            logger.info("JWT token obtained successfully")
        except json.JSONDecodeError:
            self.fail("Response is not valid JSON")

    def test_failed_login(self):
        """Test failed login with incorrect credentials"""
        # Test with wrong password
        response = self.client.post(
            '/api/auth/token/',
            {'email': self.test_email, 'password': 'wrongpassword'},
            content_type='application/x-www-form-urlencoded',
            HTTP_HOST='testserver'
        )
        self.assertEqual(response.status_code, 401)
        
        # Test with non-existent user
        response = self.client.post(
            '/api/auth/token/',
            {'email': 'nonexistent@example.com', 'password': 'anypassword'},
            content_type='application/x-www-form-urlencoded',
            HTTP_HOST='testserver'
        )
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    import unittest
    unittest.main()
