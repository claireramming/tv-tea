import { useState } from "react";
import { SeasonToWatch } from "../../types";
import SeasonTile from "./SeasonTile";

export default function WatchList(props: { 
  isLoading: boolean,
  watchlist: SeasonToWatch[],
  remove: (id: number) => void,
  start: (id: number) => void,
  finish: (id: number) => void,
  update: (id: number, episodes: number, watchtime: number) => void,
}) {  
  const [tabIndex, setTabIndex] = useState<number>(1);

  let tabContent: SeasonToWatch[] = [];
  if (tabIndex === 0) {
    tabContent = props.watchlist.filter((season) => !season.datetime_started_at);
  } else if (tabIndex === 1) {
    tabContent = props.watchlist.filter((season) => season.datetime_started_at && !season.datetime_finished_at);
  } else if (tabIndex === 2) {
    tabContent = props.watchlist.filter((season) => season.datetime_finished_at);
  }

  return (
    <>
    <div role="tablist" className="tabs tabs-lg tabs-border flex justify-center items-center sticky top-18 z-[10] bg-white dark:bg-neutral h-18">
      <a role="tab" className={`tab ${tabIndex === 0 ? 'tab-active' : ''}`} onClick={() => setTabIndex(0)}>To Watch</a>
      <a role="tab" className={`tab ${tabIndex === 1 ? 'tab-active' : ''}`} onClick={() => setTabIndex(1)}>In Progress</a>
      <a role="tab" className={`tab ${tabIndex === 2 ? 'tab-active' : ''}`} onClick={() => setTabIndex(2)}>Completed</a>
    </div>
      {tabContent.length ?
        tabContent.map((season: SeasonToWatch) => { 
        return (
        <div key={season.id} className='p-4 max-w-5xl mx-auto'>
          <SeasonTile season={season} remove={props.remove} start={props.start} finish={props.finish} update={props.update}/>
          </div>
        ) 
        }) : props.isLoading ? (
          <>
            <span className="loading loading-spinner text-primary"></span>
            <span className="loading loading-spinner text-secondary"></span>
            <span className="loading loading-spinner text-accent"></span>
          </>
        )
        : (<div className="h-72 flex items-center justify-center"><div>No Seasons Found</div></div>)
      }
    </>
  )
}