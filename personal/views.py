from django.shortcuts import render, get_object_or_404, redirect
from personal.models import Matrix, Category, Group
from django.db import transaction
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import logout, authenticate, login
from django.contrib import messages
import json


# Create your views here.

# Main view (draw/view images)
def index(request):
    
    # If user is authenticated, show views
    if request.user.is_authenticated:
        # Get URL parameters
        category = request.GET.get('category','0') # Category to filter for in the view (if != 0)
        dimensions = request.GET.get('dimensions','0') # Dimension to set in the view (if > 0)
        matrix_input = request.GET.get('matrix_input','0') # Whether to show or not the matrix table
        
        # Get list of matrices to show in view, based on parameters above
        if int(dimensions) < 1:
            # If to show all dimensions and categories, get all matrices
            if category == '0':
                matrix_list = Matrix.objects.all()
            # If to show all dimensions but a specific category, get all matrices in that category
            else:
                matrix_list = Category.objects.get(category_name=category).matrices.all()
        else:
            # If to show a specific dimension and all categories, get all matrices with a specific dimension
            if category == '0':
                matrix_list = Matrix.objects.filter(dimension=int(dimensions))
            # If to show a specific dimension and category, get all matrices in that category with that specific dimension
            else:
                matrix_list = Category.objects.get(category_name=category).matrices.all().filter(dimension=int(dimensions))
        
        # Get list of all categories to show in view
        category_list = Category.objects.exclude(category_name="all")
        
        # Get list of tuples of all matrix-category pairs
        categories_and_matrices = [(category.category_name, [matrix.matrix_name for matrix in category.matrices.all()]) for category in [category for category in Category.objects.all()]]


        # Actions based on form request (when user submits a form by clicking one of the buttons)
        if request.method == 'POST':
            
            # If request is to save the matrix
            if 'Save' in request.POST:
                # Get matrix attributes: name, value, dimension and categories that it's to become a member of
                name = request.POST.get('namefield')
                value = request.POST.get('input_matrix')
                categories = request.POST.get('selected_categories'); categories = categories.split(",")
                dim = request.POST.get('matrix_dimensions') # Matrix dimensions

                # Try to create a new matrix
                try:
                    new_matrix = Matrix.objects.create(matrix_name=name,matrix_value=value, dimension = int(dim)) # Create new matrix
                    
                    # For each category in the list of categories the matrix is to be a member of, add the matrix to that category's matrices attribute
                    for cat in categories:
                        try:
                            Category.objects.get(category_name=cat).matrices.add(new_matrix).save()
                        except:
                            pass
                    
                    # Add matrix to group "all" (includes all matrices)
                    Group.objects.get(group_name="all").matrices.add(new_matrix).save()
                    
                # If matrix already exists, replace existing matrix
                except:                
                    matrix_instance = Matrix.objects.get(matrix_name=name)
                    matrix_instance.matrix_value = value
                    matrix_instance.dimension = int(dim)
                    matrix_instance.save() # Save modified matrix
                    
                    # For each category in the list of categories the matrix is to be a member of, add the matrix to that category's matrices attribute
                    for cat in categories:
                        try:
                            Category.objects.get(category_name=cat).matrices.add(matrix_instance).save()
                        except:
                            pass
                        
                    transaction.commit() # Commit transaction to ensure modified matrix is indeed updated


                return render(request,
                    'personal/home.html', {'matrix': value, # Matrix value to load (ensure view remains the same)
                                           'matrix_list': matrix_list, # List of matrices to view 
                                           'dimensions': -1, # Dimensions to show
                                           'matrix_input': matrix_input, # Whether to show matrix table or not
                                           'category_list':category_list, # List of categories to show in view
                                           'categories_and_matrices': [(category.category_name, [matrix.matrix_name for matrix in category.matrices.all()]) for category in [category for category in Category.objects.all()]] # List of category-matrix pairs (must be updated since new matrix has been saved)
                                          }
                )

            
            # If request is to load a matrix
            elif 'Load' in request.POST:
                name = request.POST.get('selected_matrix_name') # Get name of matrix to load
                matrix_instance = Matrix.objects.get(matrix_name=name) # Get matrix to load

                return render(request, 'personal/home.html', {'matrix': matrix_instance.matrix_value, # Matrix value to load
                                                              'matrix_list': matrix_list, # List of matrices to view
                                                              'dimensions': -1, # Dimensions to show
                                                              'matrix_input': matrix_input, # Whether to show matrix table or not
                                                              'category_list':category_list, # List of categories to show in view
                                                              'categories_and_matrices': categories_and_matrices # List of category-matrix pairs
                                                             }
                             )
            
            
            # If request is to create a new category
            elif 'CreateCategory' in request.POST:
                new_category = request.POST.get('categoryfield') # Get new category name
                Category.objects.create(category_name=new_category) # Create new category
                value = request.POST.get('input_matrix') # Get current matrix being drawn, so view can remain the same after submitting request
                
                return render(request,
                    'personal/home.html', {'matrix': value, # Matrix value to load
                                           'matrix_list':matrix_list, # List of matrices to view
                                           'dimensions': -1, # Dimensions to show
                                           'matrix_input': matrix_input, # Whether to show matrix table or not
                                           'category_list': Category.objects.exclude(category_name="all"), # List of categories to show in view
                                           'categories_and_matrices': categories_and_matrices # List of category-matrix pairs
                                          }
                )

        # Otherwise, just load the default view
        else:
            return render(request, 'personal/home.html',
                          {'matrix': '[[0,0,0],[0,0,0],[0,0,0]]', # matrix placeholder
                           'matrix_list': matrix_list, # List of matrices to view
                           'dimensions': dimensions, # Dimensions to show
                           'matrix_input': matrix_input, # Whether to show matrix table or not
                           'category_list':category_list, # List of categories to show in view
                           'categories_and_matrices': categories_and_matrices # List of category-matrix pairs
                          }
                         )

    # If user is not authenticated, redirect to login page
    else:
        return redirect("personal:login")
    
    
    
# Registration view
def register(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f"New account created: {username}")
            login(request, user)
            return redirect("personal:index")
        else:
            for msg in form.error_messages:
                messages.error(request, f"{msg}: {form.error_messages[msg]}")

            return render(request = request,
                          template_name = "personal/register.html",
                          context={"form":form})

    form = UserCreationForm
    return render(request = request,
                  template_name = "personal/register.html",
                  context={"form":form})


# Logout view

# Logout view
def logout_request(request):
    logout(request)
    messages.info(request, "Logged out successfully!")
    return redirect("personal:login")

# Login view
def login_request(request):
    if request.method == 'POST':
        form = AuthenticationForm(request=request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.info(request, f"You are now logged in as {username}")
                return redirect('/')
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid username or password.")
    form = AuthenticationForm()
    return render(request = request,
                    template_name = "personal/login.html",
                    context={"form":form})


# Category edit view

# Category edit view
def category_edit_request(request):
    categories_and_matrices = [(category.category_name, [matrix.matrix_name for matrix in category.matrices.all()]) for category in [category for category in Category.objects.all()]] # Get list of tuples of all category-matrices pairs
    category_list = Category.objects.exclude(category_name="all") # Get list of all categories to show in view
    
    matrices = {matrix.matrix_name: matrix.matrix_value for matrix in Matrix.objects.all()}
    matrices = json.dumps(matrices)
    
    # Actions based on form request (when user submits a form by clicking one of the buttons)
    
    if request.method == 'POST':
        
        # If request is to update category
        if 'Update Category' in request.POST:
            cat_name = request.POST.get('selected_name_edit') # Get category name to update
            matrix_names = request.POST.get('selected_options').split(",")  # Get selected matrices to include in category

            cat_object = Category.objects.get(category_name=cat_name) # Get category object to update
            cat_object.matrices.clear() # Clear all matrices to add selected options

            # Add selected images to category
            for matrix in matrix_names:
                try:
                    matrix_instance = Matrix.objects.get(matrix_name=matrix)
                    cat_object.matrices.add(matrix_instance).save() # Add image to category
                except:
                    pass

            categories_and_matrices = [(category.category_name, [matrix.matrix_name for matrix in category.matrices.all()]) for category in [category for category in Category.objects.all()]] # Update list of tuples of all category-matrices pairs
            
            return render(request = request, template_name = "personal/category_edit.html", context={"categories_and_matrices":categories_and_matrices, "category_list":category_list, "matrices": matrices, "category": cat_name, #category is used to reload selected category upon update/create
                                                                                                    })

    
        # If request is to create a new category
        elif 'CreateCategory' in request.POST:
            new_category = request.POST.get('categoryfield') # Get category name to create
            Category.objects.create(category_name=new_category) # Create new category
            
            category_list = Category.objects.exclude(category_name="all") # Update list of all categories to show in view

            return render(request = request, template_name = "personal/category_edit.html", context={"categories_and_matrices":categories_and_matrices, "category_list":category_list, "matrices": matrices, "category": new_category,})
    
        # If request is to delete category
        elif 'Delete Category' in request.POST:
            cat_name = request.POST.get('selected_name_edit') # Get category name to delete
            Category.objects.get(category_name=cat_name).delete() # Delete category
    
            categories_and_matrices = [(category.category_name, [matrix.matrix_name for matrix in category.matrices.all()]) for category in [category for category in Category.objects.all()]] # Update list of tuples of all category-matrices pairs
            category_list = Category.objects.exclude(category_name="all") # Update list of all categories to show in view


            return render(request = request, template_name = "personal/category_edit.html", context={"categories_and_matrices":categories_and_matrices, "category_list":category_list, "matrices": matrices, "category": "0"})
        
    
    return render(request = request, template_name = "personal/category_edit.html", context={"categories_and_matrices":categories_and_matrices, "category_list":category_list, "matrices": matrices, "category": "0"})


# Profile view
def profile(request):
    return  render(request, 'personal/profile.html')

# Group edit view
def group_edit_request(request):
    groups_and_matrices = [(group.group_name, [matrix.matrix_name for matrix in group.matrices.all()]) for group in [group for group in Group.objects.all()]] # Get list of tuples of all group-matrices pairs
    group_list = Group.objects.exclude(group_name="all") # Get list of all groups to show in view
    
    matrices = {matrix.matrix_name: matrix.matrix_value for matrix in Matrix.objects.all()}
    matrices = json.dumps(matrices)
    
    # Actions based on form request (when user submits a form by clicking one of the buttons)    
    
    if request.method == 'POST':
        
        # If request is to update group
        if 'Update Group' in request.POST:
            group_name = request.POST.get('selected_name_edit') # Get group name to update
            matrix_names = request.POST.get('selected_options').split(",") # Get list of images to add to group

            group_object = Group.objects.get(group_name=group_name) # Get group object to update
            group_object.matrices.clear() # Clear all matrices to add selected options

            # Add selected images to group
            for matrix in matrix_names:
                try:
                    matrix_instance = Matrix.objects.get(matrix_name=matrix)
                    group_object.matrices.add(matrix_instance).save() # Add image to group
                except:
                    pass

            groups_and_matrices = [(group.group_name, [matrix.matrix_name for matrix in group.matrices.all()]) for group in [group for group in Group.objects.all()]] # Update list of tuples of all group-matrices pairs
            
            #group_list = Group.objects.exclude(group_name="all")


            return render(request = request, template_name = "personal/group_edit.html", context={"groups_and_matrices":groups_and_matrices, "group_list":group_list, "group":group_name, "matrices": matrices,})

    
        # If request is to create a new group
        elif 'Create Group' in request.POST:
            new_group = request.POST.get('groupfield') # Get new group name
            Group.objects.create(group_name=new_group) # Create new group

            # groups_and_matrices = [(group.group_name, [matrix.matrix_name for matrix in group.matrices.all()]) for group in [group for group in Group.objects.all()]]
            
            group_list = Group.objects.exclude(group_name="all") # Update list of all groups to show in view


            return render(request = request, template_name = "personal/group_edit.html", context={"groups_and_matrices":groups_and_matrices, "group_list":group_list, "group": new_group, "matrices": matrices,})
    
        # If request is to delete group
        elif 'Delete Group' in request.POST:
            group_name = request.POST.get('selected_name_edit') # Get group name to update
            Group.objects.get(group_name=group_name).delete() # Delete group
    
            groups_and_matrices = [(group.group_name, [matrix.matrix_name for matrix in group.matrices.all()]) for group in [group for group in Group.objects.all()]] # Update list of tuples of all group-matrices pairs
        
            group_list = Group.objects.exclude(group_name="all") # Update list of all groups to show in view
            

            return render(request = request, template_name = "personal/group_edit.html", context={"groups_and_matrices":groups_and_matrices, "group_list":group_list, "group": "0", "matrices": matrices,})
        
    
    return render(request = request, template_name = "personal/group_edit.html", context={"groups_and_matrices":groups_and_matrices, "group_list":group_list, "group": "0", "matrices": matrices,})


# Logout view
