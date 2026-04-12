import pytest
from django.db import IntegrityError
from backend.models import UserProfile, UserWatchList, UserWatchStats
from datetime import date


@pytest.mark.django_db
def test_userprofile__default_country_is_us():
    profile = UserProfile.objects.create(id="user1")
    assert profile.country == "US"


@pytest.mark.django_db
def test_userprofile__default_providers_is_empty_list():
    profile = UserProfile.objects.create(id="user1")
    assert profile.preferred_providers == []


@pytest.mark.django_db
def test_userwatchlist__default_episodes_watched_is_zero(profile):
    entry = UserWatchList.objects.create(
        user=profile, show_id=10, season=1, status="Returning Series"
    )
    assert entry.num_episodes_watched == 0


@pytest.mark.django_db
def test_userwatchlist__unique_together_constraint(profile):
    UserWatchList.objects.create(user=profile, show_id=1, season=1, status="Returning Series")
    with pytest.raises(IntegrityError):
        UserWatchList.objects.create(user=profile, show_id=1, season=1, status="Returning Series")


@pytest.mark.django_db
def test_userwatchstats__unique_together_constraint(profile):
    today = date.today()
    UserWatchStats.objects.create(user=profile, date=today, num_watched_episodes=1, minutes_watched=30)
    with pytest.raises(IntegrityError):
        UserWatchStats.objects.create(user=profile, date=today, num_watched_episodes=2, minutes_watched=60)
