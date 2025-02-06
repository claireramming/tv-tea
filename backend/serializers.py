from rest_framework import serializers

from backend.models import UserProfile, UserWatchList, UserWatchStats

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = "__all__"

class UserWatchListSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserWatchList
        fields = "__all__"

class UserWatchStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserWatchStats
        fields = "__all__"


