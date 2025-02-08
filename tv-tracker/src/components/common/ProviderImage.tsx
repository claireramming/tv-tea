import { WatchProvider } from "../../types";
import { imageBaseUrl } from "../../constants";

export default function ProviderImage(props: { count: number, providers: WatchProvider[] }) {
  const providerOptions =
      props.providers
        .filter((p: WatchProvider) => p.display_priority < 50)
        .slice(0, props.count) || [];
    const providersList = providerOptions.map((provider: WatchProvider) => {
      return (
        <img
          key={provider.provider_id}
          src={imageBaseUrl + 'w92' + provider.logo_path}
          className="rounded-xl"
          alt={provider.provider_name}
        />
      );
    });
    return providersList
  }