from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Task, Comment
from .serializers import TaskSerializer, CommentSerializer
from .permissions import IsDeptManagerOrAssignee, IsTaskParticipant

class TaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tasks to be viewed or edited.
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsDeptManagerOrAssignee]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['task_title', 'task_desc', 'status', 'priority']
    ordering_fields = ['created_at', 'due_date', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        This view should return a list of all tasks for the user's department.
        """
        queryset = Task.objects.filter(dept=self.request.user.department)
        
        # Filter by status if provided
        status = self.request.query_params.get('status', None)
        if status is not None:
            queryset = queryset.filter(status=status)
            
        # Filter by assignee if provided
        assignee = self.request.query_params.get('assigned_to', None)
        if assignee is not None:
            queryset = queryset.filter(assigned_to_id=assignee)
            
        # Filter by priority if provided
        priority = self.request.query_params.get('priority', None)
        if priority is not None:
            queryset = queryset.filter(priority=priority)
            
        return queryset.select_related('assigned_to', 'assigned_by', 'dept')
        
    def perform_create(self, serializer):
        """Set the assigned_by and department fields to the current user's values."""
        serializer.save(
            assigned_by=self.request.user,
            dept=self.request.user.department
        )
    
    @action(detail=True, methods=['get', 'post'], permission_classes=[IsTaskParticipant])
    def comments(self, request, pk=None):
        """
        List all comments for a task or create a new comment.
        """
        task = self.get_object()
        
        if request.method == 'GET':
            comments = task.comments.all().select_related('user')
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
            
        elif request.method == 'POST':
            serializer = CommentSerializer(
                data=request.data,
                context={'request': request, 'task_id': task.id}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsDeptManagerOrAssignee])
    def change_status(self, request, pk=None):
        """
        Change the status of a task.
        Expected payload: {"status": "new_status"}
        """
        task = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {"status": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if new_status not in dict(Task.STATUS_CHOICES).keys():
            return Response(
                {"status": [f"Invalid status. Must be one of: {', '.join(dict(Task.STATUS_CHOICES).keys())}"]},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        task.status = new_status
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)
