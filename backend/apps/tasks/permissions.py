from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsDeptManagerOrAssignee(BasePermission):
    """
    Permission class that allows department managers to edit tasks,
    assignees to update their own tasks, and read access to department members.
    """
    def has_object_permission(self, request, view, obj):
        # Allow read access to anyone in the department
        if request.method in SAFE_METHODS:
            return obj.dept_id == getattr(request.user.department, 'id', None)
            
        # Managers can modify any task in their department
        if request.user.role and request.user.role.name in ['Admin', 'Department Manager']:
            return obj.dept_id == getattr(request.user.department, 'id', None)
            
        # Assignee can update their own task
        if obj.assigned_to_id == request.user.id:
            return True
            
        return False


class IsTaskParticipant(BasePermission):
    """
    Permission class that allows task participants (assigned user, creator, or department manager)
    to view and add comments to a task.
    """
    def has_object_permission(self, request, view, obj):
        # Allow read access to task participants
        if request.method in SAFE_METHODS:
            return self._is_task_participant(request.user, obj)
            
        # Allow POST for comments to task participants
        if request.method == 'POST':
            return self._is_task_participant(request.user, obj)
            
        return False
    
    def _is_task_participant(self, user, task):
        """Check if the user is a participant in the task."""
        # User is in the same department
        if not hasattr(user, 'department') or user.department_id != task.dept_id:
            return False
            
        # User is the assignee, creator, or a manager
        return (user == task.assigned_to or 
                user == task.assigned_by or 
                (hasattr(user, 'role') and user.role.name in ['Admin', 'Department Manager']))
