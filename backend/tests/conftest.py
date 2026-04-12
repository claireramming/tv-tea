import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from backend.models import UserProfile, UserWatchList, UserWatchStats
from datetime import date

USER_ID = "testuser123"


@pytest.fixture
def user_id():
    return USER_ID


@pytest.fixture
def django_user(user_id):
    return User.objects.create(username=f"auth0.{user_id}")


@pytest.fixture
def profile(user_id):
    return UserProfile.objects.create(id=user_id)


@pytest.fixture
def api_client(django_user, profile):
    client = APIClient()
    client.force_authenticate(user=django_user)
    return client


@pytest.fixture
def watchlist_entry(profile):
    return UserWatchList.objects.create(
        user=profile, show_id=1, season=1, status="Returning Series"
    )


@pytest.fixture
def watch_stats(profile):
    return UserWatchStats.objects.create(
        user=profile, date=date.today(),
        num_watched_episodes=3, minutes_watched=90
    )
