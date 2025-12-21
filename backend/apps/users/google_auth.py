import requests
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    try:
        credential = request.data.get('credential')
        if not credential:
            return Response({'error': 'Google credential is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify Google ID token
        response = requests.get(
            f'https://oauth2.googleapis.com/tokeninfo?id_token={credential}'
        )
        
        if response.status_code != 200:
            return Response({'error': 'Invalid Google credential'}, status=status.HTTP_400_BAD_REQUEST)
        
        google_data = response.json()
        
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
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)