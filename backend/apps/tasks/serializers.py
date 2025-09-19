from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id','task_title','task_desc','assigned_to','assigned_by','dept','status','created_at','due_date']
        read_only_fields = ['id','created_at','assigned_by','dept']

    def validate(self, attrs):
        request = self.context['request']
        # Ensure assigned_to is in same department as requester
        assigned_to = attrs.get('assigned_to')
        if assigned_to and request.user.department_id != assigned_to.department_id:
            raise serializers.ValidationError('You can only assign tasks within your department.')
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        validated_data['assigned_by'] = request.user
        validated_data['dept'] = request.user.department
        return super().create(validated_data)
