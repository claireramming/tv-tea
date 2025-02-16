import { Episode } from "moviedb-promise";

export default function ProgressBar(props: { watchlistId: number, episodes: Episode[], episodesWatched: number, update: (id: number, episodes: number, watchtime: number) => void }) {
  const totalEpisodes = props.episodes.length;
  const lastEpisodeLength: number = props?.episodes?.[props.episodesWatched - 1]?.runtime || 0;
  const nextEpisodeLength: number = props?.episodes?.[props.episodesWatched]?.runtime || 0;
  return (
    <div className='flex gap-1 items-center h-12 px-4 bg-neutral rounded-full w-full max-w-2xs'>
      <div className='text-accent font-bold'>{props.episodesWatched}/{totalEpisodes}</div>
      <progress className="progress progress-accent" value={props.episodesWatched} max={totalEpisodes}></progress>
      <button className="btn btn-square p-0! w-8 h-8" onClick={() => props.update(props.watchlistId, props.episodesWatched - 1, lastEpisodeLength)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <g className="minus-outline">
            <path fill="currentColor" fillRule="evenodd" d="M21 12a1 1 0 0 1-1 1H4a1 1 0 1 1 0-2h16a1 1 0 0 1 1 1" className="Vector" clipRule="evenodd"/>
          </g>
        </svg>
      </button>
      <button className="btn btn-square p-0! w-8 h-8" onClick={() => props.update(props.watchlistId, props.episodesWatched + 1, nextEpisodeLength)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <g className="plus-outline">
            <g fill="currentColor" fillRule="evenodd" className="Vector" clipRule="evenodd">
              <path d="M12 3a1 1 0 0 1 1 1v16a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1"/>
              <path d="M21 12a1 1 0 0 1-1 1H4a1 1 0 1 1 0-2h16a1 1 0 0 1 1 1"/>
            </g>
          </g>
        </svg>
      </button>
    </div>
  )
}