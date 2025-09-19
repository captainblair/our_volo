from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id','action','user','user_email','timestamp']

    def get_user_email(self, obj):
        return getattr(obj.user, 'email', None)
