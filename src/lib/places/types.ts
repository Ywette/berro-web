export type PlaceSuggestion = {
  /** `local:<catalog id>` or `google:<Google place id>` */
  id: string;
  label: string;
  secondary: string;
};

export type TripRoute = {
  distanceKm: number | null;
  durationMinutes: number | null;
  estimated: boolean;
  mapsUrl: string;
  embedUrl: string | null;
};
