import json
from django.conf import settings
from django.shortcuts import render
from rest_framework import viewsets
from django.http import JsonResponse
from backend.models import UserProfile, UserWatchList, UserWatchStats
from backend.serializers import UserProfileSerializer, UserWatchListSerializer, UserWatchStatsSerializer


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

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    
class UserWatchListViewSet(viewsets.ModelViewSet):
    queryset = UserWatchList.objects.all()
    serializer_class = UserWatchListSerializer
    lookup_field = "user_id"
    
    def get_queryset(self):
        user_id = self.request.user.username.split(".")[1]
        return UserWatchList.objects.filter(user_id=user_id)
    
    def create(self, request, *args, **kwargs):
        user_id = request.user.username.split(".")[1]
        request.data["user"] = user_id
        print(request.data)
        return super().create(request, *args, **kwargs)
    

class UserWatchStatsViewSet(viewsets.ModelViewSet):
    serializer_class = UserWatchStatsSerializer
    lookup_field = "user_id"
    
    def get_queryset(self):
        user_id = self.request.user.sub
        return UserWatchStats.objects.filter(user_id=user_id)