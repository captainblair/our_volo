from rest_framework import viewsets, permissions, filters
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsDeptManagerOrAssignee

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsDeptManagerOrAssignee]
    filter_backends = [filters.SearchFilter]
    search_fields = ['task_title','status']

    def get_queryset(self):
        # Only tasks in user's department
        return Task.objects.filter(dept=self.request.user.department).select_related('assigned_to','assigned_by','dept')

    def perform_update(self, serializer):
        # Prevent changing dept/assigned_by
        serializer.save()
