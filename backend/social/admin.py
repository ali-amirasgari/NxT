from django.contrib import admin

from .models import Category, Comment, CommentLike, Post, PostLike, PostSave, PostShare


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'goal', 'category', 'visibility', 'media_type', 'created_at')
    list_filter = ('visibility', 'media_type', 'media_tone', 'category')
    search_fields = ('title', 'caption', 'author__username', 'author__email')
    autocomplete_fields = ('author', 'goal', 'category')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'created_at')
    search_fields = ('body', 'author__username', 'post__title')
    autocomplete_fields = ('post', 'author', 'parent')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'created_at')
    autocomplete_fields = ('post', 'user')


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ('comment', 'user', 'created_at')
    autocomplete_fields = ('comment', 'user')


@admin.register(PostSave)
class PostSaveAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'created_at')
    autocomplete_fields = ('post', 'user')


@admin.register(PostShare)
class PostShareAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'target_user', 'channel', 'created_at')
    list_filter = ('channel',)
    autocomplete_fields = ('post', 'user', 'target_user')
