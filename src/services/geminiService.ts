import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResults, OutfitRequest, OutfitResponse, WardrobeItem, ShoppingRecommendation, MarketplaceProduct } from "../types";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("Gemini API Key is missing. Please configure it in the AI Studio Secrets panel.");
  }
  return new GoogleGenAI({ apiKey });
};

const extractBase64 = (dataUrl: string) => {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) return { data: dataUrl, mimeType: 'image/jpeg' };
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  return { data: parts[1], mimeType };
};

const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message || "";
      if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
        console.warn(`Gemini API 429 detected. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const geminiService = {
  async analyzeFaceAndBody(faceImageBase64: string, bodyImageBase64: string, personalityProfile?: any): Promise<AnalysisResults> {
    return retryWithBackoff(async () => {
      const ai = getAI();
      const model = "gemini-2.5-flash";      
      const prompt = `
        You are a world-class fashion styling AI, facial geometry expert, and UX designer. Analyze these two images (Face and Full Body) and the user's personality profile to create a comprehensive biological style profile, advanced face shape analysis, and a personalized UI Mood Profile.
        
        Personality Profile: ${JSON.stringify(personalityProfile || {})}
        
        Face Image: First image provided. Perform advanced geometry mapping:
        - Measure forehead, cheekbone, and jawline width relative to each other.
        - Calculate face length-to-width ratio.
        - Analyze chin curvature and overall symmetry.
        - Classify face shape: Oval, Round, Square, Heart, Diamond, or Oblong.
        
        Body Image: Second image provided. Perform advanced body shape analysis:
        - Analyze proportions: shoulder width, waist width, and hip width.
        - Calculate shoulder-to-waist and waist-to-hip ratios.
        - Classify body shape into one of these categories: Rectangle, Triangle, Inverted Triangle, Hourglass, or Oval.
        - Provide a short, professional explanation of why this body shape was chosen (e.g., "Your shoulders and hips are balanced with a slightly defined waist, which indicates an Hourglass body shape.").
        - Estimate height and weight.
        
        Provide a detailed analysis including:
        - Face: skinTone, undertone, seasonalColor, eyeColor, contrastLevel.
        - Face Details: shape, confidenceScore (0-1), lengthToWidthRatio, jawWidthRatio, foreheadRatio, symmetryLevel, and geometry (widths/curvature).
        - Body: type (Rectangle, Triangle, Inverted Triangle, Hourglass, or Oval), explanation, proportions, heightEstimation, weightEstimation, shoulderRatio, waistToHipRatio, bestSilhouettes, avoidSuggestions, necklineRecommendations, sleeveGuidance.
        - Styling Guide: Comprehensive recommendations for hairstyles (best/avoid/volume), necklines (with reasons), earrings (styles/size/shapes), eyewear (suggestions/avoid/logic), makeup (highlight/contour/blush), and beard (if applicable).
        - UI Mood Profile: Generate a UI configuration that matches the user's psychology.
      `;

      const faceData = extractBase64(faceImageBase64);
      const bodyData = extractBase64(bodyImageBase64);

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: faceData.data, mimeType: faceData.mimeType } },
            { inlineData: { data: bodyData.data, mimeType: bodyData.mimeType } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              face: {
                type: Type.OBJECT,
                properties: {
                  skinTone: { type: Type.STRING },
                  undertone: { type: Type.STRING },
                  seasonalColor: { type: Type.STRING },
                  eyeColor: { type: Type.STRING },
                  contrastLevel: { type: Type.STRING },
                  details: {
                    type: Type.OBJECT,
                    properties: {
                      shape: { type: Type.STRING },
                      confidenceScore: { type: Type.NUMBER },
                      lengthToWidthRatio: { type: Type.NUMBER },
                      jawWidthRatio: { type: Type.NUMBER },
                      foreheadRatio: { type: Type.NUMBER },
                      symmetryLevel: { type: Type.NUMBER },
                      geometry: {
                        type: Type.OBJECT,
                        properties: {
                          foreheadWidth: { type: Type.STRING },
                          cheekboneWidth: { type: Type.STRING },
                          jawlineWidth: { type: Type.STRING },
                          chinCurvature: { type: Type.STRING },
                        },
                        required: ["foreheadWidth", "cheekboneWidth", "jawlineWidth", "chinCurvature"]
                      }
                    },
                    required: ["shape", "confidenceScore", "lengthToWidthRatio", "jawWidthRatio", "foreheadRatio", "symmetryLevel", "geometry"]
                  }
                },
                required: ["skinTone", "undertone", "seasonalColor", "eyeColor", "contrastLevel", "details"]
              },
              body: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  proportions: { type: Type.STRING },
                  heightEstimation: { type: Type.STRING },
                  weightEstimation: { type: Type.STRING },
                  shoulderRatio: { type: Type.STRING },
                  waistToHipRatio: { type: Type.STRING },
                  bestSilhouettes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  avoidSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  necklineRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sleeveGuidance: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["type", "explanation", "proportions", "heightEstimation", "shoulderRatio", "waistToHipRatio", "bestSilhouettes", "avoidSuggestions", "necklineRecommendations", "sleeveGuidance"]
              },
              stylingGuide: {
                type: Type.OBJECT,
                properties: {
                  hairstyles: {
                    type: Type.OBJECT,
                    properties: {
                      best: { type: Type.ARRAY, items: { type: Type.STRING } },
                      avoid: { type: Type.ARRAY, items: { type: Type.STRING } },
                      volumePlacement: { type: Type.STRING },
                    },
                    required: ["best", "avoid", "volumePlacement"]
                  },
                  necklines: {
                    type: Type.OBJECT,
                    properties: {
                      recommendations: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            type: { type: Type.STRING },
                            reason: { type: Type.STRING },
                          },
                          required: ["type", "reason"]
                        }
                      }
                    },
                    required: ["recommendations"]
                  },
                  earrings: {
                    type: Type.OBJECT,
                    properties: {
                      styles: { type: Type.ARRAY, items: { type: Type.STRING } },
                      sizeGuidance: { type: Type.STRING },
                      shapes: { type: Type.STRING },
                    },
                    required: ["styles", "sizeGuidance", "shapes"]
                  },
                  eyewear: {
                    type: Type.OBJECT,
                    properties: {
                      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                      avoid: { type: Type.ARRAY, items: { type: Type.STRING } },
                      logic: { type: Type.STRING },
                    },
                    required: ["suggestions", "avoid", "logic"]
                  },
                  makeup: {
                    type: Type.OBJECT,
                    properties: {
                      highlight: { type: Type.STRING },
                      contour: { type: Type.STRING },
                      blush: { type: Type.STRING },
                    },
                    required: ["highlight", "contour", "blush"]
                  },
                  beard: {
                    type: Type.OBJECT,
                    properties: {
                      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                      logic: { type: Type.STRING },
                      avoid: { type: Type.STRING },
                    },
                    required: ["suggestions", "logic", "avoid"]
                  }
                },
                required: ["hairstyles", "necklines", "earrings", "eyewear", "makeup"]
              },
              uiProfile: {
                type: Type.OBJECT,
                properties: {
                  visualIntensity: { type: Type.NUMBER },
                  contrastPreference: { type: Type.STRING },
                  edgeSoftness: { type: Type.NUMBER },
                  animationEnergy: { type: Type.NUMBER },
                  themeType: { type: Type.STRING },
                  primaryFont: { type: Type.STRING },
                  accentColor: { type: Type.STRING },
                },
                required: ["visualIntensity", "contrastPreference", "edgeSoftness", "animationEnergy", "themeType", "primaryFont", "accentColor"]
              }
            },
            required: ["face", "body", "stylingGuide", "uiProfile"]
          }
        }
      });

      return JSON.parse(response.text || "{}");
    });
  },

  async analyzeClothingItem(imageBase64: string): Promise<Partial<WardrobeItem>> {
    return retryWithBackoff(async () => {
      const ai = getAI();
      const model = "gemini-2.5-flash";
      const prompt = `
        Analyze this clothing item image. Provide a detailed structured data model for a digital closet system.
        
        Include:
        - category: Top, Bottom, Dress, Footwear, Bag, Accessory, Jewelry
        - subcategory: Specific type (e.g., Blazer, T-shirt, Kurti, Heels, Sneakers)
        - primary_color: HEX code
        - secondary_colors: List of HEX codes
        - shade_intensity: light, medium, or dark
        - pattern_type: solid, striped, floral, checks, abstract, or printed
        - pattern_scale: small, medium, or large
        - fabric_type: cotton, linen, silk, denim, wool, polyester, etc.
        - fabric_weight: light, medium, or heavy
        - stretch_level: none, medium, or high
        - fit_type: slim, regular, oversized, or tailored
        - structure_level: soft, semi-structured, or structured
        - season: Summer, Winter, Monsoon, or All-season
        - breathability_score: 1-10
        - layer_compatibility: 1-10
        - metadata: formality (1-10), boldness (1-10), versatility (1-10), body_compatibility tags, face_compatibility tags (for necklines).
        - tags: General smart tags for categorization.
      `;

      const imageData = extractBase64(imageBase64);

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: imageData.data, mimeType: imageData.mimeType } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              subcategory: { type: Type.STRING },
              primary_color: { type: Type.STRING },
              secondary_colors: { type: Type.ARRAY, items: { type: Type.STRING } },
              shade_intensity: { type: Type.STRING },
              pattern_type: { type: Type.STRING },
              pattern_scale: { type: Type.STRING },
              fabric_type: { type: Type.STRING },
              fabric_weight: { type: Type.STRING },
              stretch_level: { type: Type.STRING },
              fit_type: { type: Type.STRING },
              structure_level: { type: Type.STRING },
              season: { type: Type.STRING },
              breathability_score: { type: Type.NUMBER },
              layer_compatibility: { type: Type.NUMBER },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              metadata: {
                type: Type.OBJECT,
                properties: {
                  formality: { type: Type.NUMBER },
                  boldness: { type: Type.NUMBER },
                  versatility: { type: Type.NUMBER },
                  body_compatibility: { type: Type.ARRAY, items: { type: Type.STRING } },
                  face_compatibility: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["formality", "boldness", "versatility", "body_compatibility", "face_compatibility"]
              }
            },
            required: ["category", "subcategory", "primary_color", "shade_intensity", "pattern_type", "fabric_type", "fit_type", "season", "metadata", "tags"]
          }
        }
      });

      return JSON.parse(response.text || "{}");
    });
  },

  async generateOutfit(
    request: OutfitRequest, 
    wardrobe: WardrobeItem[], 
    analysis: AnalysisResults,
    userProfile?: any
  ): Promise<OutfitResponse> {
    return retryWithBackoff(async () => {
      const ai = getAI();
      const model = "gemini-2.5-flash";      
      const prompt = `
        You are an expert fashion stylist and 3D visualization director. Generate a hyper-personalized outfit using ONLY items from the user's wardrobe.
        
        USER PROFILE:
        - Face Analysis: ${JSON.stringify(analysis.face)}
        - Body Analysis: ${JSON.stringify(analysis.body)}
        - Styling Guide: ${JSON.stringify(analysis.stylingGuide)}
        - Gender: ${userProfile?.gender || 'Not specified'}
        - Height: ${userProfile?.height || 'Not specified'}cm
        - Style Preference: ${userProfile?.style_preference || 'Not specified'}
        - Location: ${userProfile?.location || 'Not specified'} (City: ${userProfile?.city || 'Not specified'})
        
        CONTEXT:
        - Occasion: ${request.occasion}
        - Time: ${request.timeOfDay}
        - Weather: ${JSON.stringify(request.weather)}
        - Mood: ${request.mood}
        - Formality: ${request.formality}/10
        
        WARDROBE INVENTORY (STRICT LIMIT):
        ${JSON.stringify(wardrobe.map(i => ({ 
          id: i.id, 
          category: i.category, 
          subcategory: i.subcategory,
          color: i.primary_color, 
          fabric: i.fabric_type, 
          pattern: i.pattern_type,
          fit: i.fit_type,
          metadata: i.metadata
        })))}
        
        RULES:
        1. DO NOT suggest imaginary clothing.
        2. DO NOT recommend items not present in the inventory.
        3. If no suitable item exists for a category, flag it as a "Wardrobe Gap Detected".
        4. Ensure neckline compatibility with face shape.
        5. Ensure structure matches body type.
        6. Adjust recommendation based on local climate (${userProfile?.city || 'current location'}).
        
        Provide:
        1. Outfit Name
        2. List of WardrobeItem objects (full objects from inventory)
        3. Detailed explanation (psychology, color theory, body proportion)
        4. Color harmony breakdown
        5. Body proportion logic
        6. Face shape logic (neckline/accessory alignment)
        7. Climate compatibility reasoning
        8. 2-3 alternative outfit combinations (as arrays of WardrobeItems)
        9. Confidence Scores (0-100): bodyCompatibility, colorHarmony, occasionSuitability, overall.
        10. Clone Visualization Instructions: pose, lighting (day/evening/night), and a detailed description for an AI image generator to render this outfit on a clone matching the user's proportions.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              items: { type: Type.ARRAY, items: { type: Type.OBJECT } },
              explanation: { type: Type.STRING },
              colorHarmony: { type: Type.STRING },
              bodyProportionLogic: { type: Type.STRING },
              faceShapeLogic: { type: Type.STRING },
              climateReasoning: { type: Type.STRING },
              alternatives: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.OBJECT } } },
              confidenceScores: {
                type: Type.OBJECT,
                properties: {
                  bodyCompatibility: { type: Type.NUMBER },
                  colorHarmony: { type: Type.NUMBER },
                  occasionSuitability: { type: Type.NUMBER },
                  overall: { type: Type.NUMBER },
                },
                required: ["bodyCompatibility", "colorHarmony", "occasionSuitability", "overall"]
              },
              cloneVisualization: {
                type: Type.OBJECT,
                properties: {
                  pose: { type: Type.STRING },
                  lighting: { type: Type.STRING },
                  renderingDescription: { type: Type.STRING },
                },
                required: ["pose", "lighting", "renderingDescription"]
              },
              gapDetected: { type: Type.STRING }
            },
            required: ["name", "items", "explanation", "colorHarmony", "bodyProportionLogic", "faceShapeLogic", "climateReasoning", "confidenceScores", "cloneVisualization"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      // Optional: Generate the actual preview image using nano banana
      if (result.cloneVisualization?.renderingDescription) {
        try {
          const imageModel = "gemini-2.5-flash";
          const imageResponse = await ai.models.generateContent({
            model: imageModel,
            contents: {
              parts: [{ text: `A high-end fashion photography shot. ${result.cloneVisualization.renderingDescription}. Realistic fabric draping, luxury background, professional lighting.` }]
            }
          });
          
          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
              result.cloneVisualization.renderingUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (e) {
          console.warn("Failed to generate clone preview image:", e);
        }
      }

      return result;
    });
  },

  async getShoppingStrategy(wardrobe: WardrobeItem[], analysis: AnalysisResults, userProfile?: any): Promise<ShoppingRecommendation[]> {
    return retryWithBackoff(async () => {
      const ai = getAI();
      const model = "gemini-2.5-flash";
      const prompt = `
        You are a strategic fashion buyer and personal shopper specializing in the Indian market and student budgets. Analyze the user's wardrobe and biological profile to identify critical gaps and suggest budget-friendly marketplace products.
        
        USER PROFILE:
        - Face Analysis: ${JSON.stringify(analysis.face)}
        - Body Analysis: ${JSON.stringify(analysis.body)}
        - UI Mood Profile: ${JSON.stringify(analysis.uiProfile)}
        - Budget Preference: ${userProfile?.budget_preference || 'Mid-range'}
        - Style Preference: ${userProfile?.style_preference || 'Classic'}
        - Location: ${userProfile?.location || 'India'}
        
        WARDROBE INVENTORY:
        ${JSON.stringify(wardrobe.map(i => ({ 
          id: i.id, 
          category: i.category, 
          subcategory: i.subcategory,
          color: i.primary_color, 
          fabric: i.fabric_type, 
          fit: i.fit_type,
          metadata: i.metadata
        })))}
        
        TASK:
        1. Identify 3-5 critical wardrobe gaps based on occasion needs, seasonal suitability, and style archetype.
        2. For each gap, check if the user already owns something SIMILAR.
        3. For each gap, suggest 2-3 high-quality but BUDGET-FRIENDLY marketplace products.
        
        BUDGET RULES (INR) - ADJUST BASED ON USER PREFERENCE (${userProfile?.budget_preference}):
        - Blazers: ₹1000 – ₹2000
        - Shirts: ₹400 – ₹1000
        - Trousers: ₹800 – ₹1500
        - Casual shoes: ₹1200 – ₹2500
        - Max price for any item: ₹3000.
        - Prioritize affordable clothing suitable for Indian climate.
        
        LINK RULES:
        - Use valid search links instead of direct product URLs.
        - Amazon: https://www.amazon.in/s?k=[search+query]+under+[price]
        - Flipkart: https://www.flipkart.com/search?q=[search+query]+under+[price]
        
        Provide a list of ShoppingRecommendation objects.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                reason: { type: Type.STRING },
                priority: { type: Type.STRING },
                suggestedProducts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      price: { type: Type.STRING, description: "Price range in INR, e.g., ₹1200 - ₹1800" },
                      rating: { type: Type.NUMBER },
                      image: { type: Type.STRING, description: "Use format: https://source.unsplash.com/600x800/?[product-name-keywords],fashion,clothing" },
                      amazonLink: { type: Type.STRING },
                      flipkartLink: { type: Type.STRING },
                      description: { type: Type.STRING, description: "Budget tip and suitability note" },
                      suitability: {
                        type: Type.OBJECT,
                        properties: {
                          bodyType: { type: Type.STRING },
                          colorPalette: { type: Type.STRING },
                          wardrobeGap: { type: Type.STRING },
                        },
                        required: ["bodyType", "colorPalette", "wardrobeGap"]
                      },
                      fabric: { type: Type.STRING },
                      fit: { type: Type.STRING },
                    },
                    required: ["id", "name", "price", "rating", "image", "amazonLink", "flipkartLink", "description", "suitability", "fabric", "fit"]
                  }
                },
                similarWardrobeItem: { type: Type.OBJECT }
              },
              required: ["category", "reason", "priority", "suggestedProducts"]
            }
          }
        }
      });

      return JSON.parse(response.text || "[]");
    });
  }
};
