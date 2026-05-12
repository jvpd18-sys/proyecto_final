from django.urls import path
from . import views

urlpatterns = [
    path('', views.pagos_list, name='pagos_list'),
    path('<int:pk>/confirm/', views.confirmar_pago, name='confirmar_pago'),
]
