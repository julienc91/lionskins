"""lionskins URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView

from csgo.views.redirect import redirect_view
from csgo.views.teams import teams_view
from lionskins.views.sitemap import sitemap_view
from users.views.authentication import logout_view

urlpatterns = [
    path("admin/", admin.site.urls),
    path("graphql", csrf_exempt(GraphQLView.as_view(graphiql=True)), name="graphql"),
    path("sitemap.xml", sitemap_view, name="sitemap"),
    path("teams.json", teams_view, name="teams"),
    path("redirect/<str:provider>/<str:skin_id>/", redirect_view, name="redirect"),
    path("logout/", logout_view, name="logout"),
    path("authentication/", include("social_django.urls", namespace="authentication")),
]
