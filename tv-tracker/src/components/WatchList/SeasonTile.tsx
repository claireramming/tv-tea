import { SeasonToWatch } from "../../types";
import ProgressBar from "../common/ProgressBar";
import ProviderImage from "../common/ProviderImage";
import defaultImage from '../../assets/tv-screen.jpg';

export default function SeasonTile(props: {
  season: SeasonToWatch,
  remove: (id: number|undefined) => void,
  start: (id: number|undefined) => void,
  finish: (id: number|undefined) => void,
  update: (id: number|undefined, episodes: number|undefined) => void,
}) {

  const episodesWatched = props.season.num_episodes_watched;

  const progress = (props.season.datetime_started_at && !props.season.datetime_finished_at) ? (
    <ProgressBar 
      watchlistId={props.season.watchlistId}
      episodesWatched={episodesWatched} 
      totalEpisodes={props.season.episodes.length} 
      update={props.update} />
    ) : (<></>)

  const providers = (props.season?.providers) ? props.season.providers?.US?.flatrate : [];
  const actionButton = !props.season.datetime_started_at ? 
    <button className="bg-accent! btn" onClick={() => void props.start(props.season.watchlistId)}>Start Watching</button>
    : !props.season.datetime_finished_at ? 
    <button className="bg-accent! btn" onClick={() => void props.finish(props.season.watchlistId)}>Finish Watching</button>
    : (<></>)

  const startDate = props.season.datetime_started_at && !props.season.datetime_finished_at ? (
    <p>Started: {new Date(props.season.datetime_started_at).toLocaleDateString()}</p>) : (<></>)
  const endDate = props.season.datetime_finished_at ? (
    <p>Completed: {new Date(props.season.datetime_finished_at).toLocaleDateString()}</p>) : (<></>)

  return (
    <div className="card p-0! max-w-[500px] sm:max-w-full w-full h-96 sm:h-72 bg-base-100 shadow-xl mb-4 sm:card-side">
      <figure>
        <img className='max-w-[500px] sm:max-w-[192px]!' src={props.season?.poster_path ? `https://image.tmdb.org/t/p/w500${props.season.poster_path}` : defaultImage} alt={props.season.name} />
      </figure>
      <div className="card-body">
        <div className='flex justify-between'>
          <h1 className="card-title text-4xl!">{props.season.show?.name}</h1>
          <div>
            {startDate}
            {endDate}
          </div>
        </div>
        <h2 className="card-title">{props.season.name} <div className="badge badge-primary">{props.season.episodes.length} Episodes</div></h2>
        <div className="flex justify-between">
          <div className='shrink-0 mr-4 size-10 sm:size-22'><ProviderImage count={1} providers={providers} /></div>
          {progress}
        </div>
        <div className="card-actions justify-end">
          {actionButton}
          <button className="bg-secondary! btn" onClick={() => void props.remove(props.season.watchlistId)}>Remove</button>
        </div>
      </div>
    </div>
  )
}