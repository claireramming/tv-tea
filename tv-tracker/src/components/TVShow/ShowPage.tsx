/* eslint-disable @typescript-eslint/no-floating-promises */
import { useParams } from 'react-router';
import { Genre, ShowResponse, TvSeasonResponse } from 'moviedb-promise';
import { useEffect, useState, useContext } from 'react';
import { UserContext, User } from '../../contexts/UserContext';
import { imageBaseUrl } from '../../constants';
import Season from './Season';
import { addSeasonToWatchList } from '../../utils';
import { FullSeason, Rating, WatchProvider } from '../../types';
import ProviderImage from '../common/ProviderImage';
import { fetchSeasonData, fetchShowData } from '../../utils';
import '@/App.css';

export default function ShowPage() {
  
  const user: User = useContext(UserContext);

  const params = useParams();
  const userLoggedIn: boolean = user?.isAuthenticated || false
  const [show, setShow] = useState<ShowResponse & {
    'watch/providers'?: {
      results: {US: {flatrate: WatchProvider[]}}
    },
    content_ratings?: {results: Rating[]} 
  } >({});
  const [seasonData, setSeasonData] = useState<TvSeasonResponse[]>([]);
  const [ watchDropdownOpen, setWatchDropdownOpen ] = useState(false);

  function toggleWatchDropdown(e: MouseEvent) {
    e.preventDefault();
    setWatchDropdownOpen(!watchDropdownOpen)
  }

  useEffect(() => {
    setWatchDropdownOpen(false)
    if (!params.id) return setShow({});
    const showPromise = fetchShowData(params.id);
    showPromise.then((showData) => {
      const seasonPromises = fetchSeasonData(params.id, showData.seasons);
      setShow(showData);
      Promise.all(seasonPromises).then(data => setSeasonData(data));
    });
  }, [params.id]);

  if (!Object.keys(show).length && !seasonData.length) {
    return <div>Loading...</div>;
  }

  function getContentRating(ratingResults: {results: Rating[]}) {
    return ratingResults.results.find((rating: Rating) => rating.iso_3166_1 === 'US')?.rating || 'NR';
  }

  const contentRating = show.content_ratings ? getContentRating(show.content_ratings) : 'NR';
  const genresString: string = show.genres ? show.genres.map((genre: Genre) => genre.name).join(', ') : '';

  const providers = show?.['watch/providers']?.results?.US ? show['watch/providers'].results?.US?.flatrate : []

  const seasonsList = show.seasons ? show.seasons.map((season: FullSeason, i: number) => {
    return <Season key={season.id} data={{ ...season, ...(seasonData?.[i] || {}) }} />;
  }) : <></>;

  
  let seasonWatchList = ([<></>])
  
  if (!userLoggedIn) {
    seasonWatchList = ([<li key={0}>Log in to add show seasons to your watchlist</li>]);
  } else if (show?.seasons) {
    seasonWatchList = show.seasons.map((season: FullSeason) => {
     return (
      <li key={season.id}>
        <a
          onClick={(e) => {
            toggleWatchDropdown(e)
            void addSeasonToWatchList(show.id, season.season_number, show.status, user.accessToken)
            
          }}
        >
          Season {season.season_number}
        </a>
      </li>
    )});
  }

  return (
    <>
      <img
        src={imageBaseUrl + 'original' + show.backdrop_path}
        className="absolute opacity-25 z-[0] h-128 w-full sm:min-w-3xl object-cover"
        alt={show.name}
      />
      <div className="relative py-4 px-8 flex flex-col gap-4 sm:min-w-3xl z-[10]">
        <div className="h-128">
          <img
            src={imageBaseUrl + 'w300' + show.poster_path}
            className="relative hide-small w-80 float-left mr-8 rounded-xl z-[10] "
            alt={show.name}
          />
          <h1 className="mt-8">{show.name}</h1>
          <h3>
            {contentRating} • {show?.first_air_date ? show.first_air_date.substring(0, 4) : ''} -{' '}
            {show.in_production ? '' : show?.last_air_date ? show.last_air_date.substring(0, 4) : ''} • {genresString}
          </h3>
          <h2 className="font-semibold mt-8">Overview</h2>
          <p className="h-30 overflow-y-auto">{show.overview}</p>
          <details className='dropdown' open={watchDropdownOpen}>
            <summary className="btn m-1 bg-secondary" onClick={toggleWatchDropdown}>
              Add to WatchList
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" d="M4.293 7.793a1 1 0 0 1 1.414 0L12 14.086l6.293-6.293a1 1 0 1 1 1.414 1.414L13.414 15.5a2 2 0 0 1-2.828 0L4.293 9.207a1 1 0 0 1 0-1.414" clipRule="evenodd"/>
              </svg>
            </summary>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              {seasonWatchList}
            </ul>
          </details>
          <h2 className="font-semibold mt-4">Watch on:</h2>
          <div className="flex gap-4 mt-2"><ProviderImage count={3} providers={providers} /></div>
        </div>
        <div>
          <h2 className="mb-4">Seasons</h2>
          <div className="join join-vertical bg-base-100 w-full">{seasonsList}</div>
        </div>
      </div>
    </>
  );
}
