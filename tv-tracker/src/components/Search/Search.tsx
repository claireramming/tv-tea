import '@/App.css';
import { useState } from 'react';
import { MovieDb, TvResult, TvResultsResponse } from 'moviedb-promise';
import ShowListItem from './ShowListItem';

export default function Search() {
  const moviedb = new MovieDb(process.env.TMDB_API_KEY || '');
  const [timer, setTimer] = useState<NodeJS.Timeout>();
  const [searchQuery, setSearchQuery] = useState('');
  const [shows, setShows] = useState<TvResult[]>([]);
  const showsList = shows.map((show) => (
    <ShowListItem key={show.id} data={show} handleClick={handleClick} />
  ));

  /**
   * Search for shows when user types in search bar.
   * @param event Search bar input event
   */
  function debounceSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(event.target.value);
    clearTimeout(timer);
    setTimer(setTimeout(() => void searchShows(event.target.value), 300));
  }

  /**
   * Clear search results and search bar when user clicks on a show
   */
  function handleClick() {
    setSearchQuery('');
    setShows([]);
  }

  /**
   * Make API call to search for shows and sets shows state to the results.
   * @param searchText Search bar input
   */
  async function searchShows(searchText: string) {
    if (searchText.trim()) {
      const resp: TvResultsResponse = await moviedb.searchTv({ query: searchText });
      setShows(resp.results || []);
    } else {
      setShows([]);
    }
  }

  return (
    <div className="relative">
      <div className="flex justify-center">
        <input
          value={searchQuery}
          className="input input-bordered w-36 md:w-auto"
          type="text"
          placeholder="Search for a show..."
          onChange={debounceSearch}
        />
      </div>
      <ul className="absolute top-10 z-[20] sm:right-1/8 bg-white dark:bg-gray-800 sm:max-w-160 w-[160%] sm:w-full max-h-96 transition-[height] duration-1000 ease-in-out overflow-y-auto">
        {showsList}
      </ul>
    </div>
  );
}
