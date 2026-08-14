import { getDictionary } from "@/lib/dictionaries";

import LocationMap from "./LocationMap";

/**
 * Reads the translations on the server and hands them to the map, which has to
 * be a Client Component and so cannot call `getDictionary` itself.
 */
export default async function Location() {
  const dict = await getDictionary();

  return (
    <section>
      <h2>{dict.location.heading}</h2>
      <LocationMap
        city={dict.location.city}
        country={dict.location.country}
        description={dict.location.description}
        unavailable={dict.location.unavailable}
      />
    </section>
  );
}
