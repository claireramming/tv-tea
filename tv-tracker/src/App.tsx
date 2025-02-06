import Header from './components/Header'
import { BrowserRouter, Route, Routes } from "react-router";
import './App.css'
import ShowPage from './components/ShowPage';
import WatchListPage from './components/WatchListPage';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { UserContext } from './components/UserContext';

function App() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();

  const [userMetadata, setUserMetadata] = useState(null);

  useEffect(() => {
    const getUserMetadata = async () => {
      if (!user?.sub) return
      const domain = "dev-mxo5ack7pqfh6xcm.us.auth0.com";
  
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: `https://${domain}/api/v2/`,
            scope: "read:current_user",
          },
        });
  
        const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user?.sub}`;
  
        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const user_metadata = await metadataResponse.json();
        setUserMetadata({...user, isAuthenticated, ...user_metadata});
      } catch (e: any) {
        console.error(e?.message);
      }
    };
  
    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider value={userMetadata}>
          <Header />
          <Routes>
            <Route path="/" element={<WatchListPage isLoading={isLoading} login={() => loginWithRedirect()}/>} />
            <Route path="show">
              <Route path=":id" element={<ShowPage/>} />
            </Route>
          </Routes>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  )
}

export default App
