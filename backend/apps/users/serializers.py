from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Role, Department

User = get_user_model()

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), source='role', write_only=True, required=False, allow_null=True)
    department_id = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), source='department', write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id','username','first_name','last_name','email','phone_number','role','department','role_id','department_id','email_confirmed']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirmation = serializers.CharField(write_only=True)
    agree_terms = serializers.BooleanField(write_only=True)
    subscribe_emails = serializers.BooleanField(write_only=True, required=False, default=True)
    
    class Meta:
        model = User
        fields = ['first_name','last_name','email','phone_number','password','password_confirmation','agree_terms','subscribe_emails']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirmation']:
            raise serializers.ValidationError("Passwords don't match")
        
        if not attrs.get('agree_terms'):
            raise serializers.ValidationError("You must agree to the terms and conditions")
        
        # Password validation
        password = attrs['password']
        if len(password) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in password):
            raise serializers.ValidationError("Password must contain at least 1 uppercase letter")
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
            raise serializers.ValidationError("Password must contain at least 1 special character")
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirmation')
        validated_data.pop('agree_terms')
        validated_data.pop('subscribe_emails')
        password = validated_data.pop('password')
        
        # Generate username from email
        email = validated_data['email']
        username = email.split('@')[0]
        counter = 1
        original_username = username
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        
        user = User(username=username, **validated_data)
        user.set_password(password)
        user.save()
        return user
