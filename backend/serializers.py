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

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # if finished time exists but start time does not, set start time to finished time
        if instance.datetime_finished_at and not instance.datetime_started_at:
            representation["datetime_started_at"] = instance.datetime_finished_at
        return representation

class UserWatchStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserWatchStats
        fields = "__all__"


