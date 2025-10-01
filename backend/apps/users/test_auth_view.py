from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class TestAuthViews(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            email='testuser@example.com',
            username='testuser',
            password='testpass123',
            is_active=True
        )
        self.login_url = reverse('token_obtain_pair')

    def test_login_success(self):
        """Test successful login"""
        response = self.client.post(
            self.login_url,
            {'email': 'testuser@example.com', 'password': 'testpass123'},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post(
            self.login_url,
            {'email': 'testuser@example.com', 'password': 'wrongpass'},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

    def test_login_inactive_user(self):
        """Test login with inactive user"""
        self.user.is_active = False
        self.user.save()
        
        response = self.client.post(
            self.login_url,
            {'email': 'testuser@example.com', 'password': 'testpass123'},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
