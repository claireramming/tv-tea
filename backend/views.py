import json
from authlib.integrations.django_client import OAuth
from django.conf import settings
from django.shortcuts import render
from rest_framework import viewsets
from authlib.integrations.django_oauth2 import ResourceProtector
from django.http import JsonResponse
from backend import validator

from backend.models import UserProfile, UserWatchList, UserWatchStats
from backend.serializers import UserProfileSerializer, UserWatchListSerializer, UserWatchStatsSerializer

require_auth = ResourceProtector()
validator = validator.Auth0JWTBearerTokenValidator(
    domain=settings.AUTH0_DOMAIN,
    audience=settings.AUTH0_AUDIENCE,
)
require_auth.register_token_validator(validator)


def public(request):
    """No access token required to access this route
    """
    response = "Hello from a public endpoint! You don't need to be authenticated to see this."
    return JsonResponse(dict(message=response))


@require_auth(None)
def private(request):
    """A valid access token is required to access this route
    """
    response = "Hello from a private endpoint! You need to be authenticated to see this."
    return JsonResponse(dict(message=response))


def index(request):
    return render(
        request,
        "index.html",
        context={
            "session": request.session.get("user"),
            "pretty": json.dumps(request.session.get("user"), indent=4),
        },
    )

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = "user__id"
    
    def get_queryset(self):
        user_id = self.request.user.id
        return UserProfile.objects.filter(user__id=user_id)
    
class UserWatchListViewSet(viewsets.ModelViewSet):
    queryset = UserWatchList.objects.all()
    serializer_class = UserWatchListSerializer
    lookup_field = "user__id"
    
    def get_queryset(self):
        user_id = self.request.user.id
        return UserWatchList.objects.filter(user__id=user_id)
    

class UserWatchStatsViewSet(viewsets.ModelViewSet):
    serializer_class = UserWatchStatsSerializer
    lookup_field = "user__id"
    
    def get_queryset(self):
        user_id = self.request.user.id
        return UserWatchStats.objects.filter(user__id=user_id)