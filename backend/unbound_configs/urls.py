
from django.urls import path
from . import views

urlpatterns = [
    path('api/zones/', views.list_zones, name='list_zones'),
    path('api/zones/update/', views.update_zones, name='update_zones'),
]
