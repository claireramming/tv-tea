import { useState } from "react";

export default function AddSeasonModal(props: {episodeCount: number, watchlistId: number, start: (id: number|undefined) => void, finish: (id: number|undefined) => void}) {
  const [preWatched, setPreWatched] = useState<number>(0);

  return (
    <dialog id={`add_season_${props.watchlistId}`} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Have you watched any episodes before today?</h3>
        <p className="py-4">
          You can add episodes you&apos;ve already watched now and they won&apos;t count towards your stats for the day.
        </p>
        <p>If you&apos;ve already watched the whole season, you can hit the &quot;Complete&quot; button to 
            automatically add this season to your completed list.</p>
        <div className="modal-action">
          <form method="dialog">
            <input 
              type="number"
              className="input validator"
              required
              value={preWatched}
              onChange={(e) => setPreWatched(Number(e.target.value))}
              min={0} max={props.episodeCount} title={`Must be between be 0 to ${props.episodeCount}`} />
            <p className="validator-hint">Must be between be 0 and {props.episodeCount}</p>
              <button className="btn btn-secondary" onClick={() => void props.finish(props.watchlistId)}>Complete</button>
              <button className="btn btn-primary" onClick={() => void props.start(props.watchlistId, preWatched)}>Start Watching</button>
          </form>
        </div>
      </div>
    </dialog>
  )
}