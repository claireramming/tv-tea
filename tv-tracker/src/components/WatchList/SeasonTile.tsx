import { SeasonToWatch } from "../../types";
import ProviderImage from "../common/ProviderImage";


export default function SeasonTile(props: { season: SeasonToWatch }) {

  const providers = (props.season?.["watch/providers"]) ? props.season['watch/providers'].results?.US?.flatrate : [];

  return (
    <div className="card card-side w-full h-96 bg-base-100 shadow-xl mb-4">
      <figure>
        <img src={`https://image.tmdb.org/t/p/w500${props.season.poster_path}`} alt={props.season.name} />
      </figure>
      <div className="card-body">
        <h1 className="card-title">{props.season.show_id}</h1>
        <h2 className="card-title">{props.season.name} <div className="badge badge-primary">{props.season.episodes.length} Episodes</div></h2>
        <div className='h-full'><ProviderImage count={1} providers={providers} /></div>
        <div className="card-actions justify-end">
          <button className="bg-accent! btn">Start Watching</button>
          <button className="bg-secondary! btn">Remove</button>
        </div>
      </div>
    </div>
  )
}