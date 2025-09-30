from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, MeView, UserViewSet, RoleViewSet, DepartmentViewSet
from .test_views import test_login, list_users

router = DefaultRouter()
router.register(r'roles', RoleViewSet, basename='roles')
router.register(r'departments', DepartmentViewSet, basename='departments')
router.register(r'manage', UserViewSet, basename='users')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('test-login/', test_login, name='test_login'),
    path('list-users/', list_users, name='list_users'),
    path('', include(router.urls)),
]
