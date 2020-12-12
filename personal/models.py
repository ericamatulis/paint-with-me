from django.db import models

# Create your models here.


from django.core.exceptions import ValidationError


class Matrix(models.Model):
    matrix_name = models.CharField(max_length=200, unique=True)
    matrix_value = models.TextField()
    dimension = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['matrix_name']
        db_table = 'image'
        verbose_name = 'Image'
        verbose_name_plural = "Images"
    
    def __str__(self):
        return self.matrix_name
    
class Category(models.Model):
    category_name = models.CharField(max_length=200, unique=True)
    category_summary = models.CharField(max_length=200, default="")
    matrices = models.ManyToManyField(Matrix)
    
    class Meta:
        ordering = ['category_name']
        db_table = 'image_category'
        verbose_name = 'Image Category'
        verbose_name_plural = "Image Categories"
        
    def __str__(self):
        return self.category_name
 

class Group(models.Model):
    group_name = models.CharField(max_length=200, unique=True)
    group_summary = models.CharField(max_length=200, default="")
    matrices = models.ManyToManyField(Matrix)
    
    class Meta:
        ordering = ['group_name']
        db_table = 'image_group'
        verbose_name_plural = "Image Groups"
        verbose_name = "Image Group"
        
    def __str__(self):
        return self.group_name
 
