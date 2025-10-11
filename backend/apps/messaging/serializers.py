from rest_framework import serializers
from .models import Message
from apps.users.serializers import UserSerializer

class DepartmentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    dept = DepartmentSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id','sender','receiver','dept','message_body','timestamp']
        read_only_fields = ['id','sender','dept','timestamp']

    def create(self, validated_data):
        request = self.context['request']
        validated_data['sender'] = request.user
        validated_data['dept'] = request.user.department
        # Validate receiver department if present
        receiver = validated_data.get('receiver')
        if receiver and receiver.department_id != request.user.department_id:
            raise serializers.ValidationError('Receiver must be in your department.')
        return super().create(validated_data)
