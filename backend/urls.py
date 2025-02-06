from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"profiles", views.UserProfileViewSet, basename="profile")
router.register(r"watchlist", views.UserWatchListViewSet, basename="watchlist")
router.register(r"watchstats", views.UserWatchStatsViewSet, basename="watchstats")

urlpatterns = [
    path("", views.index, name="index"),
    path('admin/', admin.site.urls),
    path('api/public', views.public),
    path('api/private', views.private),
    path('', include(router.urls)),
]