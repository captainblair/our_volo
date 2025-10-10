from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from .models import Role, Department
from .serializers import (
    RegisterSerializer, 
    UserSerializer, 
    RoleSerializer, 
    DepartmentSerializer,
    ProfilePictureSerializer
)
from .permissions import IsAdmin

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('role','department')
    serializer_class = UserSerializer
    
    def get_permissions(self):
        # Allow authenticated users to list/retrieve (for department members view)
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        # Only admins can create/update/delete
        return [IsAdmin()]
    
    def get_queryset(self):
        # Regular users can only see users in their department
        user = self.request.user
        if hasattr(user, 'role') and user.role and user.role.name == 'Admin':
            return User.objects.all().select_related('role', 'department')
        # Regular users see only their department members
        if hasattr(user, 'department') and user.department:
            return User.objects.filter(department=user.department).select_related('role', 'department')
        return User.objects.none()
    
    @action(detail=True, methods=['post'])
    def assign_role(self, request, pk=None):
        user = self.get_object()
        role_id = request.data.get('role_id')
        department_id = request.data.get('department_id')
        
        if role_id:
            try:
                role = Role.objects.get(id=role_id)
                user.role = role
            except Role.DoesNotExist:
                return Response({'error': 'Role not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        if department_id:
            try:
                department = Department.objects.get(id=department_id)
                user.department = department
            except Department.DoesNotExist:
                return Response({'error': 'Department not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdmin]

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
    def get_permissions(self):
        # Allow anyone to list/retrieve departments (for registration)
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        # Only admins can create/update/delete
        return [IsAdmin()]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_profile_picture(request):
    """
    Upload a profile picture for the authenticated user.
    """
    if 'profile_picture' not in request.FILES:
        return Response(
            {'error': 'No file was provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate file size (max 2MB)
    if request.FILES['profile_picture'].size > 2 * 1024 * 1024:
        return Response(
            {'error': 'File size should not exceed 2MB'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/gif']
    if request.FILES['profile_picture'].content_type not in allowed_types:
        return Response(
            {'error': 'Only JPEG, PNG, and GIF images are allowed'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update the user's profile picture
    user = request.user
    serializer = ProfilePictureSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response(
            {'profile_picture': request.build_absolute_uri(user.profile_picture.url)},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
