from django.contrib import admin

# Register your models here.

from .models import Matrix, MatrixGroup

admin.site.register(Matrix)
admin.site.register(MatrixGroup)