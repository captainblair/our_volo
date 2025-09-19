from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsDeptManagerOrAssignee(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return obj.dept_id == getattr(request.user.department, 'id', None)
        # Managers can modify; assignee can update status
        if request.user.role and request.user.role.name in ['Admin','Department Manager']:
            return obj.dept_id == getattr(request.user.department, 'id', None)
        # Assignee can only update own task status
        if obj.assigned_to_id == request.user.id:
            return True
        return False
