import { useContext } from "react";
import { UserContext, User } from "./UserContext";
import { SimpleFetch } from "../utils";

export default function WatchListPage(props: { isLoading: Boolean, login: () => void }) {
  const user: User = useContext(UserContext);

  async function makeGETRequest() {
    const url = 'api/private';
    
    console.log(await SimpleFetch.get(url, {}, user?.accessToken));
  }

  if (props.isLoading) {
    <span className="loading loading-infinity loading-lg"></span>
  }

  if (user && user?.isAuthenticated) {
    return (
      <div>
        <img src={user.picture} alt={user.name} referrerPolicy="no-referrer"/>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <button className="btn btn-primary" onClick={makeGETRequest}>Test API</button>
      </div>
    )
  } else {
    return (
      <div className="hero bg-base-200 min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Hello there</h1>
            <p className="py-6">
              Log in or create an account to start tracking your favorite shows.
            </p>
            <button className="btn btn-primary" onClick={props.login}>Get Started</button>
            <button className="btn btn-primary" onClick={makeGETRequest}>Test API</button>
          </div>
        </div>
      </div>
    )
  }
}