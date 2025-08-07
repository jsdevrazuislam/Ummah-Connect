export type JwtResponse = {
  id: number;
  email: string;
  iat: number;
  exp: number;
};

export type User = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  location: string;
  bio: string;
  role: string;
  website: string;
  refreshToken: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  lastSeenAt?: string;
  publicKey?: string;
};

export type LocationResponse = {
  type: string;
  query?: (number)[] | null;
  features: FeaturesEntity[];
  attribution: string;
};
type FeaturesEntity = {
  id: string;
  type: string;
  place_type?: (string)[] | null;
  relevance: number;
  properties: Properties;
  text: string;
  place_name: string;
  bbox?: (number)[] | null;
  center?: (number)[] | null;
  geometry: Geometry;
  context: ContextEntity[];
};
type Properties = {
  mapbox_id: string;
  wikidata: string;
};
type Geometry = {
  type: string;
  coordinates?: (number)[] | null;
};
type ContextEntity = {
  id: string;
  mapbox_id: string;
  wikidata: string;
  text: string;
  short_code?: string | null;
};
