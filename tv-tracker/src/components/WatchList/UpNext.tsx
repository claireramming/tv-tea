import { Episode } from "moviedb-promise";
import { SeasonToWatch } from "../../types";
import ProviderImage from "../common/ProviderImage";
import  defaultImage from '../../assets/tv-screen.jpg';

export default function UpNext(props: { 
  isLoading: boolean, 
  watchlist: SeasonToWatch[], 
  add: (showId: number, id: number) => void, 
  start: (id: number) => void, 
  update: (id: number, episodes: number, watchtime: number) => void
}) {

  const notStarted = props.watchlist.filter((season: SeasonToWatch) => !season.datetime_started_at);
  const inProgress = props.watchlist.filter((season: SeasonToWatch) => season.datetime_started_at && !season.datetime_finished_at);
  const completed = props.watchlist.filter((season: SeasonToWatch) => season.datetime_finished_at);
  const today: string = new Date().toLocaleDateString('en-CA');

  const inProgressEps = inProgress.reduce((acc: SeasonToWatch[], season: SeasonToWatch) => {
    if (season.num_episodes_watched < (season.episodes.length || 0)) {
      const nextEpisode: Episode = season.episodes[season.num_episodes_watched];
      if (!nextEpisode?.air_date) return acc;
      if (nextEpisode.air_date < today) {
        acc.push({
          watchlistId: season.id,
          showName: season?.show?.name || '',
          seasonName: season.name,
          episode: nextEpisode,
          providers: season.providers?.US?.flatrate || [],
        });
      }
    }
    return acc;
  }, [])

  const shows = completed.reduce((acc: unknown, season: SeasonToWatch) => {
    const showId = season?.show?.id;
    const seasonNumber = season.season_number;
    if (!acc?.[showId] || acc[showId].season < seasonNumber) {
      acc[showId] = season;
    } 
    return acc
  }, {})

  const nextSeasons = Object.values(shows).reduce((acc: SeasonToWatch[], season: SeasonToWatch) => {
    const hasNextSeason = season.show.number_of_seasons > season.season_number;
    if (hasNextSeason) {
      const currentSeasonIndex = season.show.seasons.findIndex((s: {season_number: number}) => s.season_number === season.season_number);
      const nextSeason = season.show.seasons[currentSeasonIndex + 1]
      const nextSeasonId = nextSeason.id;
      const alreadyStarted = inProgress.find((s: SeasonToWatch) => s.seasonId === nextSeasonId);
      const alreadyAdded = notStarted.find((s: SeasonToWatch) => s.seasonId === nextSeasonId);
      if (alreadyAdded || alreadyStarted) return acc;
      const nextSeasonAirDate = nextSeason?.air_date;
      if (nextSeasonAirDate && nextSeasonAirDate < today) {
        acc.push({...nextSeason, showName: season.show.name, showId: season.show.id, status: season.status});
      }
    }
    return acc
  }, [])

  const readyToWatch = notStarted.reduce((acc: SeasonToWatch[], season: SeasonToWatch) => {
    const airDate = season?.air_date;
    if (airDate && airDate < today) {
      const episodesReady = season.episodes.reduce((acc: number, episode: Episode) => {return episode?.air_date && episode.air_date < today ? acc + 1 : acc}, 0)
      if (!episodesReady) return acc;
      season['episodesReady'] = episodesReady
      acc.push({...season, episodesReady});
    }
    return acc;
  }, [])

  if (!inProgressEps.length && !readyToWatch.length && !nextSeasons.length) {
    const defaultText = "Add more shows to your watchlist to see what's up next";
    const loading = (
      <>
        <span className="loading loading-spinner text-primary"></span>
        <span className="loading loading-spinner text-secondary"></span>
        <span className="loading loading-spinner text-accent"></span>
      </>
    )
    
    return (
    <div className="bg-neutral h-96 font-bold flex items-center justify-center">
      <div className='m-auto'>{props.isLoading ? loading : defaultText}</div>
    </div>
  );
  }
return (
  <>
  <div className="bg-neutral p-4 pb-0 font-bold text-secondary">Up Next:</div>
  <div className="carousel carousel-center bg-neutral max-w-full space-x-4 p-4 w-full">
      {inProgressEps.map(ep => (
        <div key={ep.episode.id} className="carousel-item p-0! card bg-base-100 w-96 h-128 shadow-xl">
          <figure>
            <img
              src={ep.episode?.still_path ? `https://image.tmdb.org/t/p/w500${ep.episode.still_path}` : defaultImage}
              alt={ep.episode.name} />
          </figure>
          <div className="card-body">
            <div className='flex justify-between'>
              <h2 className="card-title">{ep.showName}</h2>
              <h3>{ep.seasonName}</h3>
            </div>
            <div className='flex gap-4'><div className="badge badge-secondary">Episode {ep.episode.episode_number}</div><div>{ep.episode?.runtime ? `${ep.episode.runtime} mins` : ''}</div></div>
            <p className='max-h-16 overflow-y-auto'>{ep.episode?.overview || ''}</p>
            <div className="card-actions justify-between">
              <ProviderImage count={1} providers={ep.providers} />
              <button className="btn btn-primary mt-auto" onClick={() => props.update(ep.watchlistId, ep.episode.episode_number, ep.episode.runtime)}>Mark As Watched</button>
            </div>
          </div>
        </div>
      ))}
      {readyToWatch.map(season => (
        <div key={season.id} className="carousel-item p-0! card bg-base-100 w-96 h-128 shadow-xl">
          <figure>
            <img
              src={season.show?.backdrop_path ? `https://image.tmdb.org/t/p/w500${season.show.backdrop_path}` : defaultImage}
              alt={season.show.name + ' ' + season.name} />
          </figure>
          <div className="card-body">
            <div className='flex justify-between'>
            <h2 className="card-title">
              {season.show.name}
              </h2>
              {season.name}
            </div>
            <div className="badge badge-secondary">{season.episodesReady} Ready</div>
            <p className='max-h-16 overflow-y-auto'>{season?.overview || ''}</p>
            <div className="card-actions justify-between">
              <ProviderImage count={1} providers={season.providers?.US?.flatrate || []} />
              <button className="btn btn-primary mt-auto" onClick={() => props.start(season.id)}>Start Watching</button>
            </div>
          </div>
        </div>
      ))}
      {nextSeasons.map(season => (
        <div key={season.id} className="carousel-item p-0! card bg-base-100 w-96 h-128 shadow-xl">
        <figure>
          <img
            className='w-full h-54 object-cover'
            src={season?.poster_path ? `https://image.tmdb.org/t/p/w500${season.poster_path}` : defaultImage}
            alt={season.showName + ' ' + season.name} />
        </figure>
        <div className="card-body">
          <div className='flex justify-between'>
            <h2 className="card-title">
              {season.showName}
            </h2>
            {season.name}
          </div>
          <div className="badge badge-secondary">{season?.episode_count} Episodes</div>
          <p className='max-h-24 overflow-y-auto'>{season?.overview || ''}</p>
          <div className="grow-1 card-actions justify-end">
            <button className="btn btn-primary mt-auto" onClick={() => props.add(season.showId, season.season_number, season.status)}>Add to Watchlist</button>
          </div>
        </div>
      </div>
      ))}
  </div>
  </>
  );
};