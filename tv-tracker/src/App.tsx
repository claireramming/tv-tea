import Header from './components/Header'
import { BrowserRouter, Route, Routes } from "react-router";
import './App.css'
import ShowPage from './components/ShowPage';
import WatchListPage from './components/WatchListPage';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { UserContext, User } from './components/UserContext';
import { getUserProfile, createUserProfile } from './utils';


function App() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently, logout } = useAuth0();

  const [userMetadata, setUserMetadata] = useState({} as User);

  const logoutOfApp = async () => {
    await logout({ logoutParams: { returnTo: window.location.origin } })
    setUserMetadata({})
  }

  async function getOrCreateUserProfile(id: string, token: string) {
    console.log(id, token);
    if (!id || !token) return;
    // try to pull user profile
    const profile = await getUserProfile(id, token);
        
    // if !user profile, create one
    if (!profile) {
      console.log('no profile found, creating one');
      await createUserProfile(id, token);
    } 
  }

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
      setUserMetadata({...user, isAuthenticated, ...user_metadata, accessToken });
      getOrCreateUserProfile(user.sub, accessToken);
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (!user?.sub) return
    getUserMetadata().then(() => getOrCreateUserProfile(userMetadata.sub || '', userMetadata.accessToken || ''));
  }, [user?.sub]);

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider value={userMetadata}>
          <Header logout={logoutOfApp}/>
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
