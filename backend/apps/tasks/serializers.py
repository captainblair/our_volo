from rest_framework import serializers
from .models import Task, Comment
from apps.users.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['task_id'] = self.context['task_id']
        return super().create(validated_data)


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_by = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'task_title', 'task_desc', 'assigned_to', 'assigned_by', 'dept', 
            'status', 'priority', 'created_at', 'updated_at', 'due_date', 'comments', 'comment_count'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'assigned_by', 'dept', 'comments', 'comment_count'
        ]

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
        
    def update(self, instance, validated_data):
        # Prevent updating certain fields if needed
        for field in ['assigned_by', 'dept']:
            validated_data.pop(field, None)
        return super().update(instance, validated_data)
