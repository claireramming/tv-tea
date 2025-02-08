import { useContext, useEffect, useState } from "react";
import { UserContext, User } from "../../contexts/UserContext";
import { getUserProfile } from "../../utils";
import { ProfileInfo } from "../../types";

export default function Profile() {
  const user: User = useContext(UserContext);
  const [profile, setProfile] = useState<ProfileInfo>();

  useEffect(() => {
  if (user?.isAuthenticated) {
    getUserProfile(user?.sub || '', user?.accessToken || '').then(data => setProfile(data))
  }
}, [user]);

  if (!user) return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div>Please log in to see your profile</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
        <h1 className="text-5xl font-bold">Profile</h1>
          <img className="mx-auto mask mask-squircle" src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p>Country: {profile?.country || ''}</p>
          <p>Preferred Providers: {profile?.providers?.join(', ') || 'none'}</p>
        </div>
      </div>
    </div>
  );
}