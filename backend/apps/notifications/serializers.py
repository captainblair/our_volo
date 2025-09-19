from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id','user','type','message','is_read','timestamp']
        read_only_fields = ['id','user','type','message','timestamp']
