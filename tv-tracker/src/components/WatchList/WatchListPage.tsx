import { useContext, useEffect, useState } from 'react';
import { UserContext, User } from '../../contexts/UserContext';
import { 
  getUserWatchList,
  removeSeasonFromWatchList,
  startWatchingSeason,
  finishWatchingSeason,
  updateWatchListEntry,
  addSeasonToWatchList,
} from '../../utils';
import { MovieDb, SimpleSeason } from 'moviedb-promise';
import UpNext from './UpNext';
import WatchList from './WatchList';
import { SeasonToWatch, WatchListEntry } from '../../types';

export default function WatchListPage(props: { login: () => void }) {
  const user: User = useContext(UserContext);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [seasonArray, setSeasonArray] = useState<SeasonToWatch[]>([]);
  const [addedSeasons, setAddedSeasons] = useState<SimpleSeason[]>([]);

  async function removeFromWatchList(id: number) {
    const deleted = await removeSeasonFromWatchList(id, user.accessToken);
    if (deleted) setSeasonArray(seasonArray.filter((season) => season.watchlistId !== id));
  }

  async function addToWatchList(showId: number, season: number, status: string) {
    const added = await addSeasonToWatchList(showId, season, status, user.accessToken);
    if (added) setAddedSeasons([...addedSeasons, { showId, season}]);
  }

  async function startWatching(id: number, prewatchedEps: number = 0) {
    const started: string | false = await startWatchingSeason(id, prewatchedEps, user.accessToken);
    if (started) setSeasonArray(seasonArray.map((season) => {
      if (season.watchlistId === id) {
        season.datetime_started_at = started;
        season.num_episodes_watched = prewatchedEps;
      }
      return season;
    }));
  }

  async function finishWatching(id: number) {
    const finished: string | false = await finishWatchingSeason(id, user.accessToken);
    if (finished) setSeasonArray(seasonArray.map((season) => {
      if (season.watchlistId === id) {
        season.datetime_finished_at = finished;
        if (!season.datetime_started_at) {
          season.datetime_started_at = finished;
        }
      }
      return season;
    }));
  }

  async function watchEpisode(id:number, watchedEps: number, watchtime: number) {
    const updated = await updateWatchListEntry(id, {num_episodes_watched: watchedEps, watchtime}, user.accessToken);
    if (updated) setSeasonArray(seasonArray.map((season) => {
      if (season.watchlistId === id) {
        season.num_episodes_watched = watchedEps;
      }
      return season;
    }));
  }

  useEffect(() => {
    if (!user?.isAuthenticated) return
    setIsLoading(true);

    const moviedb = new MovieDb(process.env.TMDB_API_KEY || '');

    async function buildWatchList(): Promise<void> {
      const watchList = await getUserWatchList(user?.accessToken || '');
      const seasonArray: SeasonToWatch[] = await Promise.all(watchList.map(async (season: WatchListEntry) => {
        const showInfo = await moviedb.tvInfo({ id: season.show_id, append_to_response: `season/${season.season},season/${season.season}/watch/providers` });
        const seasonId = showInfo.seasons.find((s: {season_number: number}) => s.season_number === season.season).id;
        const { [`season/${season.season}`]: seasonInfo, [`season/${season.season}/watch/providers`]: providers, ...restShow } = showInfo;
        const seasonObject = {...season, seasonId, providers: providers?.results, ...seasonInfo, show: restShow, watchlistId: season.id };
        return seasonObject
      }));
      setSeasonArray(seasonArray);
    }
    
    void buildWatchList().then(() => setIsLoading(false));
  }, [user, addedSeasons]);

  
   
  if (user?.isAuthenticated) {
    return (
      <>
        <UpNext 
          isLoading={isLoading}
          watchlist={seasonArray}
          add={addToWatchList}
          start={startWatching}
          update={watchEpisode}
        />
        <WatchList 
          isLoading={isLoading}
          watchlist={seasonArray}
          remove={removeFromWatchList}
          start={startWatching}
          finish={finishWatching}
          update={watchEpisode}
        />
      </>
    );
  } else {
    return (
      <div className="hero min-h-screen bg-linear-to-t from-sky-500 to-indigo-500">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Hello there</h1>
            <p className="py-6">
              Log in or create an account to start tracking your favorite shows.
            </p>
            <button className="btn" onClick={props.login}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }
}
