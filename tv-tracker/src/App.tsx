/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import Header from './components/Header';
import { BrowserRouter, Route, Routes } from 'react-router';
import './App.css';
import ShowPage from './components/TVShow/ShowPage';
import WatchListPage from './components/WatchList/WatchListPage';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { UserContext, User } from './contexts/UserContext';
import { getUserProfile, createUserProfile } from './utils';
import Profile from './components/Profile/Profile';

function App() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently, logout } =
    useAuth0();

  const [userMetadata, setUserMetadata] = useState({} as User);

  let metaDataLoading = false;

  const logoutOfApp = async () => {
    await logout({ logoutParams: { returnTo: window.location.origin } });
    setUserMetadata({});
  };

  async function getOrCreateUserProfile(id: string, token: string) {
    if (!id || !token) return;
    // try to pull user profile
    const profile = await getUserProfile(id, token);

    // if !user profile, create one
    if (!profile) {
      await createUserProfile(id, token);
    }
  }

  const getUserMetadata = async () => {
    if (!user?.sub) return;
    metaDataLoading = true
    const domain = 'dev-mxo5ack7pqfh6xcm.us.auth0.com';

    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: `https://${domain}/api/v2/`,
          scope: 'read:current_user'
        }
      });

      const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user?.sub}`;

      const metadataResponse = await fetch(userDetailsByIdUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const user_metadata = await metadataResponse.json();
      setUserMetadata({ ...user, isAuthenticated, ...user_metadata, accessToken });
      metaDataLoading = false
      getOrCreateUserProfile(user.sub, accessToken);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user?.sub) return;
    getUserMetadata().then(() =>
      getOrCreateUserProfile(userMetadata.sub || '', userMetadata.accessToken || '')
    );
  }, [user?.sub]);

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider value={userMetadata}>
          <Header logout={logoutOfApp} login={() => loginWithRedirect()} />
          <Routes>
            <Route
              path="/"
              element={<WatchListPage isLoading={isLoading || metaDataLoading} login={() => loginWithRedirect()} />}
            />
            <Route path="show">
              <Route path=":id" element={<ShowPage />} />
            </Route>
            <Route path="profile" element={<Profile />}/>
          </Routes>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  );
}

export default App;
