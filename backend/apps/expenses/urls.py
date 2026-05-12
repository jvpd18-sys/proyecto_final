from django.urls import path
from . import views

urlpatterns = [
    path('', views.gastos_list, name='gastos_list'),
    path('<int:pk>/', views.gasto_detail, name='gasto_detail'),
    path('categories/', views.categorias_list, name='categorias_list'),
    path('dashboard/summary/', views.dashboard_summary, name='dashboard_summary'),
    path('groups/<int:grupo_id>/balances/', views.grupo_balances, name='grupo_balances'),
    path('groups/<int:grupo_id>/settlement/', views.grupo_liquidacion, name='grupo_liquidacion'),
]
