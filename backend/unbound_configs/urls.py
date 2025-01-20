from django.urls import path
from . import views

urlpatterns = [
    path('api/zones/', views.list_zones, name='list_zones'),
    path('api/zones/update/', views.update_zones, name='update_zones'),
    path('api/local-data/', views.list_local_data, name='list_local_data'),
    path('api/local-data/update/', views.update_local_data, name='update_local_data'),
    path('api/unbound/start/', views.start_unbound, name='start_unbound'),
    path('api/unbound/stop/', views.stop_unbound, name='stop_unbound'),
    path('api/unbound/status/', views.unbound_status, name='unbound_status'),
]
