from django.urls import path
from .views import AuditLogListView
urlpatterns = [ path('logs/', AuditLogListView.as_view(), name='audit-logs') ]
