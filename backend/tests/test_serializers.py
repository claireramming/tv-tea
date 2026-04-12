import pytest
from datetime import datetime, timezone
from backend.models import UserWatchList
from backend.serializers import UserWatchListSerializer


FINISHED_AT = datetime(2024, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
STARTED_AT = datetime(2024, 5, 1, 12, 0, 0, tzinfo=timezone.utc)


@pytest.mark.django_db
def test_finished_without_started__sets_started_to_finished(profile):
    entry = UserWatchList.objects.create(
        user=profile, show_id=1, season=1, status="Ended",
        datetime_finished_at=FINISHED_AT,
        datetime_started_at=None,
    )
    data = UserWatchListSerializer(entry).data
    assert data["datetime_started_at"] == FINISHED_AT


@pytest.mark.django_db
def test_finished_with_started__keeps_original_started(profile):
    entry = UserWatchList.objects.create(
        user=profile, show_id=1, season=1, status="Ended",
        datetime_finished_at=FINISHED_AT,
        datetime_started_at=STARTED_AT,
    )
    data = UserWatchListSerializer(entry).data
    assert data["datetime_started_at"] == STARTED_AT.isoformat().replace("+00:00", "Z")


@pytest.mark.django_db
def test_started_only__no_change(profile):
    entry = UserWatchList.objects.create(
        user=profile, show_id=1, season=1, status="Returning Series",
        datetime_started_at=STARTED_AT,
        datetime_finished_at=None,
    )
    data = UserWatchListSerializer(entry).data
    assert data["datetime_started_at"] == STARTED_AT.isoformat().replace("+00:00", "Z")
    assert data["datetime_finished_at"] is None


@pytest.mark.django_db
def test_no_dates__no_change(profile):
    entry = UserWatchList.objects.create(
        user=profile, show_id=1, season=1, status="Returning Series",
        datetime_started_at=None,
        datetime_finished_at=None,
    )
    data = UserWatchListSerializer(entry).data
    assert data["datetime_started_at"] is None
    assert data["datetime_finished_at"] is None
