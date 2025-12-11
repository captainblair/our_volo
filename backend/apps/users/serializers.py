from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.conf import settings
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

    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone_number', 
                 'role', 'department', 'role_id', 'department_id', 'email_confirmed', 'profile_picture', 'date_joined']
        read_only_fields = ['id', 'profile_picture', 'date_joined']
    
    def get_profile_picture(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirmation = serializers.CharField(write_only=True)
    agree_terms = serializers.BooleanField(write_only=True)
    subscribe_emails = serializers.BooleanField(write_only=True, required=False, default=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), 
        source='department', 
        write_only=True, 
        required=True,
        error_messages={'required': 'Please select a department'}
    )
    
    class Meta:
        model = User
        fields = ['first_name','last_name','email','phone_number','department_id','password','password_confirmation','agree_terms','subscribe_emails']

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
        validated_data.pop('subscribe_emails', None)
        password = validated_data.pop('password')
        
        # Generate username from email
        email = validated_data['email']
        username = email.split('@')[0]
        counter = 1
        original_username = username
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        
        # Assign default "Staff" role to new users
        try:
            staff_role = Role.objects.get(name='Staff')
            validated_data['role'] = staff_role
        except Role.DoesNotExist:
            pass  # If Staff role doesn't exist, user will have no role
        
        user = User(username=username, **validated_data)
        user.set_password(password)
        user.save()
        return user


class ProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['profile_picture']
        extra_kwargs = {
            'profile_picture': {'required': True}
        }
    
    def update(self, instance, validated_data):
        # Delete old profile picture if it exists
        if instance.profile_picture:
            instance.profile_picture.delete(save=False)
        
        # Set and save the new profile picture
        instance.profile_picture = validated_data['profile_picture']
        instance.save()
        return instance
