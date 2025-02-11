import { useContext, useEffect, useState } from 'react';
import { UserContext, User } from '../../contexts/UserContext';
import { 
  getUserWatchList,
  removeSeasonFromWatchList,
  startWatchingSeason,
  finishWatchingSeason,
  updateWatchListEntry,
} from '../../utils';
import { MovieDb } from 'moviedb-promise';
import UpNext from './UpNext';
import WatchList from './WatchList';
import { SeasonToWatch, WatchListEntry } from '../../types';

export default function WatchListPage(props: { isLoading: boolean; login: () => void }) {
  const user: User = useContext(UserContext);
  

  const [seasonArray, setSeasonArray] = useState<SeasonToWatch[]>([]);

  if (props.isLoading) {
    <span className="loading loading-infinity loading-lg"></span>;
  }

  async function removeFromWatchList(id: number) {
    const deleted = await removeSeasonFromWatchList(id, user.accessToken);
    if (deleted) setSeasonArray(seasonArray.filter((season) => season.watchlistId !== id));
  }

  async function startWatching(id: number) {
    const started: string | false = await startWatchingSeason(id, user.accessToken);
    if (started) setSeasonArray(seasonArray.map((season) => {
      if (season.watchlistId === id) {
        season.datetime_started_at = started;
      }
      return season;
    }));
  }

  async function finishWatching(id: number) {
    const finished: string | false = await finishWatchingSeason(id, user.accessToken);
    if (finished) setSeasonArray(seasonArray.map((season) => {
      if (season.watchlistId === id) {
        season.datetime_finished_at = finished;
      }
      return season;
    }));
  }

  async function watchEpisode(id:number, watchedEps: number) {
    const updated = await updateWatchListEntry(id, {num_episodes_watched: watchedEps}, user.accessToken);
    if (updated) setSeasonArray(seasonArray.map((season) => {
      if (season.watchlistId === id) {
        season.num_episodes_watched = watchedEps;
      }
      return season;
    }));
  }

  useEffect(() => {
    if (!user?.isAuthenticated) return

    const moviedb = new MovieDb(process.env.TMDB_API_KEY || '');

    async function buildWatchList(): Promise<void> {
      const watchList = await getUserWatchList(user?.accessToken || '');
      const seasonArray: SeasonToWatch[] = await Promise.all(watchList.map(async (season: WatchListEntry) => {
        const showInfo = await moviedb.tvInfo({ id: season.show_id, append_to_response: `season/${season.season},season/${season.season}/watch/providers` });
        const { [`season/${season.season}`]: seasonInfo, [`season/${season.season}/watch/providers`]: providers, ...restShow } = showInfo;
        const seasonObject = {...season, providers: providers?.results, ...seasonInfo, show: restShow, watchlistId: season.id };
        return seasonObject
      }));
      setSeasonArray(seasonArray);
    }
    
    void buildWatchList();
  }, [user]);

  
   
  if (user?.isAuthenticated) {
    return (
      <>
        <UpNext />
        <WatchList 
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
