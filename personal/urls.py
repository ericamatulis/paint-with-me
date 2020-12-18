from django.conf.urls import url
from django.urls import path
from . import views

app_name = 'personal'  # here for namespacing of urls.


urlpatterns = [
    url(r'^$', views.index, name='index'),
    path("register", views.register, name="register"),
    path("logout", views.logout_request, name="logout"),
    path("login", views.login_request, name="login"),
    path("category_edit", views.category_edit_request, name="category_edit"),
    path("profile", views.profile, name="profile"),
    path("group_edit", views.group_edit_request, name="group_edit"),


]