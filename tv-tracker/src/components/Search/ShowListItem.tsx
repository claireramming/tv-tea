import { TvResult } from 'moviedb-promise';
import { Link } from 'react-router';
import { imageBaseUrl } from '../../constants';

export default function ShowListItem(props: { data: TvResult; handleClick: () => void }) {
  const showImage = imageBaseUrl + 'w92' + props.data.poster_path;
  return (
    <li key={props.data.id} className="z-[20]">
      <Link to={'/show/' + props.data.id} onClick={props.handleClick}>
        <div className="text-inherit flex gap-4 hover:bg-violet-100 dark:hover:bg-zinc-600 items-center h-16 border-b-1 border-color-zinc">
          <img src={showImage} className="h-16 w-10" alt={props.data.name} />
          <div className="font-bold overflow-hidden h-6">{props.data.name}</div>
          <div>({props.data.first_air_date?.substring(0, 4) || 'unknown'})</div>
        </div>
      </Link>
    </li>
  );
}
