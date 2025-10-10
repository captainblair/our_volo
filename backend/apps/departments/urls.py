from django.urls import path
from rest_framework.generics import ListAPIView
from apps.users.models import Department
from apps.users.serializers import DepartmentSerializer
from rest_framework.permissions import AllowAny

class DepartmentListView(ListAPIView):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]  # Allow public access for registration

urlpatterns = [ path('', DepartmentListView.as_view(), name='departments-list') ]
