from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.tasks.models import Task
from apps.messaging.models import Message
from apps.notifications.models import Notification

@receiver(post_save, sender=Task)
def task_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(user=instance.assigned_to, type='task_assigned',
                                    message=f"New task assigned: {instance.task_title}")
    elif instance.status == 'completed':
        Notification.objects.create(user=instance.assigned_by, type='task_completed',
                                    message=f"Task completed: {instance.task_title}")

@receiver(post_save, sender=Message)
def message_notification(sender, instance, created, **kwargs):
    if created and instance.receiver:
        Notification.objects.create(user=instance.receiver, type='message',
                                    message=f"New message from {instance.sender.username}")
