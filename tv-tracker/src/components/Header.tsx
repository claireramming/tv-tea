import tvLogo from '@/assets/tv-logo.png';
import '@/App.css';
import Search from './Search/Search';
import { useContext } from 'react';
import { UserContext, User } from '../contexts/UserContext';

export default function Header(props: { logout: () => void, login: () => void }) {
  const user: User | null = useContext(UserContext);

  const availableOptions = user?.isAuthenticated ? (
    <>
      <li>
        <a href='profile'>Profile</a>
      </li>
    </>
  ) : (<></>);

  return (
    <div className="navbar justify-between bg-base-100 sticky top-0 z-5">
      <div className="">
        <img src={tvLogo} className="logo" alt="tv tracker" />
      </div>
      <div className="form-control w-full">
        <Search />
      </div>
      <ul className="menu menu-horizontal px-1">
        <li>
          <a href="/">WatchList</a>
        </li>
      </ul>
      <div>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt={user?.name || 'user not logged in'}
                src={
                  user?.picture ||
                  'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                }
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            {availableOptions}
            <li>
              <a href='faq'>FAQs and Credits</a>
            </li>
            <li>
              <a onClick={user?.isAuthenticated ? props.logout : props.login}>Log {user?.isAuthenticated ? 'out' : 'in'}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
