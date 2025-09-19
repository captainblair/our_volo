from rest_framework import generics, permissions
from .models import Message
from .serializers import MessageSerializer

class DeptMessagesView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(dept=self.request.user.department).select_related('sender','receiver')
