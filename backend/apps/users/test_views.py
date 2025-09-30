from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import json

User = get_user_model()

@csrf_exempt
def list_users(request):
    try:
        users = User.objects.all()
        user_list = []
        for user in users:
            user_list.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'date_joined': str(user.date_joined)
            })
        return JsonResponse({'users': user_list, 'count': len(user_list)})
    except Exception as e:
        return JsonResponse({'error': str(e)})

@csrf_exempt
def test_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            # Check if user exists
            try:
                user = User.objects.get(email=email)
                user_exists = True
                password_correct = user.check_password(password)
                is_active = user.is_active
            except User.DoesNotExist:
                user_exists = False
                password_correct = False
                is_active = False
            
            return JsonResponse({
                'email': email,
                'user_exists': user_exists,
                'password_correct': password_correct,
                'is_active': is_active,
                'debug': f'Testing login for {email}'
            })
        except Exception as e:
            return JsonResponse({'error': str(e)})
    
    return JsonResponse({'method': request.method, 'available_endpoints': ['/api/users/list-users/', '/api/users/test-login/']})