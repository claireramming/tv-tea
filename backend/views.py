import json
from django.conf import settings
from django.shortcuts import render
from rest_framework import viewsets
from django.http import JsonResponse
from backend.authorization import AuthorizationHeaderMixin, authorized
from backend.models import UserProfile, UserWatchList, UserWatchStats
from backend.serializers import UserProfileSerializer, UserWatchListSerializer, UserWatchStatsSerializer

@authorized
def private(request):
    """A valid access token is required to access this route
    """
    return JsonResponse(dict(user=request.user.sub))

def index(request):
    return render(
        request,
        "index.html",
        context={
            "session": request.session.get("user"),
            "pretty": json.dumps(request.session.get("user"), indent=4),
        },
    )

class UserProfileViewSet(AuthorizationHeaderMixin, viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    
class UserWatchListViewSet(viewsets.ModelViewSet, AuthorizationHeaderMixin):
    queryset = UserWatchList.objects.all()
    serializer_class = UserWatchListSerializer
    lookup_field = "user_id"
    
    def get_queryset(self):
        user_id = self.request.user.sub
        return UserWatchList.objects.filter(user_id=user_id)
    

class UserWatchStatsViewSet(viewsets.ModelViewSet, AuthorizationHeaderMixin):
    serializer_class = UserWatchStatsSerializer
    lookup_field = "user_id"
    
    def get_queryset(self):
        user_id = self.request.user.sub
        return UserWatchStats.objects.filter(user_id=user_id)