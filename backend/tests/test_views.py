import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from backend.models import UserProfile, UserWatchList, UserWatchStats
from datetime import date


@pytest.mark.django_db
def test_health_check_returns_200_and_ok(api_client):
    response = api_client.get("/health/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ── update_stats: episode increase ────────────────────────────────────────────

@pytest.mark.django_db
def test_update_stats__episode_increase__increments_count_and_minutes(
    api_client, watchlist_entry, watch_stats
):
    response = api_client.patch(
        f"/watchlist/{watchlist_entry.id}/",
        {"num_episodes_watched": 1, "watchtime": 30},
        format="json",
    )
    assert response.status_code == 200

    watch_stats.refresh_from_db()
    assert watch_stats.num_watched_episodes == 4
    assert watch_stats.minutes_watched == 120


@pytest.mark.django_db
def test_update_stats__episode_increase__creates_stats_if_none_exist(
    api_client, watchlist_entry
):
    # No watch_stats fixture — stats row should not exist yet
    response = api_client.patch(
        f"/watchlist/{watchlist_entry.id}/",
        {"num_episodes_watched": 1, "watchtime": 45},
        format="json",
    )
    assert response.status_code == 200

    stat = UserWatchStats.objects.get(user=watchlist_entry.user, date=date.today())
    assert stat.num_watched_episodes == 1
    assert stat.minutes_watched == 45


# ── update_stats: episode decrease ────────────────────────────────────────────

@pytest.mark.django_db
def test_update_stats__episode_decrease__decrements_count_and_minutes(
    api_client, watchlist_entry, watch_stats
):
    # Move entry to 1 episode watched so we can decrease to 0
    watchlist_entry.num_episodes_watched = 1
    watchlist_entry.save()

    response = api_client.patch(
        f"/watchlist/{watchlist_entry.id}/",
        {"num_episodes_watched": 0, "watchtime": 30},
        format="json",
    )
    assert response.status_code == 200

    watch_stats.refresh_from_db()
    assert watch_stats.num_watched_episodes == 2
    assert watch_stats.minutes_watched == 60


@pytest.mark.django_db
def test_update_stats__episode_decrease__minutes_capped_at_zero(
    api_client, watchlist_entry, watch_stats
):
    watchlist_entry.num_episodes_watched = 1
    watchlist_entry.save()

    # watchtime (200) > existing minutes_watched (90) → should cap at 0
    response = api_client.patch(
        f"/watchlist/{watchlist_entry.id}/",
        {"num_episodes_watched": 0, "watchtime": 200},
        format="json",
    )
    assert response.status_code == 200

    watch_stats.refresh_from_db()
    assert watch_stats.minutes_watched == 0


@pytest.mark.django_db
def test_update_stats__episode_decrease__skipped_when_count_already_zero(
    api_client, watchlist_entry, profile
):
    # Create stats with 0 episodes — decrement should be skipped
    stats = UserWatchStats.objects.create(
        user=profile, date=date.today(), num_watched_episodes=0, minutes_watched=0
    )
    watchlist_entry.num_episodes_watched = 1
    watchlist_entry.save()

    api_client.patch(
        f"/watchlist/{watchlist_entry.id}/",
        {"num_episodes_watched": 0, "watchtime": 30},
        format="json",
    )

    stats.refresh_from_db()
    assert stats.num_watched_episodes == 0
    assert stats.minutes_watched == 0


# ── update_stats: no change ────────────────────────────────────────────────────

@pytest.mark.django_db
def test_update_stats__no_episode_change__no_stat_update(
    api_client, watchlist_entry, watch_stats
):
    # Sending watchtime but same num_episodes_watched → no stat change
    watchlist_entry.num_episodes_watched = 1
    watchlist_entry.save()

    api_client.patch(
        f"/watchlist/{watchlist_entry.id}/",
        {"num_episodes_watched": 1, "watchtime": 30},
        format="json",
    )

    watch_stats.refresh_from_db()
    assert watch_stats.num_watched_episodes == 3
    assert watch_stats.minutes_watched == 90


# ── update_stats: zero watchtime ──────────────────────────────────────────────

@pytest.mark.django_db
def test_update_stats__zero_watchtime__minutes_unchanged_on_decrease(
    api_client, watchlist_entry, watch_stats
):
    watchlist_entry.num_episodes_watched = 1
    watchlist_entry.save()

    api_client.patch(
        f"/watchlist/{watchlist_entry.id}/",
        {"num_episodes_watched": 0, "watchtime": 0},
        format="json",
    )

    watch_stats.refresh_from_db()
    assert watch_stats.num_watched_episodes == 2
    assert watch_stats.minutes_watched == 90  # unchanged because watchtime == 0


# ── get_queryset isolation ─────────────────────────────────────────────────────

@pytest.mark.django_db
def test_watchlist__only_returns_own_entries(watchlist_entry):
    other_profile = UserProfile.objects.create(id="otheruser")
    other_django_user = User.objects.create(username="auth0.otheruser")
    UserWatchList.objects.create(
        user=other_profile, show_id=99, season=5, status="Ended"
    )

    other_client = APIClient()
    other_client.force_authenticate(user=other_django_user)

    response = other_client.get("/watchlist/")
    assert response.status_code == 200
    ids = [entry["id"] for entry in response.json()]
    assert watchlist_entry.id not in ids
