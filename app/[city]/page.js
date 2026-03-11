import CityPage from "../components/CityPage";
import { CITIES } from "../data/cities";

export function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({
    city: city,
  }));
}

export default function CityDynamicPage({ params }) {
  if (!CITIES[params.city]) {
    return <CityPage cityId="edmonton" />;
  }
  return <CityPage cityId={params.city} />;
}
