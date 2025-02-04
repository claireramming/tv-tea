import tvLogo from '../assets/tv-logo.png'
import '../App.css'
import Search from './Search'

export default function Header() {
  let sessionId = ''
  return (
    <div className="navbar justify-between bg-base-100">
      <div className="">
          <img src={tvLogo} className="logo" alt="tv tracker" />
      </div>
      <div className="form-control w-full">
          <Search />
        </div>
        <ul className="menu menu-horizontal px-1">
        <li><a href='/'>WatchList</a></li>
        </ul>
      <div>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <a className="justify-between">
                Profile
                <span className="badge">New</span>
              </a>
            </li>
            <li><a>Settings</a></li>
            <li><a>Log {sessionId ? 'out' : 'in'}</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}