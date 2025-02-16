import { useContext, useEffect, useState } from 'react';
import { UserContext, User } from '../../contexts/UserContext';
import Loading from '../common/Loading';
import { getSeasonsFinishedSince, getUserStats } from '../../utils';

type StatsInfo = {
  date: string;
  num_watched_episodes: number;
  minutes_watched: number;
  id: string;
}

export default function StatsPage() {
  const user: User = useContext(UserContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<StatsInfo[]>([]);
  const [aggregation, setAggregation] = useState<string>('week');
  const [totalEpisodes, setTotalEpisodes] = useState<number>(0);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [totalSeasons, setTotalSeasons] = useState<number>(0);
  
  useEffect(() => {
    if (user?.isAuthenticated) {
      void getUserStats(user?.accessToken).then(data => setStats(data))
    }
  }, [user]);

  function getLastSunday() {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const lastSunday = new Date(date);
    lastSunday.setDate(date.getDate() - dayOfWeek);
    return lastSunday.toISOString().slice(0, 10);
  }
  function getFirstOfTheMonth() {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().slice(0, 10);;
  }
  function getFirstOfTheYear() {
    const date = new Date();
    date.setMonth(0);
    date.setDate(1);
    return date.toISOString().slice(0, 10);;
  }

  useEffect(() =>{
    if (!stats.length || !user) return;
    setIsLoading(true);
    const aggregationFunctions = {
      'week': getLastSunday,
      'month': getFirstOfTheMonth,
      'year': getFirstOfTheYear,
      'all': () => new Date(0).toISOString().slice(0, 10),
    }

    async function getStats() {
      const startDate = aggregationFunctions[aggregation]();
      let eps = 0
      let mins = 0
      stats.forEach((dateObj: {id: string, date: string, num_watched_episodes: number, minutes_watched: number}) => {
        const statDate = dateObj.date;
        if (statDate >= startDate) {
          eps += dateObj.num_watched_episodes;
          mins += dateObj.minutes_watched;
        }
      })
      setTotalEpisodes(eps);
      setTotalMinutes(mins);
      const finishedSeasons = await getSeasonsFinishedSince(startDate, user?.accessToken)
      setTotalSeasons(finishedSeasons.length);
    }

    
    void getStats().then(() => setIsLoading(false));
    
  }, [aggregation, stats, user])

  if (!user) return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div>Please log in to see your stats</div>
        </div>
      </div>
    </div>
  );
  else return (
    <div className="w-full flex flex-col items-center justify-center py-8">

    <div className="join">
      <input onClick={() => {if (aggregation != 'week') setAggregation('week')}} type="radio" name="aggregation" id="week" aria-label="This Week" className="btn join-item" defaultChecked />
      <input onClick={() => {if (aggregation != 'month') setAggregation('month')}} type="radio" name="aggregation" id="month" aria-label="This Month" className="btn join-item" />
      <input onClick={() => {if (aggregation != 'year') setAggregation('year')}} type="radio" name="aggregation" id="year" aria-label="This Year" className="btn join-item" />
      <input onClick={() => {if (aggregation != 'all') setAggregation('all')}} type="radio" name="aggregation" id="all" aria-label="All-time" className="btn join-item" />
    </div>

    {isLoading ? <div className='p-10'><Loading /></div> : 
    <div className="stats stats-vertical sm:stats-horizontal shadow mx-auto w-full max-w-3xl mt-8 bg-base-100">
      <div className="stat">
        <div className="stat-title">Episodes Watched</div>
        <div className="stat-value">{totalEpisodes}</div>
      </div>

      <div className="stat">
        <div className="stat-title">Minutes Watched</div>
        <div className="stat-value">{totalMinutes}</div>
      </div>

      <div className="stat">
        <div className="stat-title">Seasons Completed</div>
        <div className="stat-value">{totalSeasons}</div>
      </div>
    </div>}
    </div>
  )
}