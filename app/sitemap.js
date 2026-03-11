import { CITIES } from "./data/cities";

export default function sitemap() {
  const baseUrl = "https://edmontonweekend.ca";

  const cityPages = Object.values(CITIES).map((city) => ({
    url: city.id === "edmonton" ? baseUrl : `${baseUrl}/${city.id}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: city.id === "edmonton" ? 1.0 : 0.8,
  }));

  return [
    ...cityPages,
  ];
}
