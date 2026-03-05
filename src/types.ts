export interface User {
  id: number;
  full_name: string;
  email: string;
  gender?: string;
  age?: number;
  height?: number;
  style_preference?: string;
  budget_preference?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  analysis_results?: AnalysisResults;
}

export interface UIMoodProfile {
  visualIntensity: number; // 0 to 1
  contrastPreference: 'low' | 'high';
  edgeSoftness: number; // 0 to 1 (0 = sharp, 1 = rounded)
  animationEnergy: number; // 0 to 1
  themeType: 'soft' | 'bold' | 'energetic' | 'minimal';
  primaryFont: 'serif' | 'sans';
  accentColor?: string;
}

export interface FaceShapeDetails {
  shape: 'Oval' | 'Round' | 'Square' | 'Heart' | 'Diamond' | 'Oblong';
  confidenceScore: number;
  lengthToWidthRatio: number;
  jawWidthRatio: number;
  foreheadRatio: number;
  symmetryLevel: number;
  geometry: {
    foreheadWidth: string;
    cheekboneWidth: string;
    jawlineWidth: string;
    chinCurvature: string;
  };
}

export interface StylingGuide {
  hairstyles: {
    best: string[];
    avoid: string[];
    volumePlacement: string;
  };
  necklines: {
    recommendations: { type: string; reason: string }[];
  };
  earrings: {
    styles: string[];
    sizeGuidance: string;
    shapes: string;
  };
  eyewear: {
    suggestions: string[];
    avoid: string[];
    logic: string;
  };
  makeup: {
    highlight: string;
    contour: string;
    blush: string;
  };
  beard?: {
    suggestions: string[];
    logic: string;
    avoid: string;
  };
}

export interface AnalysisResults {
  face: {
    skinTone: string;
    undertone: string;
    seasonalColor: string;
    eyeColor: string;
    contrastLevel: string;
    details: FaceShapeDetails;
  };
  body: {
    type: string;
    explanation?: string;
    proportions: string;
    heightEstimation: string;
    weightEstimation?: string;
    shoulderRatio: string;
    waistToHipRatio: string;
    bestSilhouettes: string[];
    avoidSuggestions: string[];
    necklineRecommendations: string[];
    sleeveGuidance: string[];
  };
  stylingGuide: StylingGuide;
  uiProfile?: UIMoodProfile;
}

export interface WardrobeItem {
  id: number;
  user_id: number;
  category: 'Top' | 'Bottom' | 'Dress' | 'Footwear' | 'Bag' | 'Accessory' | 'Jewelry';
  subcategory: string;
  brand?: string;
  purchase_date?: string;
  price?: number;
  primary_color: string; // HEX
  secondary_colors: string[];
  shade_intensity: 'light' | 'medium' | 'dark';
  pattern_type: 'solid' | 'striped' | 'floral' | 'checks' | 'abstract' | 'printed';
  pattern_scale: 'small' | 'medium' | 'large';
  fabric_type: string;
  fabric_weight: 'light' | 'medium' | 'heavy';
  stretch_level: 'none' | 'medium' | 'high';
  fit_type: 'slim' | 'regular' | 'oversized' | 'tailored';
  structure_level: 'soft' | 'semi-structured' | 'structured';
  season: 'Summer' | 'Winter' | 'Monsoon' | 'All-season';
  breathability_score: number;
  layer_compatibility: number;
  image_url: string;
  tags: string[];
  metadata: {
    formality: number;
    boldness: number;
    versatility: number;
    body_compatibility: string[];
    face_compatibility: string[];
  };
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  rainProb: number;
  wind: number;
}

export interface OutfitRequest {
  occasion: string;
  timeOfDay: 'day' | 'evening' | 'night';
  weather: WeatherData;
  mood: string;
  prepTime: number;
  confidence: number;
  isIndoor: boolean;
  formality: number;
}

export interface OutfitResponse {
  name: string;
  items: WardrobeItem[]; // Strict use of wardrobe items
  explanation: string;
  colorHarmony: string;
  bodyProportionLogic: string;
  faceShapeLogic: string;
  climateReasoning: string;
  alternatives: WardrobeItem[][];
  confidenceScores: {
    bodyCompatibility: number;
    colorHarmony: number;
    occasionSuitability: number;
    overall: number;
  };
  cloneVisualization: {
    pose: string;
    lighting: 'day' | 'evening' | 'night';
    renderingDescription: string;
    renderingUrl?: string; // AI generated preview
  };
  gapDetected?: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  price: string;
  rating: number;
  image: string;
  amazonLink: string;
  flipkartLink: string;
  description: string;
  suitability: {
    bodyType: string;
    colorPalette: string;
    wardrobeGap: string;
  };
  fabric: string;
  fit: string;
}

export interface ShoppingRecommendation {
  category: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  suggestedProducts: MarketplaceProduct[];
  similarWardrobeItem?: WardrobeItem; // For the "Scan Similar" feature
}
