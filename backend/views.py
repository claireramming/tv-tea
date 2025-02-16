from rest_framework import viewsets
from datetime import date
from backend.models import UserProfile, UserWatchList, UserWatchStats
from backend.serializers import UserProfileSerializer, UserWatchListSerializer, UserWatchStatsSerializer


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    
class UserWatchListViewSet(viewsets.ModelViewSet):
    queryset = UserWatchList.objects.all()
    serializer_class = UserWatchListSerializer
    
    def get_queryset(self):
        user_id = self.request.user.username.split(".")[1]
        return UserWatchList.objects.filter(user_id=user_id)
    
    def create(self, request, *args, **kwargs):
        user_id = request.user.username.split(".")[1]
        request.data["user"] = user_id
        return super().create(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        try:
            watchtime = request.data.pop("watchtime")
        except KeyError:
            watchtime = None
            pass
        
        if watchtime is not None:
            self.update_stats(request, watchtime, **kwargs)

        return super().partial_update(request, *args, **kwargs)
    
    def update_stats(self, request, watchtime, **kwargs):
        '''
        Update the watch stats for the user based on the watchtime and number of episodes watched.
        If the number of episodes watched has decreased, but no stats have been added for the day, ignore the update.
        '''
        print('Updating stats')

        user_id = request.user.username.split(".")[1]
        num_eps = request.data.get("num_episodes_watched", 0)
        
        user_watch_list_entry = UserWatchList.objects.get(id=kwargs.get('pk'))
        eps_watched = user_watch_list_entry.num_episodes_watched
        stat_object, _ = UserWatchStats.objects.get_or_create(
            user_id=user_id,
            date=date.today(),
            defaults={ 'num_watched_episodes': 0, 'minutes_watched': 0 }
        )
        print(stat_object)
        if (eps_watched > num_eps):
            # remove ep from stats if possible
            if stat_object.num_watched_episodes > 0:
                stat_object.num_watched_episodes -= 1
                if watchtime > 0 and stat_object.minutes_watched >= watchtime:
                    stat_object.minutes_watched -= watchtime
                elif watchtime > 0:
                    stat_object.minutes_watched = 0
                stat_object.save()

        if (eps_watched < num_eps):
            # add ep to stats
            stat_object.num_watched_episodes += 1
            stat_object.minutes_watched += watchtime
            stat_object.save()

class UserWatchStatsViewSet(viewsets.ModelViewSet):
    queryset = UserWatchStats.objects.all()
    serializer_class = UserWatchStatsSerializer
    
    def get_queryset(self):
        user_id = self.request.user.username.split(".")[1]
        return UserWatchStats.objects.filter(user_id=user_id)