from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='tasks')

# Add comment-related endpoints
comment_urls = [
    path('<int:task_pk>/comments/', 
         TaskViewSet.as_view({'get': 'comments', 'post': 'comments'}), 
         name='task-comments'),
    path('<int:task_pk>/change_status/', 
         TaskViewSet.as_view({'post': 'change_status'}), 
         name='task-change-status'),
]

urlpatterns = [
    path('', include(router.urls)),
    path('', include((comment_urls, 'tasks'), namespace='tasks')),
]
