from django.contrib import admin

# Register your models here.

from .models import Matrix, Category, Group

admin.site.register(Matrix)
admin.site.register(Category)
admin.site.register(Group)