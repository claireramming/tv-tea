import '../App.css'
import { useState } from 'react'
import { MovieDb, TvResult, TvResultsResponse } from 'moviedb-promise'
import ShowListItem from './ShowListItem'

export default function Search() {
  const moviedb = new MovieDb('2a45495eb00bed3267d8daa48231f4d5')
  const [timer, setTimer] = useState<NodeJS.Timeout>()
  const [searchQuery, setSearchQuery] = useState('')
  const [ shows, setShows ] = useState<TvResult[]>([])
  const showsList = shows.map(show => <ShowListItem key={show.id} data={show} handleClick={handleClick} />)

  /**
   * Search for shows when user types in search bar.
   * @param event Search bar input event
   */
  function debounceSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(event.target.value)
    clearTimeout(timer)
    setTimer(setTimeout(() => searchShows(event.target.value), 300))
  }

  /**
   * Clear search results and search bar when user clicks on a show
   */
  function handleClick() {
    setSearchQuery('')
    setShows([])
  }

  /**
   * Make API call to search for shows and sets shows state to the results.
   * @param searchText Search bar input
   */
  async function searchShows(searchText: string) {
    if (searchText.trim()) {
      let resp: TvResultsResponse = await moviedb.searchTv({ query: searchText })
      setShows(_ => resp.results || [])
    } else {
      setShows([])
    }
  }

  return (
    <div className='grow flex items-center relative mr-4'>
      <div className="grow max-w-2xl h-10 border border-zinc-500 rounded-full">
        <input value={searchQuery} className='py-2 px-4 w-full outline-none border-0' type="text" placeholder="Search for a show..." onChange={debounceSearch} />
      </div>
      <ul className='absolute top-10 z-20 left-4 bg-white dark:bg-gray-800 max-w-160 w-full max-h-96 transition-[height] duration-1000 ease-in-out overflow-y-auto'>
        {showsList}
      </ul>
    </div>
  )
}