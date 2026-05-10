from django.urls import path
from . import views

urlpatterns = [
    path('', views.grupos_list, name='grupos_list'),
    path('<int:pk>/', views.grupo_detail, name='grupo_detail'),
    path('<int:pk>/members/', views.grupo_miembros, name='grupo_miembros'),
    path('<int:pk>/invite/', views.invitar_miembro, name='invitar_miembro'),
    path('<int:pk>/members/<int:uid>/', views.eliminar_miembro, name='eliminar_miembro'),
]
