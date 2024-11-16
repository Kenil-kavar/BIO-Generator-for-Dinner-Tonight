from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('bio_generator.urls')),  # Assuming your API app is named 'api'
    # Serve React app at root URL
    path('', TemplateView.as_view(template_name='index.html')),
]