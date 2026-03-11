import CityPage from "../components/CityPage";
import { CITIES } from "../data/cities";

export function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({
    city: city,
  }));
}

export async function generateMetadata({ params }) {
  const config = CITIES[params.city] || CITIES["edmonton"];
  return {
    title: `${config.name} Weekend — Everything Happening in ${config.name}`,
    description: `Live concerts, ${config.teamName} games, festivals, comedy nights — your one-stop calendar for ${config.name}. Updated in real time.`,
    openGraph: {
      title: `${config.name} Weekend — Everything Happening in ${config.name}`,
      description: `Live concerts, ${config.teamName} games, festivals, comedy nights — your one-stop calendar for ${config.name}.`,
      type: "website",
    },
  };
}

export default function CityDynamicPage({ params }) {
  if (!CITIES[params.city]) {
    return <CityPage cityId="edmonton" />;
  }
  return <CityPage cityId={params.city} />;
}
