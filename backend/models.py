from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField

STATUS_OPTIONS = (    
    ("Returning Series", "Returning Series"),
    ("Planned", "Planned"),
    ("In Production", "In Production"),
    ("Ended", "Ended"),
    ("Canceled", "Canceled"),
    ("Pilot", "Pilot")
)

class UserProfile(models.Model):
    id = models.CharField(primary_key=True)
    country = models.CharField(max_length=2, blank=True, default="US")
    preferred_providers = ArrayField(models.IntegerField(), blank=True, default=list)

class UserWatchList(models.Model):
    id: int = models.AutoField(primary_key=True)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    show_id = models.IntegerField()
    season = models.IntegerField()
    num_episodes_watched = models.IntegerField(blank=True, default=0)
    datetime_added_at = models.DateTimeField(auto_now_add=True)
    datetime_started_at = models.DateTimeField(null=True, blank=True)
    datetime_finished_at = models.DateTimeField(null=True, blank=True)
    num_delay_days = models.IntegerField(blank=True, default=0)
    status= models.CharField(choices=STATUS_OPTIONS)

class UserWatchStats(models.Model):
    id: int = models.AutoField(primary_key=True)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    date = models.DateField()
    num_watched_episodes = models.IntegerField(default=0)
    minutes_watched = models.IntegerField(default=0)

