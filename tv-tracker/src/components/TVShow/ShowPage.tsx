/* eslint-disable @typescript-eslint/no-floating-promises */
import { useParams } from 'react-router';
import { Genre, MovieDb, ShowResponse, SimpleSeason } from 'moviedb-promise';
import { useEffect, useState, useContext } from 'react';
import { UserContext, User } from '../../contexts/UserContext';
import { imageBaseUrl } from '../../constants';
import Season from './Season';
import { addSeasonToWatchList } from '../../utils';
import { FullSeason, Rating } from '../../types';
import ProviderImage from '../common/ProviderImage';

export default function ShowPage() {
  const moviedb = new MovieDb(process.env.TMDB_API_KEY || '');
  const user: User = useContext(UserContext);

  function fetchShowData(id: string | number) {
    return moviedb.tvInfo({ id, append_to_response: 'watch/providers,content_ratings' });
  }

  function fetchSeasonData(
    series_id: string | number | undefined,
    seasons: SimpleSeason[] | undefined
  ) {
    if (!series_id || !seasons) return [];
    return seasons.map((season) => {
      console.log(season)
      return moviedb.seasonInfo({ id: series_id, season_number: season.season_number || 1 });
    });
  }

  let params = useParams();
  const [show, setShow] = useState<ShowResponse>({});
  const [seasonData, setSeasonData] = useState<FullSeason[]>([]);

  useEffect(() => {
    if (!params.id) return setShow({});
    const showPromise = fetchShowData(params.id);
    showPromise.then((showData) => {
      const seasonPromises = fetchSeasonData(params.id, showData.seasons);
      setShow(showData);
      Promise.all(seasonPromises).then(setSeasonData);
    });
  }, [params.id]);

  if (!Object.keys(show).length && !seasonData.length) {
    return <div>Loading...</div>;
  }

  const contentRating =
    show.content_ratings.results.find((rating: Rating) => rating.iso_3166_1 === 'US')?.rating || 'NR';
  const genresString: string = show.genres.map((genre: Genre) => genre.name).join(', ');

  const providers = show['watch/providers'].results?.US?.flatrate

  const seasonsList = show.seasons.map((season: FullSeason, i: number) => {
    return <Season key={season.id} data={{ ...season, ...(seasonData?.[i] || {}) }} />;
  });

  const seasonWatchList = show.seasons.map((season: FullSeason) => {
    return (
      <li key={season.id}>
        <a
          onClick={() =>
            addSeasonToWatchList(show.id, season.season_number, show.status, user.accessToken)
          }
        >
          Season {season.season_number}
        </a>
      </li>
    );
  });

  return (
    <>
      <img
        src={imageBaseUrl + 'original' + show.backdrop_path}
        className="absolute opacity-25 z-0 h-128 w-full min-w-3xl object-cover"
        alt={show.name}
      />
      <div className="relative py-4 px-8 flex flex-col gap-4 min-w-3xl z-10">
        <div className="h-128">
          <img
            src={imageBaseUrl + 'w300' + show.poster_path}
            className="w-80 float-left mr-8 rounded-xl"
            alt={show.name}
          />
          <h1 className="mt-8">{show.name}</h1>
          <h3>
            {contentRating} • {show.first_air_date.substring(0, 4)} -{' '}
            {show.in_production ? '' : show.last_air_date.substring(0, 4)} • {genresString}
          </h3>
          <h2 className="font-semibold mt-8">Overview</h2>
          <p className="h-30 overflow-y-auto">{show.overview}</p>
          <details className="dropdown">
            <summary className="btn m-1">Add to WatchList</summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              {seasonWatchList}
            </ul>
          </details>
          <h2 className="font-semibold mt-4">Watch on:</h2>
          <div className="flex gap-4 mt-2"><ProviderImage count={3} providers={providers} /></div>
        </div>
        <div>
          <h2 className="mb-4">Seasons</h2>
          <div className="join join-vertical bg-base-100">{seasonsList}</div>
        </div>
      </div>
    </>
  );
}
