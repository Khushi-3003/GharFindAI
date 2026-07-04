import { Property, properties } from '../data/propertiesData';

export interface AgentPreferences {
  city?: string;
  maxPrice?: number; // in Rupees
  minBeds?: number; // BHK count
  minBaths?: number;
  workplaceAddress?: string;
  commuteMode?: 'driving' | 'transit' | 'walking' | 'bicycling';
  maxCommuteMinutes?: number;
  minSchoolRating?: number;
  minSafetyScore?: number;
  priorities?: {
    price: number;      // weight 1-5
    schools: number;    // weight 1-5
    safety: number;     // weight 1-5
    commute: number;    // weight 1-5
    space: number;      // weight 1-5
  };
}

export interface AgentStep {
  toolName: string;
  toolInput: any;
  toolOutput: any;
  thought: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thoughts?: string;
  steps?: AgentStep[];
  preferences?: AgentPreferences;
  shortlist?: RankedProperty[];
}

export interface RankedProperty {
  property: Property;
  score: number; // 0 to 100
  ranking: number;
  details: {
    priceScore: number;
    spaceScore: number;
    schoolScore: number;
    safetyScore: number;
    commuteScore: number;
    commuteTime: number; // calculated minutes
    commuteDistance: number; // calculated km
    explanation: string;
  };
}

// Indian Currency Formatter (Lakhs and Crores)
export function formatIndianCurrency(num: number): string {
  if (num >= 10000000) {
    return '₹' + (num / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr';
  } else if (num >= 100000) {
    return '₹' + (num / 100000).toFixed(2).replace(/\.00$/, '') + ' L';
  }
  return '₹' + num.toLocaleString('en-IN');
}

// Coordinate database for common Indian tech hubs and landmarks
const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Bengaluru
  'manyata tech park': { lat: 13.0451, lng: 77.6266 },
  'electronic city': { lat: 12.8452, lng: 77.6636 },
  'whitefield': { lat: 12.9698, lng: 77.7499 },
  'bagmane tech park': { lat: 12.9806, lng: 77.6635 },
  'downtown bengaluru': { lat: 12.9716, lng: 77.5946 },
  'mg road': { lat: 12.9743, lng: 77.6111 },
  'koramangala': { lat: 12.9352, lng: 77.6244 },
  
  // Mumbai
  'bkc mumbai': { lat: 19.0596, lng: 72.8643 },
  'bandra west': { lat: 19.0600, lng: 72.8311 },
  'powai': { lat: 19.1176, lng: 72.9060 },
  'nariman point': { lat: 18.9256, lng: 72.8242 },
  'andheri east': { lat: 19.1158, lng: 72.8722 },
  'chhatrapati shivaji airport': { lat: 19.0896, lng: 72.8656 },
  
  // Delhi NCR
  'cyber city gurugram': { lat: 28.4962, lng: 77.0878 },
  'sector 62 noida': { lat: 28.6215, lng: 77.3625 },
  'connaught place': { lat: 28.6304, lng: 77.2177 },
  'greater kailash': { lat: 28.5322, lng: 77.2415 },
  'golf course road': { lat: 28.4372, lng: 77.0984 },
  
  // Pune
  'hinjewadi it park': { lat: 18.5915, lng: 73.7258 },
  'magarpatta city': { lat: 18.5146, lng: 73.9262 },
  'koregaon park': { lat: 18.5361, lng: 73.8912 },
  'baner': { lat: 18.5684, lng: 73.7891 },
  'senapati bapat road': { lat: 18.5342, lng: 73.8340 }
};

// Heuristic coordinate lookup
export function lookupCoordinates(address: string, city: string): { lat: number; lng: number } {
  const normalized = address.toLowerCase().trim();
  
  // Direct match
  if (LOCATION_COORDINATES[normalized]) {
    return LOCATION_COORDINATES[normalized];
  }
  
  // Partial matches
  for (const key of Object.keys(LOCATION_COORDINATES)) {
    if (normalized.includes(key)) {
      return LOCATION_COORDINATES[key];
    }
  }
  
  // Try city center default
  const cityLower = city.toLowerCase();
  if (cityLower === 'bengaluru' || cityLower === 'bangalore') return { lat: 12.9716, lng: 77.5946 };
  if (cityLower === 'mumbai' || cityLower === 'bombay') return { lat: 19.0760, lng: 72.8777 };
  if (cityLower === 'delhi ncr' || cityLower === 'delhi' || cityLower === 'gurugram' || cityLower === 'noida') return { lat: 28.4595, lng: 77.0266 };
  if (cityLower === 'pune' || cityLower === 'poona') return { lat: 18.5204, lng: 73.8567 };
  
  // Default to Bengaluru center if completely unknown
  return { lat: 12.9716, lng: 77.5946 };
}

// Calculate distance in km using Haversine formula
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Estimate commute minutes and distance
export function estimateCommute(
  propertyLat: number,
  propertyLng: number,
  destination: string,
  city: string,
  mode: 'driving' | 'transit' | 'walking' | 'bicycling' = 'driving'
): { timeMinutes: number; distanceKm: number } {
  const destCoords = lookupCoordinates(destination, city);
  // Straight-line distance
  const straightLineKm = calculateHaversineDistance(propertyLat, propertyLng, destCoords.lat, destCoords.lng);
  
  // Route scaling (streets aren't straight lines)
  const routeScale = 1.35;
  const actualDistanceKm = straightLineKm * routeScale;
  
  let speedKmH = 25; // driving average in heavy Indian city traffic
  let overheadMinutes = 10; // high congestion buffer
  
  if (mode === 'transit') {
    speedKmH = 20; // metro/local train/bus average
    overheadMinutes = 15; // wait times
  } else if (mode === 'walking') {
    speedKmH = 5;
    overheadMinutes = 0;
  } else if (mode === 'bicycling') {
    speedKmH = 12;
    overheadMinutes = 3;
  }
  
  const timeMinutes = Math.round((actualDistanceKm / speedKmH) * 60 + overheadMinutes);
  return {
    timeMinutes: Math.max(1, timeMinutes),
    distanceKm: parseFloat(actualDistanceKm.toFixed(1))
  };
}

// Ranking utility function
export function rankProperties(propertiesList: Property[], prefs: AgentPreferences): RankedProperty[] {
  const priorities = prefs.priorities || {
    price: 3,
    schools: 3,
    safety: 3,
    commute: 3,
    space: 3
  };
  
  const ranked = propertiesList.map(prop => {
    let priceScore = 100;
    let spaceScore = 100;
    let schoolScore = 100;
    let safetyScore = prop.safetyScore;
    let commuteScore = 100;
    let commuteTime = 0;
    let commuteDistance = 0;
    
    // 1. Price evaluation
    if (prefs.maxPrice) {
      if (prop.price <= prefs.maxPrice) {
        // Bonus for being under budget
        priceScore = 100 + ((prefs.maxPrice - prop.price) / prefs.maxPrice) * 10;
        priceScore = Math.min(100, priceScore);
      } else {
        // Penalty for being over budget
        const pctOver = (prop.price - prefs.maxPrice) / prefs.maxPrice;
        priceScore = Math.max(0, 100 - pctOver * 150); // Sharp drop if over budget
      }
    }
    
    // 2. Space evaluation (beds/BHK & baths)
    let spacePenalty = 0;
    if (prefs.minBeds && prop.beds < prefs.minBeds) {
      spacePenalty += (prefs.minBeds - prop.beds) * 30;
    }
    if (prefs.minBaths && prop.baths < prefs.minBaths) {
      spacePenalty += (prefs.minBaths - prop.baths) * 20;
    }
    spaceScore = Math.max(0, 100 - spacePenalty);
    
    // 3. Schools evaluation
    const avgSchoolRating = (prop.schools.elementary.rating + prop.schools.middle.rating + prop.schools.high.rating) / 3;
    if (prefs.minSchoolRating) {
      if (avgSchoolRating >= prefs.minSchoolRating) {
        schoolScore = 100;
      } else {
        const diff = prefs.minSchoolRating - avgSchoolRating;
        schoolScore = Math.max(0, 100 - diff * 20); // 20 pts off per rating unit under target
      }
    } else {
      schoolScore = avgSchoolRating * 10; // Normalized rating
    }
    
    // 4. Safety evaluation
    if (prefs.minSafetyScore) {
      if (prop.safetyScore >= prefs.minSafetyScore) {
        safetyScore = 100;
      } else {
        const diff = prefs.minSafetyScore - prop.safetyScore;
        safetyScore = Math.max(0, 100 - diff * 3); // 3 pts off per safety point under target
      }
    }
    
    // 5. Commute evaluation
    if (prefs.workplaceAddress) {
      const commuteResult = estimateCommute(
        prop.latitude,
        prop.longitude,
        prefs.workplaceAddress,
        prop.city,
        prefs.commuteMode || 'driving'
      );
      commuteTime = commuteResult.timeMinutes;
      commuteDistance = commuteResult.distanceKm;
      
      const targetCommute = prefs.maxCommuteMinutes || 30;
      if (commuteTime <= targetCommute) {
        commuteScore = 100;
      } else {
        const diff = commuteTime - targetCommute;
        commuteScore = Math.max(0, 100 - diff * 3); // 3 pts off per minute over commute target
      }
    }
    
    // Calculate weighted average
    const totalWeight = priorities.price + priorities.space + priorities.schools + priorities.safety + (prefs.workplaceAddress ? priorities.commute : 0);
    const weightedSum = 
      (priceScore * priorities.price) +
      (spaceScore * priorities.space) +
      (schoolScore * priorities.schools) +
      (safetyScore * priorities.safety) +
      (prefs.workplaceAddress ? (commuteScore * priorities.commute) : 0);
      
    const score = Math.round(weightedSum / totalWeight);
    
    // Generate explanation details
    const explanation = `Matches budget (${Math.round(priceScore)}%), BHK space demands (${Math.round(spaceScore)}%), school ratings average of ${avgSchoolRating.toFixed(1)}/10, safety rating of ${prop.safetyScore}/100${prefs.workplaceAddress ? `, and an estimated ${commuteTime} min commute.` : '.'}`;
    
    return {
      property: prop,
      score,
      ranking: 0,
      details: {
        priceScore,
        spaceScore,
        schoolScore,
        safetyScore,
        commuteScore,
        commuteTime,
        commuteDistance,
        explanation
      }
    };
  });
  
  // Sort by score descending
  return ranked
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      ranking: index + 1
    }));
}

// Helper to parse Indian currency inputs (Lakhs / Crores)
function parseIndianCurrency(input: string): number | null {
  const text = input.toLowerCase().replace(/[\s,₹]/g, '');
  
  // Match number with suffix
  const match = text.match(/^(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lk|lac|lacs|lakh|lakhs)/);
  if (match) {
    const val = parseFloat(match[1]);
    const suffix = match[2];
    if (suffix.startsWith('c')) {
      return val * 10000000; // Crore
    } else {
      return val * 100000; // Lakh
    }
  }
  
  // Heuristics for pure numbers:
  // e.g. "under 85" -> 85 Lakhs, "under 1.5" -> 1.5 Crores
  const numMatch = text.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]);
    if (val > 0) {
      if (val < 15) return val * 10000000; // Assumed Crores
      if (val < 999) return val * 100000;  // Assumed Lakhs
      return val; // Raw Rupees
    }
  }
  return null;
}

// ----------------------------------------------------
// HEURISTIC / MOCK AGENT (INDIAN ADAPTED)
// ----------------------------------------------------
export function runMockAgent(messages: { role: string; content: string }[], currentPrefs: AgentPreferences = {}): {
  reply: string;
  thoughts: string;
  steps: AgentStep[];
  preferences: AgentPreferences;
  shortlist: RankedProperty[];
} {
  const lastMessage = messages[messages.length - 1]?.content || '';
  const lastMessageLower = lastMessage.toLowerCase();
  
  // 1. Extract preferences from conversation history using simple heuristics
  const prefs: AgentPreferences = {
    ...currentPrefs,
    priorities: currentPrefs.priorities || { price: 3, schools: 3, safety: 3, commute: 3, space: 3 }
  };
  
  // City extraction (Indian Cities)
  if (lastMessageLower.includes('bengaluru') || lastMessageLower.includes('bangalore')) prefs.city = 'Bengaluru';
  else if (lastMessageLower.includes('mumbai') || lastMessageLower.includes('bombay')) prefs.city = 'Mumbai';
  else if (lastMessageLower.includes('pune')) prefs.city = 'Pune';
  else if (lastMessageLower.includes('delhi') || lastMessageLower.includes('noida') || lastMessageLower.includes('gurugram') || lastMessageLower.includes('ncr')) prefs.city = 'Delhi NCR';
  
  // Budget / Price extraction (INR - Crores/Lakhs)
  const priceRegex = /(?:under|below|budget of|max|maximum|upto)\s*(?:₹|rs)?\s*(\d+(?:\.\d+)?\s*(?:cr|crore|crores|l|lk|lac|lacs|lakh|lakhs)?)/i;
  const priceMatch = lastMessageLower.match(priceRegex);
  if (priceMatch) {
    const parsedPrice = parseIndianCurrency(priceMatch[1]);
    if (parsedPrice) {
      prefs.maxPrice = parsedPrice;
    }
  }
  
  // BHK / Beds extraction (e.g. "3 BHK", "2 BHK", "4 bedrooms")
  const bhkRegex = /(\d+)\s*(?:bhk|bed|bedroom|br)/i;
  const bhkMatch = lastMessageLower.match(bhkRegex);
  if (bhkMatch) {
    prefs.minBeds = parseInt(bhkMatch[1]);
  }
  
  // Baths extraction
  const bathRegex = /(\d+(?:\.5)?)\s*(?:bath|bathroom|ba)/i;
  const bathMatch = lastMessageLower.match(bathRegex);
  if (bathMatch) {
    prefs.minBaths = parseFloat(bathMatch[1]);
  }
  
  // Commute / Workplace extraction
  if (lastMessageLower.includes('near') || lastMessageLower.includes('commute to') || lastMessageLower.includes('work at')) {
    const workplaceMatch = lastMessageLower.match(/(?:near|commute to|work at|office at|office is at)\s*([^,.\n]+)/i);
    if (workplaceMatch) {
      const parsedWorkplace = workplaceMatch[1].trim()
        .replace(/(?:my office|the office|my workplace)/gi, '')
        .trim();
      if (parsedWorkplace.length > 2) {
        prefs.workplaceAddress = parsedWorkplace;
      }
    }
  }
  
  // Transit mode
  if (lastMessageLower.includes('walk') || lastMessageLower.includes('on foot')) prefs.commuteMode = 'walking';
  else if (lastMessageLower.includes('transit') || lastMessageLower.includes('metro') || lastMessageLower.includes('train') || lastMessageLower.includes('bus')) prefs.commuteMode = 'transit';
  else if (lastMessageLower.includes('bike') || lastMessageLower.includes('bicycle') || lastMessageLower.includes('two wheeler')) prefs.commuteMode = 'bicycling';
  else if (lastMessageLower.includes('drive') || lastMessageLower.includes('car') || lastMessageLower.includes('cab')) prefs.commuteMode = 'driving';
  
  // Priorities adjustments
  if (lastMessageLower.includes('school') && (lastMessageLower.includes('important') || lastMessageLower.includes('priority') || lastMessageLower.includes('rank'))) {
    prefs.priorities!.schools = 5;
    prefs.minSchoolRating = 8;
  }
  if (lastMessageLower.includes('safety') && (lastMessageLower.includes('important') || lastMessageLower.includes('priority') || lastMessageLower.includes('rank'))) {
    prefs.priorities!.safety = 5;
    prefs.minSafetyScore = 80;
  }
  if (lastMessageLower.includes('commute') && (lastMessageLower.includes('important') || lastMessageLower.includes('priority') || lastMessageLower.includes('rank'))) {
    prefs.priorities!.commute = 5;
  }
  if (lastMessageLower.includes('budget') || lastMessageLower.includes('price') && (lastMessageLower.includes('important') || lastMessageLower.includes('priority'))) {
    prefs.priorities!.price = 5;
  }
  
  // 2. Simulate Tool Execution steps
  const steps: AgentStep[] = [];
  const searchCity = prefs.city || 'Bengaluru'; // Default to Bengaluru if not stated yet
  
  // Step 1: Search properties
  const propFilters = {
    city: searchCity,
    maxPrice: prefs.maxPrice,
    minBeds: prefs.minBeds,
    minBaths: prefs.minBaths
  };
  const filteredProps = properties.filter(p => {
    if (p.city.toLowerCase() !== searchCity.toLowerCase()) return false;
    if (prefs.maxPrice && p.price > prefs.maxPrice) return false;
    if (prefs.minBeds && p.beds < prefs.minBeds) return false;
    if (prefs.minBaths && p.baths < prefs.minBaths) return false;
    return true;
  });
  
  steps.push({
    toolName: 'search_properties',
    toolInput: propFilters,
    toolOutput: { count: filteredProps.length, properties: filteredProps.map(p => ({ id: p.id, title: p.title, price: formatIndianCurrency(p.price), beds: `${p.beds} BHK`, baths: p.baths })) },
    thought: `I need to search for property listings in ${searchCity} that meet the buyer's criteria (Budget: ${prefs.maxPrice ? formatIndianCurrency(prefs.maxPrice) : 'Any'}, BHK: ${prefs.minBeds ? prefs.minBeds + ' BHK' : 'Any'}). Found ${filteredProps.length} matches.`
  });
  
  // Step 2: Neighborhood & Schools evaluation
  if (filteredProps.length > 0) {
    steps.push({
      toolName: 'get_school_ratings',
      toolInput: { pincodes: Array.from(new Set(filteredProps.map(p => p.zipCode))) },
      toolOutput: filteredProps.map(p => ({ propertyId: p.id, pincode: p.zipCode, schools: p.schools })),
      thought: `Analyzing school rating profiles for properties in pincodes: ${Array.from(new Set(filteredProps.map(p => p.zipCode))).join(', ')} to verify educational fit.`
    });
    
    steps.push({
      toolName: 'get_neighborhood_safety',
      toolInput: { neighborhoods: Array.from(new Set(filteredProps.map(p => p.neighborhood))) },
      toolOutput: filteredProps.map(p => ({ neighborhood: p.neighborhood, safetyScore: p.safetyScore, walkScore: p.walkScore })),
      thought: `Checking neighborhood safety indexes and public walkability profiles for these locations: ${Array.from(new Set(filteredProps.map(p => p.neighborhood))).join(', ')}.`
    });
  }
  
  // Step 3: Commute calculation
  if (prefs.workplaceAddress && filteredProps.length > 0) {
    const commuteOutputs = filteredProps.map(p => {
      const c = estimateCommute(p.latitude, p.longitude, prefs.workplaceAddress!, p.city, prefs.commuteMode || 'driving');
      return { propertyId: p.id, commuteTimeMinutes: c.timeMinutes, distanceKm: c.distanceKm };
    });
    
    steps.push({
      toolName: 'calculate_commute_time',
      toolInput: { destination: prefs.workplaceAddress, mode: prefs.commuteMode || 'driving', propertiesCount: filteredProps.length },
      toolOutput: commuteOutputs,
      thought: `Calculating estimated commute times in heavy traffic from the candidate properties to the buyer's workplace (${prefs.workplaceAddress}) using mode: ${prefs.commuteMode || 'driving'}.`
    });
  }
  
  // 3. Perform Deterministic Ranking
  const cityProperties = properties.filter(p => p.city.toLowerCase() === searchCity.toLowerCase());
  const ranked = rankProperties(cityProperties, prefs);
  
  // Filter shortlist to show properties that pass basic hard filters or the top 3
  const shortlist = ranked.slice(0, 3);
  
  // 4. Formulate assistant response & thoughts
  let thoughts = `User requested assistance. Extracted Preferences: ${JSON.stringify(prefs)}. `;
  if (!prefs.city) {
    thoughts += `Buyer did not specify a city. Defaulting search to Bengaluru, but I will prompt them to confirm their target city.`;
  } else {
    thoughts += `I found ${filteredProps.length} listings in ${prefs.city} that match the hard filters. I ranked the entire city's inventory of ${cityProperties.length} listings using weighted utility scores based on budget, BHK requirement, school ratings, safety indexes, and commute times to '${prefs.workplaceAddress || 'N/A'}'.`;
  }
  
  let reply = '';
  if (messages.length === 1 && !lastMessageLower.includes('bengaluru') && !lastMessageLower.includes('bangalore') && !lastMessageLower.includes('mumbai') && !lastMessageLower.includes('pune') && !lastMessageLower.includes('delhi') && !lastMessageLower.includes('noida') && !lastMessageLower.includes('gurugram')) {
    reply = `Hello! I am your AI Property-Discovery Agent (GharFind AI). I can help you search, evaluate, and shortlist homes based on real listing data, school scores, safety indexes, and your commute parameters in India.

To get started, **which city are you searching in?** (I support **Bengaluru**, **Mumbai**, **Delhi NCR**, and **Pune**). 

Feel free to also tell me about your budget (in Lakhs or Crores), BHK requirements, workplace address (e.g. Manyata Tech Park, BKC Mumbai, Hinjewadi) to calculate your commute, and what features are most important to you!`;
  } else {
    reply = `Based on your preferences, I've conducted a multi-source analysis on the local listings in **${searchCity}**. Here is what I extracted from our conversation so far:
- **Location:** ${searchCity}
- **Budget:** ${prefs.maxPrice ? `Under ${formatIndianCurrency(prefs.maxPrice)}` : 'No limit specified'}
- **Space:** ${prefs.minBeds ? `${prefs.minBeds}+ BHK` : 'Any BHK'} / ${prefs.minBaths ? `${prefs.minBaths}+ baths` : 'Any baths'}
${prefs.workplaceAddress ? `- **Commute:** To ${prefs.workplaceAddress} via ${prefs.commuteMode || 'driving'}\n` : ''}${prefs.minSchoolRating ? `- **Schools Priority:** Looking for ratings of ${prefs.minSchoolRating}+ / 10\n` : ''}${prefs.minSafetyScore ? `- **Safety Priority:** Safety rating of ${prefs.minSafetyScore}+ / 100\n` : ''}
I ran queries across my properties database, analyzed schools, safety indexes, and simulated your daily commute. I've populated your **Ranked Shortlist** on the right! 

### Ranked Highlights:
`;
    
    if (shortlist.length === 0) {
      reply += `\nI couldn't find any properties in ${searchCity} matching all your exact criteria. Could you try widening your budget or reducing BHK requirements?`;
    } else {
      shortlist.forEach((rp, idx) => {
        const schoolAvg = ((rp.property.schools.elementary.rating + rp.property.schools.middle.rating + rp.property.schools.high.rating) / 3).toFixed(1);
        reply += `${idx + 1}. **${rp.property.title}** (${rp.property.neighborhood}) — **${formatIndianCurrency(rp.property.price)}**
   - **Match Score:** \`${rp.score}%\` (Rank #${rp.ranking})
   - **Why it fits:** ${rp.property.beds} BHK, ${rp.property.baths} baths, ${rp.property.sqft} sqft. Schools average **${schoolAvg}/10**. Safety score is **${rp.property.safetyScore}/100**. ${prefs.workplaceAddress ? `Estimated commute is **${rp.details.commuteTime} minutes** (${rp.details.commuteDistance} km).` : 'Commute not calculated yet.'}\n`;
      });
      
      reply += `\nClick on any property card in the **Shortlist** on the right to view a complete visual breakdown of match scores, nearby school details, neighborhood ratings, and a customized agent justification!

*What would you like to adjust? We can change the commute mode, prioritize safety/schools, or refine the price target.*`;
    }
  }
  
  return {
    reply,
    thoughts,
    steps,
    preferences: prefs,
    shortlist
  };
}

// ----------------------------------------------------
// LIVE LLM AGENT ROUTE EXECUTOR
// ----------------------------------------------------
export async function runLiveAgent(
  apiKey: string,
  provider: 'gemini' | 'openai',
  model: string,
  messages: { role: string; content: string }[],
  currentPrefs: AgentPreferences = {}
): Promise<{
  reply: string;
  thoughts: string;
  steps: AgentStep[];
  preferences: AgentPreferences;
  shortlist: RankedProperty[];
}> {
  try {
    if (provider === 'gemini') {
      return await executeGeminiAgent(apiKey, model, messages, currentPrefs);
    } else {
      return await executeOpenAIAgent(apiKey, model, messages, currentPrefs);
    }
  } catch (error: any) {
    console.error('Live Agent Error:', error);
    const mockResult = runMockAgent(messages, currentPrefs);
    mockResult.reply = `⚠️ **LLM Connection Error:** "${error.message || error}". Fell back to local parser:\n\n` + mockResult.reply;
    return mockResult;
  }
}

// Gemini API Function Calling Implementation
async function executeGeminiAgent(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  currentPrefs: AgentPreferences
): Promise<{
  reply: string;
  thoughts: string;
  steps: AgentStep[];
  preferences: AgentPreferences;
  shortlist: RankedProperty[];
}> {
  const systemInstruction = `You are an Indian real estate agent's helper. Your task is to analyze the conversation and output a single JSON object representing the buyer's housing preferences.
Maintain and update the existing preferences provided below. Note: BHK refers to bedroom count. Parse Lakhs/Crores to standard Rupees (e.g. 1.2 Crore = 12000000, 85 Lakhs = 8500000).

Existing Preferences:
${JSON.stringify(currentPrefs, null, 2)}

You must return ONLY a JSON block containing the updated preferences:
{
  "city": string (e.g. "Bengaluru", "Mumbai", "Delhi NCR", "Pune"),
  "maxPrice": number (in Rupees, not string),
  "minBeds": number (BHK count),
  "minBaths": number,
  "workplaceAddress": string (e.g. "Manyata Tech Park", "BKC Mumbai", "Hinjewadi"),
  "commuteMode": "driving" | "transit" | "walking" | "bicycling",
  "maxCommuteMinutes": number,
  "minSchoolRating": number (1-10),
  "minSafetyScore": number (1-100),
  "priorities": {
    "price": number (1-5 weight, default 3),
    "schools": number (1-5 weight, default 3),
    "safety": number (1-5 weight, default 3),
    "commute": number (1-5 weight, default 3),
    "space": number (1-5 weight, default 3)
  }
}
Do not write markdown formatting or explanations. Output pure JSON.`;

  const parseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const promptText = `Conversation history:\n${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n\nUpdate preferences JSON:`;
  
  const parseResponse = await fetch(parseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });
  
  if (!parseResponse.ok) {
    const errText = await parseResponse.text();
    throw new Error(`Gemini API parse failed: ${errText}`);
  }
  
  const parseData = await parseResponse.json();
  let updatedPrefs: AgentPreferences = currentPrefs;
  try {
    const jsonText = parseData.candidates[0].content.parts[0].text;
    updatedPrefs = JSON.parse(jsonText);
  } catch (e) {
    console.error('Failed to parse Gemini preferences output.');
    updatedPrefs = runMockAgent(messages, currentPrefs).preferences;
  }
  
  const mockAgentResult = runMockAgent(messages, updatedPrefs);
  
  const justifyInstruction = `You are a warm, helpful, and analytical AI Property-Discovery Agent (GharFind AI) for Indian home buyers.
Analyze the buyer's query and the ranked properties database shortlist. Write a natural, personalized response summarizing why these properties were shortlisted. Cite details like prices (use Lakhs/Crores formatting, e.g. ₹1.5 Cr, ₹85 L), school quality, safety, and commute times.
Highlight matches and trade-offs honestly.

Buyer Preferences:
${JSON.stringify(updatedPrefs, null, 2)}

Ranked Shortlist:
${JSON.stringify(mockAgentResult.shortlist.map(rp => ({
  title: rp.property.title,
  priceFormatted: formatIndianCurrency(rp.property.price),
  beds: `${rp.property.beds} BHK`,
  baths: rp.property.baths,
  sqft: rp.property.sqft,
  neighborhood: rp.property.neighborhood,
  matchScore: rp.score,
  ranking: rp.ranking,
  commuteTime: rp.details.commuteTime,
  commuteDistance: rp.details.commuteDistance,
  safetyScore: rp.property.safetyScore,
  schoolsAvg: ((rp.property.schools.elementary.rating + rp.property.schools.middle.rating + rp.property.schools.high.rating) / 3).toFixed(1)
})), null, 2)}

In your response, remind them that they can click on the property cards in the shortlist to view detailed visual graphs.`;

  const justifyResponse = await fetch(parseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: justifyInstruction }] }
    })
  });
  
  if (!justifyResponse.ok) {
    const errText = await justifyResponse.text();
    throw new Error(`Gemini API synthesis failed: ${errText}`);
  }
  
  const justifyData = await justifyResponse.json();
  const reply = justifyData.candidates[0].content.parts[0].text;
  
  return {
    reply,
    thoughts: `Executed Live Gemini Agent. Model: ${model}. Successfully analyzed conversation, parsed preferences, performed database queries, executed deterministic ranker, and synthesized personalized agent descriptions.`,
    steps: mockAgentResult.steps,
    preferences: updatedPrefs,
    shortlist: mockAgentResult.shortlist
  };
}

// OpenAI API Function Calling Implementation
async function executeOpenAIAgent(
  apiKey: string,
  provider: string,
  messages: { role: string; content: string }[],
  currentPrefs: AgentPreferences
): Promise<{
  reply: string;
  thoughts: string;
  steps: AgentStep[];
  preferences: AgentPreferences;
  shortlist: RankedProperty[];
}> {
  // Similar implementation for OpenAI
  const parseUrl = 'https://api.openai.com/v1/chat/completions';
  const systemInstruction = `You are an Indian real estate agent's helper. Your task is to analyze the conversation and output a single JSON object representing the buyer's housing preferences.
Maintain and update the existing preferences provided below. Note: BHK refers to bedroom count. Parse Lakhs/Crores to standard Rupees (e.g. 1.2 Crore = 12000000, 85 Lakhs = 8500000).

Existing Preferences:
${JSON.stringify(currentPrefs, null, 2)}

You must return ONLY a JSON block containing the updated preferences:
{
  "city": string,
  "maxPrice": number,
  "minBeds": number,
  "minBaths": number,
  "workplaceAddress": string,
  "commuteMode": "driving" | "transit" | "walking" | "bicycling",
  "maxCommuteMinutes": number,
  "minSchoolRating": number,
  "minSafetyScore": number,
  "priorities": {
    "price": number,
    "schools": number,
    "safety": number,
    "commute": number,
    "space": number
  }
}
Do not write markdown formatting or explanations. Output pure JSON.`;

  const parseResponse = await fetch(parseUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: provider, // model passed as model argument
      messages: [
        { role: 'system', content: systemInstruction },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      response_format: { type: 'json_object' }
    })
  });
  
  if (!parseResponse.ok) {
    const errText = await parseResponse.text();
    throw new Error(`OpenAI API parse failed: ${errText}`);
  }
  
  const parseData = await parseResponse.json();
  let updatedPrefs: AgentPreferences = currentPrefs;
  try {
    const jsonText = parseData.choices[0].message.content;
    updatedPrefs = JSON.parse(jsonText);
  } catch (e) {
    console.error('Failed to parse OpenAI preferences output.');
    updatedPrefs = runMockAgent(messages, currentPrefs).preferences;
  }
  
  const mockAgentResult = runMockAgent(messages, updatedPrefs);
  
  const justifyInstruction = `You are a warm, helpful, and analytical AI Property-Discovery Agent (GharFind AI) for Indian home buyers.
Analyze the buyer's query and the ranked properties database shortlist. Write a natural, personalized response summarizing why these properties were shortlisted. Cite details like prices (use Lakhs/Crores formatting, e.g. ₹1.5 Cr, ₹85 L), school quality, safety, and commute times.
Highlight matches and trade-offs honestly.

Buyer Preferences:
${JSON.stringify(updatedPrefs, null, 2)}

Ranked Shortlist:
${JSON.stringify(mockAgentResult.shortlist.map(rp => ({
  title: rp.property.title,
  priceFormatted: formatIndianCurrency(rp.property.price),
  beds: `${rp.property.beds} BHK`,
  baths: rp.property.baths,
  sqft: rp.property.sqft,
  neighborhood: rp.property.neighborhood,
  matchScore: rp.score,
  ranking: rp.ranking,
  commuteTime: rp.details.commuteTime,
  commuteDistance: rp.details.commuteDistance,
  safetyScore: rp.property.safetyScore,
  schoolsAvg: ((rp.property.schools.elementary.rating + rp.property.schools.middle.rating + rp.property.schools.high.rating) / 3).toFixed(1)
})), null, 2)}

In your response, remind them that they can click on the property cards in the shortlist to view detailed visual graphs.`;

  const justifyResponse = await fetch(parseUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: provider,
      messages: [
        { role: 'system', content: justifyInstruction },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ]
    })
  });
  
  if (!justifyResponse.ok) {
    const errText = await justifyResponse.text();
    throw new Error(`OpenAI API synthesis failed: ${errText}`);
  }
  
  const justifyData = await justifyResponse.json();
  const reply = justifyData.choices[0].message.content;
  
  return {
    reply,
    thoughts: `Executed Live OpenAI Agent. Model: ${provider}. Successfully analyzed conversation, parsed preferences, performed database queries, executed deterministic ranker, and synthesized personalized agent descriptions.`,
    steps: mockAgentResult.steps,
    preferences: updatedPrefs,
    shortlist: mockAgentResult.shortlist
  };
}
