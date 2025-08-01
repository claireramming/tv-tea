import { useContext, useEffect, useState } from "react";
import { UserContext, User } from "../../contexts/UserContext";
import { getUserProfile, updateUserProfile } from "../../utils";
import { ProfileInfo } from "../../types";
import * as countryCodes from "country-codes-list";

export default function Profile() {
  const user: User = useContext(UserContext);
  const [profile, setProfile] = useState<ProfileInfo>();
  const [editing, setEditing] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>(profile?.name || user?.name || '');
  const [userCountry, setUserCountry] = useState<string>(profile?.country || '');

  const myCountryCodesObject = countryCodes.customList(
    "countryCode",
    "[{countryCode}] {countryNameEn}"
  );

  const countryCodesList = Object.entries(myCountryCodesObject).map(([code, name]) => (<option selected={code === userCountry} key={code} value={code}>{name}</option>));

  function toggleEdit() {
    setEditing(!editing);
  }

  async function saveProfile() {
    if (!user?.sub) return;
    const updatedProfile: ProfileInfo = {
      name: userName,
      country: userCountry,
      providers: profile?.providers || []
    };
    const profileResponse: ProfileInfo | null = await updateUserProfile(user.sub, updatedProfile, user.accessToken);
    if (profileResponse) {
      setProfile(profileResponse);
    } else {
      setUserName(profile?.name || '');
      setUserCountry(profile?.country || '');
    }
    setEditing(false);
  }

  function cancelEditing() {
    setUserName(profile?.name || user?.name || '');
    setUserCountry(profile?.country || '');
    setEditing(false);
  }

  useEffect(() => {
  if (user?.isAuthenticated) {
    void getUserProfile(user?.sub || '', user?.accessToken || '').then(data => setProfile(data))
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

  if (!editing) return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
        <h1 className="text-5xl font-bold">Profile</h1>
          <img className="mx-auto mask mask-squircle" src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
          <h2>{userName}</h2>
          <p>{user.email}</p>
          <p>Country: {userCountry}</p>
          <p>Preferred Providers: {profile?.providers?.join(', ') || 'none'}</p>
          <button className="btn btn-primary" onClick={toggleEdit}>Edit Profile</button>
        </div>
      </div>
    </div>
  );

  if (editing) return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Editing Profile</h1>
          <img className="mx-auto mask mask-squircle" src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
          <input 
            type="text" 
            placeholder="Name" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)} 
            className="input input-bordered w-full max-w-xs mb-4"
          />
          <select defaultValue="Pick a country code" className="select" onChange={(e) => setUserCountry(e.target.value)}>
            <option disabled={true}>Pick a country code</option>
            {countryCodesList}
          </select>
          <button className="btn btn-primary mr-2" onClick={saveProfile}>Save</button>
          <button className="btn btn-secondary" onClick={cancelEditing}>Cancel</button>
        </div>
      </div>
    </div>
  );
}