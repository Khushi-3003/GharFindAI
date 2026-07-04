export interface SchoolRating {
  name: string;
  rating: number; // 1 to 10
}

export interface PropertySchools {
  elementary: SchoolRating; // Primary School
  middle: SchoolRating;     // Middle School
  high: SchoolRating;       // High/Senior School
}

export interface Property {
  id: string;
  title: string;
  price: number; // in Indian Rupees (INR, ₹)
  beds: number; // BHK (Bedroom count)
  baths: number;
  sqft: number; // in Sq.Ft.
  address: string;
  city: string;
  state: string;
  zipCode: string; // Pincode
  latitude: number;
  longitude: number;
  type: 'House' | 'Condo' | 'Townhouse' | 'Apartment';
  description: string;
  imageUrl: string;
  amenities: string[];
  schools: PropertySchools;
  safetyScore: number; // 1 to 100
  walkScore: number; // 1 to 100
  transitScore: number; // 1 to 100
  yearBuilt: number;
  neighborhood: string;
}

export const properties: Property[] = [
  // BENGALURU (Latitude ~12.9716, Longitude ~77.5946)
  {
    id: 'blr-1',
    title: 'Premium 3 BHK Gated Apartment in Indiranagar',
    price: 22000000, // 2.2 Crores
    beds: 3,
    baths: 3,
    sqft: 1850,
    address: '12th Main Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    zipCode: '560038',
    latitude: 12.9784,
    longitude: 77.6408,
    type: 'Apartment',
    description: 'Ultra-premium 3 BHK apartment in Bengaluru\'s lifestyle hub. Features modular kitchen, private balconies, 24/7 power backup, piped gas, and double-covered parking. Walkable to fine dining, metro, and retail.',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    amenities: ['Power Backup', 'Piped Gas', 'Modular Kitchen', 'Clubhouse Gym', '24/7 Security'],
    schools: {
      elementary: { name: 'National Public School (NPS)', rating: 9 },
      middle: { name: 'The Frank Anthony Public School', rating: 8 },
      high: { name: 'Army Public School', rating: 8 }
    },
    safetyScore: 90,
    walkScore: 92,
    transitScore: 85,
    yearBuilt: 2018,
    neighborhood: 'Indiranagar'
  },
  {
    id: 'blr-2',
    title: 'High-Rise 2 BHK near ITPL Whitefield',
    price: 8500000, // 85 Lakhs
    beds: 2,
    baths: 2,
    sqft: 1250,
    address: 'Whitefield Main Road, near ITPL',
    city: 'Bengaluru',
    state: 'Karnataka',
    zipCode: '560066',
    latitude: 12.9866,
    longitude: 77.7341,
    type: 'Apartment',
    description: 'Perfect home for IT professionals. Located just 5 minutes from ITPL. Features swimming pool, yoga deck, indoor sports court, sewage treatment plant, and rainwater harvesting.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    amenities: ['Swimming Pool', 'Yoga Deck', 'Intercom', 'Water Treatment', 'Children Play Area'],
    schools: {
      elementary: { name: 'The Deens Academy', rating: 9 },
      middle: { name: 'Vydehi School of Excellence', rating: 8 },
      high: { name: 'Whitefield Global School', rating: 7 }
    },
    safetyScore: 85,
    walkScore: 70,
    transitScore: 68,
    yearBuilt: 2020,
    neighborhood: 'Whitefield'
  },
  {
    id: 'blr-3',
    title: 'Spacious 4 BHK Luxury Villa in Sarjapur',
    price: 38000000, // 3.8 Crores
    beds: 4,
    baths: 4.5,
    sqft: 3600,
    address: 'Chikkanayakanahalli, Sarjapur Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    zipCode: '560035',
    latitude: 12.9082,
    longitude: 77.6984,
    type: 'House',
    description: 'Exclusive triplex villa in a high-end gated community. Offers a private lawn, rooftop terrace room, solar heating, private elevator, and automated smart locks. Superb international schools nearby.',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    amenities: ['Private Lawn', 'Private Elevator', 'Rooftop Terrace', 'Solar Heating', 'Gated Community Villa'],
    schools: {
      elementary: { name: 'Greenwood High International', rating: 10 },
      middle: { name: 'The International School Bangalore (TISB)', rating: 10 },
      high: { name: 'Inventure Academy', rating: 10 }
    },
    safetyScore: 95,
    walkScore: 30,
    transitScore: 25,
    yearBuilt: 2022,
    neighborhood: 'Sarjapur Road'
  },
  {
    id: 'blr-4',
    title: 'Modern 3 BHK Flat in HSR Layout',
    price: 16500000, // 1.65 Crores
    beds: 3,
    baths: 3,
    sqft: 1680,
    address: '17th Cross, HSR Sector 3',
    city: 'Bengaluru',
    state: 'Karnataka',
    zipCode: '560102',
    latitude: 12.9115,
    longitude: 77.6391,
    type: 'Apartment',
    description: 'Beautifully designed East-facing flat in startup-hub HSR. Vastu compliant layout, Italian marble flooring, false ceilings with LED lights, and custom wardrobes. Safe neighborhood with wide tree-lined roads.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    amenities: ['Vastu Compliant', 'Italian Marble', 'Wardrobes', 'Video Door Phone', 'Covered Parking'],
    schools: {
      elementary: { name: 'Lawrence High School', rating: 8 },
      middle: { name: 'Cambridge Public School', rating: 7 },
      high: { name: 'St. John\'s High School', rating: 7 }
    },
    safetyScore: 88,
    walkScore: 85,
    transitScore: 75,
    yearBuilt: 2016,
    neighborhood: 'HSR Layout'
  },
  {
    id: 'blr-5',
    title: 'Value 2 BHK near Manyata Tech Park',
    price: 6800000, // 68 Lakhs
    beds: 2,
    baths: 2,
    sqft: 1100,
    address: 'Thanisandra Main Road, Hebbal',
    city: 'Bengaluru',
    state: 'Karnataka',
    zipCode: '560077',
    latitude: 13.0482,
    longitude: 77.6254,
    type: 'Apartment',
    description: 'Budget-friendly 2 BHK ideal for IT professionals working at Manyata. Direct access from Thanisandra main road. Equipped with gym, power backup, security, and intercom.',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    amenities: ['Gym', '24/7 Security', 'Intercom', 'Power Backup', 'Lifts'],
    schools: {
      elementary: { name: 'Rashtrotthana Vidya Kendra', rating: 8 },
      middle: { name: 'Delhi Public School (DPS North)', rating: 9 },
      high: { name: 'Vidyashilp Academy', rating: 9 }
    },
    safetyScore: 82,
    walkScore: 68,
    transitScore: 70,
    yearBuilt: 2017,
    neighborhood: 'Hebbal / Thanisandra'
  },

  // MUMBAI (Latitude ~19.0760, Longitude ~72.8777)
  {
    id: 'mum-1',
    title: 'Luxury 3 BHK Sea-View Apartment in Bandra West',
    price: 52000000, // 5.2 Crores
    beds: 3,
    baths: 3.5,
    sqft: 1650,
    address: 'Carter Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400050',
    latitude: 19.0664,
    longitude: 72.8258,
    type: 'Apartment',
    description: 'Opulent sea-facing residence in Mumbai\'s most prestigious suburb. High ceilings, sweeping views of the Arabian Sea, private elevator, and Italian marble fittings. In proximity to schools and Bollywood stars.',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    amenities: ['Sea Views', 'High Ceilings', '24/7 Security', 'Private Elevator', 'Italian Marble'],
    schools: {
      elementary: { name: 'Arya Vidya Mandir', rating: 9 },
      middle: { name: 'St. Stanislaus High School', rating: 8 },
      high: { name: 'St. Andrews College / School', rating: 8 }
    },
    safetyScore: 92,
    walkScore: 96,
    transitScore: 90,
    yearBuilt: 2015,
    neighborhood: 'Bandra West'
  },
  {
    id: 'mum-2',
    title: 'Executive 2 BHK in Powai (Hiranandani)',
    price: 24000000, // 2.4 Crores
    beds: 2,
    baths: 2,
    sqft: 980,
    address: 'Central Avenue, Hiranandani Gardens',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400076',
    latitude: 19.1174,
    longitude: 72.9094,
    type: 'Apartment',
    description: 'Stunning neoclassical apartment in the master-planned Hiranandani Gardens. Impeccable infrastructure, safe pedestrian-friendly streets, shopping avenues, and great school networks right at your doorstep.',
    imageUrl: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80',
    amenities: ['Clubhouse Gym', 'Pedestrian Walkway', 'Supermarket Nearby', 'Swimming Pool', 'Centralized Security'],
    schools: {
      elementary: { name: 'Hiranandani Foundation School', rating: 9 },
      middle: { name: 'Bombay Scottish School Powai', rating: 9 },
      high: { name: 'IIT Campus School', rating: 8 }
    },
    safetyScore: 94,
    walkScore: 94,
    transitScore: 82,
    yearBuilt: 2012,
    neighborhood: 'Powai'
  },
  {
    id: 'mum-3',
    title: 'Sleek 2 BHK near BKC (Andheri East)',
    price: 18500000, // 1.85 Crores
    beds: 2,
    baths: 2,
    sqft: 900,
    address: 'Marol Pipeline Rd, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400059',
    latitude: 19.1158,
    longitude: 72.8722,
    type: 'Apartment',
    description: 'Modern high-tech apartment in Mumbai\'s transit core. Equipped with smart lights, automated security locks, modular kitchen, and double parking. Excellent connectivity to BKC and airport.',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    amenities: ['Smart Automation', 'Near Metro', 'Modular Kitchen', 'Automated Parking', '24/7 Security'],
    schools: {
      elementary: { name: 'Canossa High School', rating: 7 },
      middle: { name: 'St. Xavier\'s High School', rating: 7 },
      high: { name: 'Divine Child High School', rating: 7 }
    },
    safetyScore: 80,
    walkScore: 89,
    transitScore: 95,
    yearBuilt: 2019,
    neighborhood: 'Andheri East'
  },
  {
    id: 'mum-4',
    title: 'Value 1 BHK near Metro in Thane West',
    price: 7200000, // 72 Lakhs
    beds: 1,
    baths: 2,
    sqft: 650,
    address: 'Ghodbunder Road, Thane West',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400607',
    latitude: 19.2612,
    longitude: 72.9625,
    type: 'Apartment',
    description: 'Affordable 1 BHK with dual bathrooms in a mega gated township. Features state-of-the-art amenities including tennis courts, swimming pools, amphitheater, and shopping mall inside the boundary.',
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    amenities: ['Township Gym', 'Tennis Courts', 'Amphitheater', 'Shopping Arcade', 'Children Play Area'],
    schools: {
      elementary: { name: 'Smt. Sulochanadevi Singhania School', rating: 10 },
      middle: { name: 'Billabong High International', rating: 9 },
      high: { name: 'Orchids The International', rating: 8 }
    },
    safetyScore: 88,
    walkScore: 78,
    transitScore: 72,
    yearBuilt: 2021,
    neighborhood: 'Thane West'
  },

  // DELHI NCR (Latitude ~28.4595, Longitude ~77.0266 - Gurugram center)
  {
    id: 'ncr-1',
    title: 'Luxury 4 BHK Villa in Sector 54 Gurugram',
    price: 45000000, // 4.5 Crores
    beds: 4,
    baths: 4.5,
    sqft: 3400,
    address: 'DLF Phase 5, Sector 54',
    city: 'Delhi NCR',
    state: 'Haryana',
    zipCode: '122003',
    latitude: 28.4372,
    longitude: 77.0984,
    type: 'House',
    description: 'Exclusive multi-level villa situated on Golf Course Road. Fully air-conditioned, landscaped terrace garden, modular dry-and-wet kitchen, servant quarters, and 24/7 backup. Walkable to Cyber City Metro.',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    amenities: ['Terrace Garden', 'Air Conditioning', 'Dry & Wet Kitchen', 'Servant Room', 'Gated DLF Security'],
    schools: {
      elementary: { name: 'The Heritage School', rating: 9 },
      middle: { name: 'Shiv Nadar School Gurugram', rating: 10 },
      high: { name: 'DPS International', rating: 9 }
    },
    safetyScore: 91,
    walkScore: 80,
    transitScore: 85,
    yearBuilt: 2016,
    neighborhood: 'Golf Course Road'
  },
  {
    id: 'ncr-2',
    title: 'Premium 3 BHK Builder Floor in Greater Kailash 2',
    price: 32000000, // 3.2 Crores
    beds: 3,
    baths: 3,
    sqft: 2100,
    address: 'GK-2 Block M, New Delhi',
    city: 'Delhi NCR',
    state: 'Delhi',
    zipCode: '110048',
    latitude: 28.5322,
    longitude: 77.2415,
    type: 'House',
    description: 'Elegant independent builder floor in South Delhi. Custom stilt parking with private elevator, modular Italian kitchen, VRV central cooling, and servant room. Prestigious, quiet neighborhood near GK M-Block market.',
    imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    amenities: ['Private Elevator', 'Stilt Parking', 'VRV Aircon', 'Servant Room', 'Italian Kitchen'],
    schools: {
      elementary: { name: 'Don Bosco School', rating: 9 },
      middle: { name: 'The Mother\'s International', rating: 10 },
      high: { name: 'DPS R.K. Puram', rating: 10 }
    },
    safetyScore: 90,
    walkScore: 94,
    transitScore: 88,
    yearBuilt: 2017,
    neighborhood: 'South Delhi (GK-2)'
  },
  {
    id: 'ncr-3',
    title: 'Green Living 3 BHK in Sector 150 Noida',
    price: 13500000, // 1.35 Crores
    beds: 3,
    baths: 3,
    sqft: 1750,
    address: 'Sector 150, Noida-Greater Noida Expy',
    city: 'Delhi NCR',
    state: 'Uttar Pradesh',
    zipCode: '201310',
    latitude: 28.4114,
    longitude: 77.4728,
    type: 'Apartment',
    description: 'Located in Noida\'s lowest-density greenest sector. Overlooking a massive 9-hole golf course. Township features 80% open spaces, jogging tracks, sports complex, and advanced security infrastructure.',
    imageUrl: 'https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?auto=format&fit=crop&w=800&q=80',
    amenities: ['Golf Course View', '80% Open Green Space', 'Jogging Track', 'Sports Academy', 'Double Parking'],
    schools: {
      elementary: { name: 'DPS Expressway Sector 132', rating: 8 },
      middle: { name: 'Step by Step School', rating: 10 },
      high: { name: 'Lotus Valley International', rating: 9 }
    },
    safetyScore: 87,
    walkScore: 50,
    transitScore: 60,
    yearBuilt: 2021,
    neighborhood: 'Noida Expressway'
  },
  {
    id: 'ncr-4',
    title: 'Affordable 2 BHK Flat in Sector 62 Noida',
    price: 6500000, // 65 Lakhs
    beds: 2,
    baths: 2,
    sqft: 1100,
    address: 'Sector 62, near Fortis Hospital',
    city: 'Delhi NCR',
    state: 'Uttar Pradesh',
    zipCode: '201301',
    latitude: 28.6215,
    longitude: 77.3625,
    type: 'Apartment',
    description: 'Spacious 2 BHK located in Sector 62\'s established residential sector. Walkable to Noida Electronic City Metro Station and major IT parks. Safe community with park and active welfare association.',
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    amenities: ['Power Backup', 'Walkable to Metro', 'RWA Security', 'Community Park', 'Dual Balconies'],
    schools: {
      elementary: { name: 'Indirapuram Public School', rating: 7 },
      middle: { name: 'Father Agnel School', rating: 8 },
      high: { name: 'DPS Noida', rating: 9 }
    },
    safetyScore: 83,
    walkScore: 85,
    transitScore: 90,
    yearBuilt: 2010,
    neighborhood: 'Sector 62 Noida'
  },

  // PUNE (Latitude ~18.5204, Longitude ~73.8567)
  {
    id: 'pne-1',
    title: 'Modern 3 BHK in Hinjewadi IT Park',
    price: 11000000, // 1.1 Crores
    beds: 3,
    baths: 3,
    sqft: 1520,
    address: 'Hinjewadi Phase 2, Near Rajiv Gandhi IT Park',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411057',
    latitude: 18.5915,
    longitude: 73.7258,
    type: 'Apartment',
    description: 'Perfect family home for tech professionals. Located adjacent to major IT parks. Gated society offers swimming pool, modern clubhouse, gym, power backup, and indoor games.',
    imageUrl: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=800&q=80',
    amenities: ['IT Park Proximity', 'Clubhouse Gym', 'Power Backup', 'Swimming Pool', 'Security'],
    schools: {
      elementary: { name: 'Blue Ridge Public School', rating: 9 },
      middle: { name: 'Pawar Public School', rating: 8 },
      high: { name: 'Mercedes-Benz International', rating: 10 }
    },
    safetyScore: 86,
    walkScore: 78,
    transitScore: 68,
    yearBuilt: 2019,
    neighborhood: 'Hinjewadi'
  },
  {
    id: 'pne-2',
    title: 'Luxury 3 BHK Flat in Koregaon Park',
    price: 26000000, // 2.6 Crores
    beds: 3,
    baths: 3,
    sqft: 1950,
    address: 'Lane 5, Koregaon Park',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411001',
    latitude: 18.5361,
    longitude: 73.8912,
    type: 'Apartment',
    description: 'Set in Pune\'s most elite lifestyle district. Exquisite leafy residential flat with modular kitchen, separate servant bathroom, private deck, and top-tier security. Walkable to boutique cafes.',
    imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80',
    amenities: ['Leafy Street', 'Private Deck', 'Modular Kitchen', 'Video Intercom', '24/7 Water Supply'],
    schools: {
      elementary: { name: 'St. Mary\'s School', rating: 9 },
      middle: { name: 'The Bishop\'s School', rating: 10 },
      high: { name: 'Symbiosis School', rating: 9 }
    },
    safetyScore: 94,
    walkScore: 95,
    transitScore: 80,
    yearBuilt: 2016,
    neighborhood: 'Koregaon Park'
  },
  {
    id: 'pne-3',
    title: 'Spacious 2 BHK Society Apartment in Baner',
    price: 9500000, // 95 Lakhs
    beds: 2,
    baths: 2,
    sqft: 1180,
    address: 'Baner-Balewadi Link Road',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411045',
    latitude: 18.5684,
    longitude: 73.7891,
    type: 'Apartment',
    description: 'Charming 2 BHK flat in a highly secured community in Baner. Highly connected to Hinjewadi and Pune university. High safety index with dedicated CCTV, park, and clubhouse.',
    imageUrl: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80',
    amenities: ['CCTV Security', 'Clubhouse Gym', 'Dedicated Parking', 'Water Softener', 'Children Play Area'],
    schools: {
      elementary: { name: 'The Orchid School', rating: 9 },
      middle: { name: 'Vibgyor High School Baner', rating: 8 },
      high: { name: 'Wisdom World School', rating: 8 }
    },
    safetyScore: 90,
    walkScore: 84,
    transitScore: 76,
    yearBuilt: 2017,
    neighborhood: 'Baner'
  },
  {
    id: 'pne-4',
    title: 'Value 2 BHK Flat in Hadapsar',
    price: 7800000, // 78 Lakhs
    beds: 2,
    baths: 2,
    sqft: 1050,
    address: 'Handewadi Road, Hadapsar',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411028',
    latitude: 18.4905,
    longitude: 73.9314,
    type: 'Apartment',
    description: 'Cozy and modern 2 BHK in a master township. Very close to Magarpatta Cyber City and SP Infocity tech parks. Excellent value for budget buyers.',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    amenities: ['Magarpatta Proximity', 'Clubhouse', 'Children Park', 'Elevators', 'Power Backup'],
    schools: {
      elementary: { name: 'The HDFC School', rating: 8 },
      middle: { name: 'Kalyani School', rating: 9 },
      high: { name: 'Delhi Public School (DPS Pune)', rating: 10 }
    },
    safetyScore: 85,
    walkScore: 70,
    transitScore: 72,
    yearBuilt: 2018,
    neighborhood: 'Hadapsar / Handewadi'
  }
];
