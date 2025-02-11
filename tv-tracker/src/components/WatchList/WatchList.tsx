import { useState } from "react";
import { SeasonToWatch } from "../../types";
import SeasonTile from "./SeasonTile";

export default function WatchList(props: { 
  watchlist: SeasonToWatch[],
  remove: (id: number) => void,
  start: (id: number) => void,
  finish: (id: number) => void,
  update: (id: number, episodes: number) => void,
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
    <div role="tablist" className="tabs tabs-boxed">
      <a role="tab" className={`tab ${tabIndex === 0 ? 'tab-active' : ''}`} onClick={() => setTabIndex(0)}>To Watch</a>
      <a role="tab" className={`tab ${tabIndex === 1 ? 'tab-active' : ''}`} onClick={() => setTabIndex(1)}>In Progress</a>
      <a role="tab" className={`tab ${tabIndex === 2 ? 'tab-active' : ''}`} onClick={() => setTabIndex(2)}>Completed</a>
    </div>
      {tabContent.map((season: SeasonToWatch) => { 
        return (
        <div key={season.id}>
          <SeasonTile season={season} remove={props.remove} start={props.start} finish={props.finish} update={props.update}/>
          </div>
        ) 
      })}
    </>
  )
}