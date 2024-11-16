from django.urls import path
from . import views

urlpatterns = [
    path('generate-bio/', views.generate_bio, name='generate_bio'),
    path('health/', views.health_check, name='health_check'),
]
