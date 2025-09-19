from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIF_TYPES = [
        ('task_assigned','Task Assigned'),
        ('task_completed','Task Completed'),
        ('message','New Message'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=NOTIF_TYPES)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.type} -> {self.user_id}: {self.message[:30]}"
