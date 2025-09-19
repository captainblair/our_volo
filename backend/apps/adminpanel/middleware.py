from .models import AuditLog

EXCLUDE_PATHS = ['/admin/', '/static/', '/api/auth/token/', '/api/auth/token/refresh/']

class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        try:
            path = request.path
            if any(path.startswith(p) for p in EXCLUDE_PATHS):
                return response
            user = getattr(request, 'user', None)
            if user and user.is_authenticated:
                action = f"{request.method} {path}"
                AuditLog.objects.create(action=action, user=user)
        except Exception:
            # Do not break the app on logging failure
            pass
        return response
