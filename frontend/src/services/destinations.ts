export interface IndianDestination {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  category: 'metropolitan' | 'coastal' | 'heritage' | 'hill_station' | 'transit_hub';
  isPopular?: boolean;
}

export const INDIAN_DESTINATIONS: IndianDestination[] = [
  // Tamil Nadu & Coastal Belt
  {
    id: 'dest-chennai',
    name: 'Chennai (Central & Coastal)',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    category: 'metropolitan',
    isPopular: true
  },
  {
    id: 'dest-mahabalipuram',
    name: 'Mahabalipuram (Mamallapuram)',
    state: 'Tamil Nadu',
    lat: 12.6269,
    lng: 80.1927,
    category: 'coastal',
    isPopular: true
  },
  {
    id: 'dest-kancheepuram',
    name: 'Kancheepuram (Temple City)',
    state: 'Tamil Nadu',
    lat: 12.8342,
    lng: 79.7036,
    category: 'heritage',
    isPopular: true
  },
  {
    id: 'dest-puducherry',
    name: 'Puducherry (Pondicherry)',
    state: 'Puducherry',
    lat: 11.9416,
    lng: 79.8083,
    category: 'coastal',
    isPopular: true
  },
  {
    id: 'dest-cuddalore',
    name: 'Cuddalore Coastal Port',
    state: 'Tamil Nadu',
    lat: 11.748,
    lng: 79.7714,
    category: 'coastal'
  },
  {
    id: 'dest-nagapattinam',
    name: 'Nagapattinam Delta',
    state: 'Tamil Nadu',
    lat: 10.7672,
    lng: 79.8424,
    category: 'coastal'
  },
  {
    id: 'dest-madurai',
    name: 'Madurai (Meenakshi Hub)',
    state: 'Tamil Nadu',
    lat: 9.9252,
    lng: 78.1198,
    category: 'heritage',
    isPopular: true
  },
  {
    id: 'dest-coimbatore',
    name: 'Coimbatore (Kongu Transit)',
    state: 'Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
    category: 'transit_hub',
    isPopular: true
  },
  {
    id: 'dest-ooty',
    name: 'Ooty (Udhagamandalam / Nilgiris)',
    state: 'Tamil Nadu',
    lat: 11.4102,
    lng: 76.695,
    category: 'hill_station',
    isPopular: true
  },
  {
    id: 'dest-kanyakumari',
    name: 'Kanyakumari (Cape Comorin)',
    state: 'Tamil Nadu',
    lat: 8.0883,
    lng: 77.5385,
    category: 'coastal',
    isPopular: true
  },
  {
    id: 'dest-rameshwaram',
    name: 'Rameshwaram Pamban Corridor',
    state: 'Tamil Nadu',
    lat: 9.2876,
    lng: 79.3129,
    category: 'coastal'
  },

  // Major Regional Transit Gateways
  {
    id: 'dest-bengaluru',
    name: 'Bengaluru (Bangalore)',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    category: 'metropolitan',
    isPopular: true
  },
  {
    id: 'dest-kochi',
    name: 'Kochi (Cochin)',
    state: 'Kerala',
    lat: 9.9312,
    lng: 76.2673,
    category: 'coastal',
    isPopular: true
  },
  {
    id: 'dest-munnar',
    name: 'Munnar (Tea Hills)',
    state: 'Kerala',
    lat: 10.0889,
    lng: 77.0595,
    category: 'hill_station'
  },
  {
    id: 'dest-hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    lat: 17.385,
    lng: 78.4867,
    category: 'metropolitan',
    isPopular: true
  },
  {
    id: 'dest-visakhapatnam',
    name: 'Visakhapatnam (Vizag)',
    state: 'Andhra Pradesh',
    lat: 17.6868,
    lng: 83.2185,
    category: 'coastal'
  },
  {
    id: 'dest-mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.076,
    lng: 72.8777,
    category: 'metropolitan',
    isPopular: true
  },
  {
    id: 'dest-delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.209,
    category: 'metropolitan',
    isPopular: true
  },
  {
    id: 'dest-kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    category: 'metropolitan'
  }
];

export function searchDestinations(query: string): IndianDestination[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return INDIAN_DESTINATIONS.slice(0, 8);
  return INDIAN_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(clean) ||
      d.state.toLowerCase().includes(clean) ||
      d.category.toLowerCase().includes(clean)
  );
}

export function getPopularDestinations(): IndianDestination[] {
  return INDIAN_DESTINATIONS.filter((d) => d.isPopular);
}

/**
 * Calculates great-circle Haversine distance in kilometers between two lat/lng points.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
