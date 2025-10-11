from rest_framework import generics, permissions
from .models import Message
from .serializers import MessageSerializer

class DeptMessagesView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Check if user is admin
        try:
            role_name = getattr(user, 'role_name', None) or getattr(getattr(user, 'role', None), 'name', None)
        except Exception:
            role_name = None

        is_admin = role_name and role_name.lower() == 'admin'

        # Base queryset with proper relations
        qs = Message.objects.select_related('sender', 'sender__department', 'sender__role', 'receiver', 'dept')

        if is_admin:
            # Admins can filter by department via ?dept_id=
            dept_id = self.request.query_params.get('dept_id')
            if dept_id and dept_id != 'all':
                qs = qs.filter(dept_id=dept_id)
            # Otherwise return all messages
            return qs.order_by('-timestamp')
        else:
            # Non-admins only see their department messages
            if not user.department:
                return Message.objects.none()
            return qs.filter(dept=user.department).order_by('-timestamp')
    
    def perform_create(self, serializer):
        # Ensure message is saved with proper context
        serializer.save()
