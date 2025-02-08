import { useContext, useEffect, useState } from 'react';
import { UserContext, User } from '../../contexts/UserContext';
import { SimpleFetch, getUserWatchList } from '../../utils';
import { MovieDb } from 'moviedb-promise';
import UpNext from './UpNext';
import WatchList from './WatchList';
import { FullSeason, WatchListEntry } from '../../types';

export default function WatchListPage(props: { isLoading: boolean; login: () => void }) {
  const user: User = useContext(UserContext);
  const moviedb = new MovieDb(process.env.TMDB_API_KEY || '');

  const [seasonArray, setSeasonArray] = useState<FullSeason[]>([]);

  async function makeGETRequest() {
    const url = 'profile/';

    console.log(await SimpleFetch.get(url, {}, user?.accessToken));
  }

  if (props.isLoading) {
    <span className="loading loading-infinity loading-lg"></span>;
  }

  useEffect(() => {
    if (!user?.isAuthenticated) return 
    buildWatchList();
  }, [user]);

  async function buildWatchList() {
    const watchList = await getUserWatchList(user.accessToken);
    console.log(watchList);
    const seasonArray = await Promise.all(watchList.map(async (season: WatchListEntry) => {
      const seasonInfo = await moviedb.seasonInfo({ id: season.show_id, season_number: season.season || 1, append_to_response: 'watch/providers' });
      return ({...season, ...seasonInfo })
    }));
    setSeasonArray(seasonArray);
  }
   
  if (user?.isAuthenticated) {
    return (
      <>
        <UpNext />
        <WatchList watchlist={seasonArray} />
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
