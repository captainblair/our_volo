from django.contrib import admin
from .models import Task, Comment


class CommentInline(admin.StackedInline):
    model = Comment
    extra = 0
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('user',)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('task_title', 'assigned_to', 'status', 'priority', 'due_date', 'dept', 'created_at')
    list_filter = ('status', 'priority', 'dept', 'assigned_to')
    search_fields = ('task_title', 'task_desc')
    raw_id_fields = ('assigned_to', 'assigned_by', 'dept')
    date_hierarchy = 'created_at'
    inlines = [CommentInline]
    list_per_page = 25


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('truncated_content', 'user', 'task', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'user__username', 'task__task_title')
    raw_id_fields = ('user', 'task')
    date_hierarchy = 'created_at'
    
    @admin.display(description='Content')
    def truncated_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
