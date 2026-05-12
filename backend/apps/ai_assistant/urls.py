from django.urls import path
from . import views

urlpatterns = [
    path('categorize/', views.categorizar, name='categorizar'),
    path('recommendations/', views.recomendaciones, name='recomendaciones'),
]
