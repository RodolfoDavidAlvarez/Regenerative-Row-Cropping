/**
 * Regenerative Field Trial Proposal - Image Regenerator
 * Uses Google Gemini 2.0 Flash with enhanced prompts for photorealistic results
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const ASSETS_DIR = path.join(__dirname, "assets");

const genAI = new GoogleGenerativeAI(API_KEY);

// Enhanced prompts for more realistic, professional results
// Adding "photograph", "real", "natural lighting" to avoid AI artifacts
const ENHANCED_PROMPTS = [
  {
    filename: "cover-desert-agriculture.png",
    prompt: "Professional aerial photograph of a large-scale research farm in the Arizona Sonoran desert at golden hour. Show distinct agricultural blocks with different crop types - green hemp plants, golden grain fields, and legume rows. Irrigation channels visible between plots. Distant purple mountains on horizon. Natural warm sunset lighting. Shot with drone camera, documentary agricultural photography style. Real photograph, no illustrations.",
  },
  {
    filename: "university-arizona-collaboration.png",
    prompt: "Professional photograph of two agricultural scientists in a desert research field. They wear khaki work clothes and sun hats, one holding a soil probe, the other writing on a clipboard. Research plot markers with numbered stakes visible in background. Arizona desert farmland setting with blue sky. Natural daylight, candid documentary style. Real people, authentic scene.",
  },
  {
    filename: "compost-application-field.png",
    prompt: "Wide angle photograph of a tractor with spreader attachment applying dark brown compost onto flat desert farmland. Dust and organic particles visible in the air catching morning sunlight. Arizona mountains in distant background. Professional agricultural photography, action shot showing the spreading process. Real farm equipment, authentic scene.",
  },
  {
    filename: "biochar-blend-closeup.png",
    prompt: "Macro close-up photograph of soil amendment blend on a white background. Show visible chunks of black biochar, white zeolite crystals, brown worm castings, and fine mineral particles mixed together. Sharp focus, professional product photography with soft studio lighting. Real materials, no artificial elements.",
  },
  {
    filename: "soil-profile-layers.png",
    prompt: "Educational cross-section photograph of healthy soil profile dug from the ground. Show dark organic topsoil layer at top, lighter subsoil below, with visible plant roots extending down and white fungal threads (mycorrhizae) in the root zone. Measurement ruler on the side for scale. Clean scientific documentation style. Real soil sample.",
  },
  {
    filename: "soil-health-comparison.png",
    prompt: "Side-by-side comparison photograph showing two soil samples. Left side: cracked, pale, compacted degraded desert soil. Right side: dark, crumbly, rich healthy soil with visible organic matter. Both samples in hands or on a surface for comparison. Clear visual contrast. Natural lighting, documentary style.",
  },
  {
    filename: "gypsum-application.png",
    prompt: "Photograph of white gypsum granules being spread onto brown desert soil from agricultural equipment. White mineral particles contrasting against dark earth. Arizona farm setting, practical agricultural application scene. Natural daylight photography.",
  },
  {
    filename: "industrial-hemp-field.png",
    prompt: "Stunning landscape photograph of a mature industrial hemp field with tall green plants 6-8 feet high. Dense foliage with distinctive palmate leaves, thick fibrous stalks visible. Arizona desert landscape in background with mountains. Blue sky with a few clouds. Professional agricultural photography, vibrant natural colors.",
  },
  {
    filename: "summer-crops-sorghum.png",
    prompt: "Photograph of a sorghum grain field in the Arizona summer. Tall stalks with reddish-brown grain heads at the top, green leaves below. Hot summer atmosphere with irrigation visible at ground level. Professional farm photography, warm natural lighting.",
  },
  {
    filename: "legume-cover-crop.png",
    prompt: "Close-up photograph of cowpea or black-eyed pea plants in a field. Show the green compound leaves and if possible, expose some roots to show the pink/white nitrogen-fixing nodules. Educational agricultural photography showing the plant's soil-building function. Natural outdoor lighting.",
  },
  {
    filename: "fall-grain-barley.png",
    prompt: "Beautiful photograph of a golden barley field at harvest time. Mature grain heads with long awns catching the cool morning light. Arizona desert mountains visible in background. Landscape agricultural photography with warm golden tones. Real crop field.",
  },
  {
    filename: "crop-rotation-timeline.png",
    prompt: "Clean professional infographic showing a circular annual crop rotation diagram. Three segments: Hemp (January-June) in green, Summer Grains/Legumes (July-September) in orange/gold, Fall Grains (October-December) in brown. Simple icons for each crop. White background, business presentation style, clean typography.",
  },
  {
    filename: "fungal-extract-production.png",
    prompt: "Photograph of an on-farm compost tea brewing system. Large stainless steel or plastic tank (100-500 gallon) with air pump and agitation system, hoses connected, dark brown biological extract liquid visible. Farm workshop or outdoor setting. Practical agricultural equipment photography.",
  },
  {
    filename: "mycorrhizal-networks.png",
    prompt: "Scientific educational illustration showing underground mycorrhizal fungal networks. White fungal hyphae threads connecting multiple plant roots, creating a web-like network. Show nutrient exchange with small arrows. Clean diagram style with labels, educational textbook quality on light background.",
  },
  {
    filename: "fungal-compost-closeup.png",
    prompt: "Macro photograph of fungal-dominant compost material. Show visible white and cream-colored fungal hyphae threads growing throughout dark brown decomposed organic matter. Wood chip and leaf fragments visible. Sharp focus, professional soil biology photography.",
  },
  {
    filename: "forest-duff-collection.png",
    prompt: "Photograph of hands collecting forest floor material (duff/leaf litter) from under pine or oak trees. Dark spongy decomposed material rich in fungal life. Forest setting with dappled sunlight. Educational documentation style showing source of fungal inoculum.",
  },
  {
    filename: "soil-sampling-field.png",
    prompt: "Professional photograph of a soil scientist using a metal soil probe to collect samples in a marked research plot. Labeled sample bags visible, GPS device or tablet for data recording. Desert agricultural research setting with plot markers. Scientific field documentation style.",
  },
  {
    filename: "infiltration-test.png",
    prompt: "Close-up photograph of a water infiltration test being conducted in desert soil. Metal ring (infiltrometer) embedded in the ground with water pooled inside. Stopwatch and data clipboard visible nearby. Scientific soil testing documentation, natural outdoor lighting.",
  },
  {
    filename: "soil-health-dashboard.png",
    prompt: "Clean professional infographic dashboard showing soil health metrics. Include circular gauges for: Soil Organic Carbon percentage, Fungal:Bacterial ratio indicator, Water Infiltration rate chart, pH scale. Green and blue color scheme on white background. Business data visualization style.",
  },
  {
    filename: "economic-comparison-chart.png",
    prompt: "Professional bar chart comparing Industrial Agriculture vs Regenerative Agriculture over 5 years. Show declining costs for regenerative, rising costs for industrial. Include bars for: Input costs, Water usage, Equipment costs. Clean business presentation style, green and gray colors.",
  },
  {
    filename: "yield-progression-graph.png",
    prompt: "Clean line graph showing crop yield progression over a 5-year period. Multiple colored lines showing different soil treatments, all trending upward. X-axis: Years 1-5, Y-axis: Yield. Professional scientific chart style with legend, green color theme.",
  },
  {
    filename: "drench-application.png",
    prompt: "Photograph of biological extract being applied to crop rows. Tractor with spray boom or drip system applying dark brown liquid to the soil at the base of young plants. Arizona farm setting, morning application timing. Practical agricultural photography.",
  },
  {
    filename: "water-bubble-tank.png",
    prompt: "Photograph of a large water nurse tank (water buffalo/water bubble) trailer being pulled by a tractor in a desert farm field. Blue or white plastic tank on trailer frame. Used for mixing and transporting biological applications. Arizona agricultural setting.",
  },
  {
    filename: "research-plot-markers.png",
    prompt: "Photograph of clearly marked agricultural research plots in a field. Numbered wooden or metal stakes, treatment labels or tags visible. Randomized block experimental design layout. University research trial setting with distinct plot boundaries. Scientific documentation style.",
  },
  {
    filename: "healthy-soil-handful.png",
    prompt: "Emotional close-up photograph of weathered farmer's hands holding a handful of dark, rich, healthy soil. Visible organic matter, small root fragments, possibly an earthworm. Hopeful, aspirational image representing successful soil regeneration. Natural outdoor lighting, shallow depth of field.",
  },
  {
    filename: "transition-guide-mockup.png",
    prompt: "Professional product mockup of a printed spiral-bound guidebook. Title: 'Desert Regenerative Agriculture Transition Guide' on the cover with imagery of healthy soil and crops. Clean professional design, white background, slight shadow. Marketing presentation style.",
  }
];

async function generateImage(prompt, filename) {
  try {
    console.log(`\n🎨 Generating: ${filename}`);
    console.log(`   Prompt: ${prompt.substring(0, 80)}...`);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["image", "text"],
      }
    });

    // Add quality enhancers to the prompt
    const enhancedPrompt = prompt + " High resolution, professional quality, no watermarks, no text overlays, no artificial looking elements.";

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;

    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts;

      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
          const imageData = Buffer.from(part.inlineData.data, "base64");
          const filePath = path.join(ASSETS_DIR, filename);
          fs.writeFileSync(filePath, imageData);
          console.log(`   ✅ Saved: ${filePath}`);
          return true;
        }
      }
    }

    console.log(`   ⚠️ No image generated for ${filename}`);
    return false;
  } catch (error) {
    console.error(`   ❌ Error generating ${filename}:`, error.message);
    return false;
  }
}

async function regenerateAll() {
  console.log("");
  console.log("🌱 ═══════════════════════════════════════════════════════════════");
  console.log("   REGENERATING IMAGES - Enhanced Prompts for Realistic Results");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log(`📁 Output directory: ${ASSETS_DIR}`);
  console.log(`📝 Images to regenerate: ${ENHANCED_PROMPTS.length}`);
  console.log("");

  if (!API_KEY) {
    console.log("❌ ERROR: Please set GOOGLE_AI_API_KEY environment variable");
    return;
  }

  let successful = 0;
  let failed = 0;

  for (const { filename, prompt } of ENHANCED_PROMPTS) {
    const success = await generateImage(prompt, filename);
    if (success) {
      successful++;
    } else {
      failed++;
    }
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  console.log("\n═══════════════════════════════════════════════════════════════════");
  console.log("📊 Regeneration Complete!");
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log("═══════════════════════════════════════════════════════════════════");
}

// Run specific image by filename
async function regenerateSingle(filename) {
  const config = ENHANCED_PROMPTS.find(p => p.filename === filename);
  if (!config) {
    console.log(`❌ Image "${filename}" not found`);
    console.log("Available images:");
    ENHANCED_PROMPTS.forEach(p => console.log(`  - ${p.filename}`));
    return;
  }

  if (!API_KEY) {
    console.log("❌ ERROR: Please set GOOGLE_AI_API_KEY environment variable");
    return;
  }

  await generateImage(config.prompt, config.filename);
}

// Main
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === "--single" && args[1]) {
    regenerateSingle(args[1]);
  } else {
    regenerateAll();
  }
}

module.exports = { regenerateAll, regenerateSingle, ENHANCED_PROMPTS };
