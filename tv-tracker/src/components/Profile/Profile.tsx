import { useContext, useEffect, useState } from "react";
import { UserContext, User } from "../../contexts/UserContext";
import { ProfileContext } from "../../contexts/ProfileContext";
import { updateUserProfile, fetchProvidersByCountry } from "../../utils";
import { ProfileInfo } from "../../types";
import { WatchProvider } from "moviedb-promise";
import * as countryCodes from "country-codes-list";
import { imageBaseUrl } from "../../constants";
import Loading from "../common/Loading";

type ProviderState = 'preferred' | 'ignored' | 'neutral';

function providerState(id: number | undefined, preferredIds: number[], ignoredIds: number[]): ProviderState {
  if (id === undefined) return 'neutral';
  if (preferredIds.includes(id)) return 'preferred';
  if (ignoredIds.includes(id)) return 'ignored';
  return 'neutral';
}

export default function Profile({ setProfile }: { setProfile: (p: ProfileInfo) => void }) {
  const user: User = useContext(UserContext);
  const profileCtx = useContext(ProfileContext);

  // Edit form state — synced from context whenever it changes
  const [editing, setEditing] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>(profileCtx?.name || user?.name || '');
  const [userCountry, setUserCountry] = useState<string>(profileCtx?.country || '');
  const [preferredIds, setPreferredIds] = useState<number[]>(profileCtx?.preferred_providers ?? []);
  const [ignoredIds, setIgnoredIds] = useState<number[]>(profileCtx?.ignored_providers ?? []);
  const [availableProviders, setAvailableProviders] = useState<WatchProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState<boolean>(false);

  // Sync form defaults whenever the context profile loads or changes
  useEffect(() => {
    setUserName(profileCtx?.name || user?.name || '');
    setUserCountry(profileCtx?.country || '');
    setPreferredIds(profileCtx?.preferred_providers ?? []);
    setIgnoredIds(profileCtx?.ignored_providers ?? []);
  }, [profileCtx, user?.name]);

  // Fetch available providers whenever country is set (view + edit mode both need them)
  useEffect(() => {
    if (userCountry) {
      setLoadingProviders(true);
      void fetchProvidersByCountry(userCountry).then(providers => {
        setAvailableProviders(providers);
        setLoadingProviders(false);
      });
    }
  }, [userCountry]);

  const myCountryCodesObject = countryCodes.customList(
    "countryCode",
    "[{countryCode}] {countryNameEn}"
  );
  const countryCodesList = Object.entries(myCountryCodesObject).map(([code, name]) => (
    <option key={code} value={code}>{name}</option>
  ));

  function toggleProviderState(id: number) {
    const current = providerState(id, preferredIds, ignoredIds);
    if (current === 'neutral') {
      setPreferredIds([...preferredIds, id]);
    } else if (current === 'preferred') {
      setPreferredIds(preferredIds.filter(p => p !== id));
      setIgnoredIds([...ignoredIds, id]);
    } else {
      setIgnoredIds(ignoredIds.filter(i => i !== id));
    }
  }

  async function saveProfile() {
    if (!user?.sub) return;
    const updatedProfile: ProfileInfo = {
      id: profileCtx?.id || '',
      name: userName,
      country: userCountry,
      preferred_providers: preferredIds,
      ignored_providers: ignoredIds,
    };
    const profileResponse = await updateUserProfile(user.sub, updatedProfile, user.accessToken);
    if (profileResponse) {
      setProfile(profileResponse);
    } else {
      setUserName(profileCtx?.name || '');
      setUserCountry(profileCtx?.country || '');
      setPreferredIds(profileCtx?.preferred_providers ?? []);
      setIgnoredIds(profileCtx?.ignored_providers ?? []);
    }
    setEditing(false);
  }

  function cancelEditing() {
    setUserName(profileCtx?.name || user?.name || '');
    setUserCountry(profileCtx?.country || '');
    setPreferredIds(profileCtx?.preferred_providers ?? []);
    setIgnoredIds(profileCtx?.ignored_providers ?? []);
    setEditing(false);
  }

  if (!user) return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div>Please log in to see your profile</div>
        </div>
      </div>
    </div>
  );

  if (!profileCtx) return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <Loading />
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
          <div className="mt-2">
            <p className="font-semibold mb-1">Preferred Providers:</p>
            {preferredIds.length > 0
              ? <div className="flex flex-wrap gap-2 justify-center">
                  {availableProviders
                    .filter(p => p.provider_id !== undefined && preferredIds.includes(p.provider_id))
                    .map(p => (
                      <img
                        key={p.provider_id}
                        src={imageBaseUrl + 'w92' + p.logo_path}
                        alt={p.provider_name ?? ''}
                        className="rounded-xl w-10 h-10"
                        title={p.provider_name}
                      />
                    ))}
                </div>
              : <p className="text-sm opacity-60">None selected — edit profile to choose your streaming services</p>
            }
          </div>
          <button className="btn btn-primary mt-4" onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-2xl w-full">
          <h1 className="text-5xl font-bold">Editing Profile</h1>
          <img className="mx-auto mask mask-squircle" src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
          <input
            type="text"
            placeholder="Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="input input-bordered w-full max-w-xs mb-4"
          />
          <select value={userCountry} className="select mb-4" onChange={(e) => setUserCountry(e.target.value)}>
            <option disabled={true} value=''>Pick a country code</option>
            {countryCodesList}
          </select>

          <div className="mb-4">
            <p className="font-semibold mb-1">Streaming Services</p>
            <p className="text-xs opacity-60 mb-3">
              Tap to cycle: <span className="text-success font-bold">✓ preferred</span> → <span className="text-error font-bold">✗ ignored</span> → neutral
            </p>
            {loadingProviders
              ? <div className="flex justify-center py-4"><Loading /></div>
              : availableProviders.length === 0
              ? <p className="text-sm opacity-60">Select a country to see providers</p>
              : <div className="flex flex-wrap gap-3 justify-center max-h-80 overflow-y-auto p-2">
                  {availableProviders.map(p => {
                    if (!p.provider_id || !p.logo_path) return null;
                    const state = providerState(p.provider_id, preferredIds, ignoredIds);
                    return (
                      <button
                        key={p.provider_id}
                        type="button"
                        onClick={() => toggleProviderState(p.provider_id!)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 w-20 cursor-pointer transition-all ${
                          state === 'preferred' ? 'border-success outline outline-2 outline-success bg-success/20' :
                          state === 'ignored'   ? 'border-error bg-error/20 opacity-50' :
                                                  'border-base-300'
                        }`}
                        title={`${p.provider_name} — ${state}`}
                      >
                        <img
                          src={imageBaseUrl + 'w92' + p.logo_path}
                          alt={p.provider_name ?? ''}
                          className="rounded-lg w-12 h-12 shrink-0 object-cover"
                        />
                        <span className="text-xs leading-tight text-center line-clamp-2">{p.provider_name}</span>
                      </button>
                    );
                  })}
                </div>
            }
          </div>

          <div className="flex gap-2 justify-center">
            <button className="btn btn-primary" onClick={saveProfile}>Save</button>
            <button className="btn btn-secondary" onClick={cancelEditing}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
