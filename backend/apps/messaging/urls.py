from django.urls import path
from .views import DeptMessagesView
urlpatterns = [ path('department/', DeptMessagesView.as_view(), name='dept-messages') ]
