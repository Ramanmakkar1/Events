import CityPage from "../components/CityPage";
import { CITIES } from "../data/cities";

export function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({
    city: city,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const config = CITIES[resolvedParams.city] || CITIES["edmonton"];
  return {
    title: `Things to do in ${config.name} This Weekend | Concerts, Sports & Events`,
    description: `Discover what's happening in ${config.name} this weekend. Live concerts, ${config.teamName} games, festivals, and comedy nights. Your ultimate local event calendar based in ${config.name}.`,
    openGraph: {
      title: `Things to do in ${config.name} This Weekend`,
      description: `Discover what's happening in ${config.name} this weekend. Live concerts, ${config.teamName} games, festivals, and comedy nights.`,
      type: "website",
    },
    alternates: {
      canonical: `/${resolvedParams.city}`,
    },
  };
}

export default async function CityDynamicPage({ params }) {
  const resolvedParams = await params;
  if (!CITIES[resolvedParams.city]) {
    return <CityPage cityId="edmonton" />;
  }
  return <CityPage cityId={resolvedParams.city} />;
}
