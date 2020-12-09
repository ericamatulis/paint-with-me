from django.db import models

# Create your models here.


from django.core.exceptions import ValidationError


class Matrix(models.Model):
    matrix_name = models.CharField(max_length=200, unique=True)
    matrix_value = models.TextField()
    dimension = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['matrix_name']
    
    def __str__(self):
        return self.matrix_name
    
class MatrixGroup(models.Model):
    category_name = models.CharField(max_length=200, unique=True)
    category_summary = models.CharField(max_length=200)
    matrices = models.ManyToManyField(Matrix)
    
    class Meta:
        ordering = ['category_name']
        
    def __str__(self):
        return self.category_name
#    matrix_name = models.ForeignKey(Matrix, default=1, verbose_name="Matrix",on_delete=models.SET_DEFAULT)

    
    

    

