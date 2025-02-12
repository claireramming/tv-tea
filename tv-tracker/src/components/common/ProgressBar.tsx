export default function ProgressBar(props: { watchlistId: number, totalEpisodes: number, episodesWatched: number, update: (id: number, episodes: number) => void }) {
  return (
    <div className='flex gap-1 items-center h-12 px-4 bg-neutral rounded-full'>
      <div className='text-accent font-bold'>{props.episodesWatched}/{props.totalEpisodes}</div>
      <progress className="progress progress-accent w-56" value={props.episodesWatched} max={props.totalEpisodes}></progress>
      <button className="btn btn-square p-0! w-8 h-8" onClick={() => props.update(props.watchlistId, props.episodesWatched - 1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <g className="minus-outline">
            <path fill="currentColor" fillRule="evenodd" d="M21 12a1 1 0 0 1-1 1H4a1 1 0 1 1 0-2h16a1 1 0 0 1 1 1" className="Vector" clipRule="evenodd"/>
          </g>
        </svg>
      </button>
      <button className="btn btn-square p-0! w-8 h-8" onClick={() => props.update(props.watchlistId, props.episodesWatched + 1)}>
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