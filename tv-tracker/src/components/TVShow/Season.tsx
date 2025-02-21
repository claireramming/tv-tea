import { SimpleEpisode } from "moviedb-promise";
import { FullSeason } from "../../types";

export default function Season(props: { data: FullSeason }) {
  const season = props.data;
  const episodeList = season?.episodes?.map((episode: SimpleEpisode) => {
    return (
      <div key={episode.id} className="collapse collapse-arrow join-item border-base-300 border w-full">
        <input type="checkbox" name="season-accordian" />
        <div className="collapse-title font-semibold flex justify-between">
          <span className="text-lg font-semibold">
            {episode.episode_number}. {episode.name}
          </span>
          <div>{episode.air_date}</div>
        </div>
        <div className="collapse-content text-sm">{episode.overview}</div>
      </div>
    );
  }) || <div></div>;

  return (
    <div key={season.id} className="collapse collapse-arrow join-item border-base-300 border w-full">
      <input type="checkbox" name="season-accordian" />
      <div className="collapse-title font-semibold flex justify-between">
        <div>
          <span className="font-semibold">{season.name}</span>{' '}
          {season.air_date ? `(${season.air_date?.substring(0, 4)})` : ''}
        </div>
        <div>Episodes: {season.episode_count}</div>
      </div>
      <div className="collapse-content text-sm">
        <div className="join join-vertical bg-base-100 w-full">{episodeList}</div>
      </div>
    </div>
  );
}
