import tvLogo from '../assets/tv-logo.png'
import '../App.css'
import Search from './Search'

export default function Header() {
  return (
    <>
    <header className='flex items-center h-16'>
      <a href="/" target="_blank">
        <img src={tvLogo} className="logo" alt="tv tracker" />
      </a>
      <Search />
    </header>
    </>
  )
}