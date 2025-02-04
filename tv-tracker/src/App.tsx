import Header from './components/Header'
import { BrowserRouter, Route, Routes } from "react-router";
import './App.css'
import ShowPage from './components/ShowPage';
import WatchListPage from './components/WatchListPage';

function App() {

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<WatchListPage sessionId='' />} />
          <Route path="show">
            <Route path=":id" element={<ShowPage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
