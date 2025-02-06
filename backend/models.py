from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField

STATUS_OPTIONS = (    
    ("returning_series", "Returning Series"),
    ("planned", "Planned"),
    ("in_production", "In Production"),
    ("ended", "Ended"),
    ("canceled", "Canceled"),
    ("pilot", "Pilote")
)

class UserProfile(models.Model):
    id: int = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    country = models.CharField(max_length=2, blank=True)
    preferred_providers = ArrayField(models.IntegerField(), blank=True, default=list)

class UserWatchList(models.Model):
    id: int = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    show_id = models.IntegerField()
    season = models.IntegerField()
    num_episodes_watched = models.IntegerField(default=0)
    datetime_added_at = models.DateTimeField(auto_now_add=True)
    datetime_started_at = models.DateTimeField(null=True, blank=True)
    datetime_finished_at = models.DateTimeField(null=True, blank=True)
    num_delay_days = models.IntegerField(default=0)
    status= models.CharField(choices=STATUS_OPTIONS)

class UserWatchStats(models.Model):
    id: int = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    num_watched_episodes = models.IntegerField(default=0)
    minutes_watched = models.IntegerField(default=0)

