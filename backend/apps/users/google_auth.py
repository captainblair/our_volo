import requests
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.departments.models import Department

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Authenticate user with Google OAuth token
    """
    try:
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify Google token
        google_response = requests.get(
            f'https://www.googleapis.com/oauth2/v1/userinfo?access_token={token}'
        )
        
        if google_response.status_code != 200:
            return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
        
        google_data = google_response.json()
        
        # Extract user info
        email = google_data.get('email')
        first_name = google_data.get('given_name', '')
        last_name = google_data.get('family_name', '')
        
        if not email:
            return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
            }
        )
        
        # If user is new, assign to default department
        if created:
            try:
                default_dept = Department.objects.get(name='IT')  # or any default department
                user.department = default_dept
                user.save()
            except Department.DoesNotExist:
                pass
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'department': user.department.name if user.department else None,
                'role': user.role.name if user.role else 'staff'
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)