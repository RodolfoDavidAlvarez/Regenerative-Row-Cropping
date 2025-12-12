/**
 * Regenerative Field Trial Proposal - Image Generator
 * Uses Google Gemini API (Nano Banana Pro) to generate images
 *
 * Setup:
 * 1. npm install @google/generative-ai
 * 2. Set your API key: export GOOGLE_AI_API_KEY="your-key-here"
 * 3. Run: node generate-images.js
 *
 * Commands:
 *   npm run generate          - Generate all images
 *   npm run generate:single   - Generate a single image
 *   npm run list              - List all available images
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Configuration
const API_KEY = process.env.GOOGLE_AI_API_KEY || "YOUR_API_KEY_HERE";
const ASSETS_DIR = path.join(__dirname, "assets");

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);

// Image prompts for the Regenerative Field Trial Proposal
const IMAGE_PROMPTS = [
  // Cover & Hero Images
  {
    filename: "cover-desert-agriculture.png",
    prompt: "Stunning aerial view of a 24-acre research farm in the Arizona desert with distinct planted blocks showing different soil treatments, industrial hemp rows in one section, golden grain crops in another, green legumes in third section. Sonoran desert landscape with mountains in background, irrigation channels visible. Golden hour lighting, professional agricultural documentary photography. Photorealistic.",
    section: "Cover Page"
  },
  {
    filename: "university-arizona-collaboration.png",
    prompt: "Professional photo of agricultural researchers in field with University of Arizona branded clothing, collecting soil samples in research plots marked with numbered stakes. Desert farm setting, modern soil testing equipment visible, clipboard with data sheets. Scientific documentary style photography.",
    section: "Cover Page"
  },

  // Soil Treatment Images
  {
    filename: "compost-application-field.png",
    prompt: "Wide shot of tractor spreading dark rich compost onto prepared desert farmland. Dust and organic matter visible in air, early morning golden light, Arizona desert backdrop with distant mountains. Professional agricultural photography showing scale of operation.",
    section: "Soil Treatments"
  },
  {
    filename: "biochar-blend-closeup.png",
    prompt: "Close-up macro photo of Desert Resilience Blend soil amendment showing black biochar chunks, zeolite crystite crystals, dark worm castings, and mineral fines mixed together. Professional product photography on natural soil background, sharp detail, studio lighting style.",
    section: "Soil Treatments"
  },
  {
    filename: "soil-profile-layers.png",
    prompt: "Scientific cross-section photograph of healthy regenerative soil profile showing distinct layers: dark organic-rich topsoil, root penetration zone with visible white mycorrhizal networks, subsoil transition. Clean educational diagram style with measurement ruler visible on side.",
    section: "Soil Treatments"
  },
  {
    filename: "gypsum-application.png",
    prompt: "Agricultural photo of gypsum being applied to desert soil, white mineral granules spreading from equipment onto brown earth. Arizona farm setting, professional photography showing soil amendment process.",
    section: "Biological Inputs"
  },

  // Crop Rotation Images
  {
    filename: "industrial-hemp-field.png",
    prompt: "Stunning photo of mature industrial hemp field with tall dense green plants reaching 6-8 feet, thick stalks and large leaves. Arizona desert farm setting, blue sky, mountains in distance. Professional agricultural photography showing healthy vigorous crop.",
    section: "Crop Rotations"
  },
  {
    filename: "summer-crops-sorghum.png",
    prompt: "Photo of tall sorghum grain crop growing in Arizona summer heat, red-brown seed heads visible at top of stalks, dense green foliage. Desert agricultural setting with irrigation visible, afternoon sun. Documentary style farm photography.",
    section: "Crop Rotations"
  },
  {
    filename: "legume-cover-crop.png",
    prompt: "Close-up photo of cowpea or pigeon pea legume plants with visible nitrogen-fixing root nodules exposed at soil line, healthy green foliage above. Desert farm setting, educational documentary style showing legume's soil-building role.",
    section: "Crop Rotations"
  },
  {
    filename: "fall-grain-barley.png",
    prompt: "Golden barley grain field in late fall Arizona setting, mature seed heads swaying, cool morning light. Desert mountains in background, professional agricultural landscape photography.",
    section: "Crop Rotations"
  },
  {
    filename: "crop-rotation-timeline.png",
    prompt: "Clean infographic illustration showing annual crop rotation cycle: Hemp (Jan-Jun) in green, Summer Grains/Legumes (Jul-Sep) in orange, Fall Grains (Oct-Dec) in brown. Circular timeline design with crop icons, professional business document style.",
    section: "Crop Rotations"
  },

  // Biological & Fungal Images
  {
    filename: "fungal-extract-production.png",
    prompt: "Photo of on-farm biological extract production system - large stainless steel brewing tank with agitation system, hoses connected, dark rich compost extract visible. Farm workshop setting, professional equipment photography.",
    section: "Field Protocol"
  },
  {
    filename: "mycorrhizal-networks.png",
    prompt: "Scientific illustration of mycorrhizal fungal networks in soil, showing white hyphae threads connecting plant roots underground, nutrient exchange arrows, beneficial bacteria zones in blue. Clean educational diagram style with labels, professional scientific illustration.",
    section: "Fungal Formulas"
  },
  {
    filename: "fungal-compost-closeup.png",
    prompt: "Macro photograph of fungal-dominant compost showing visible white and tan fungal hyphae threads throughout dark organic material. Wood chip and leaf litter particles visible. Professional soil biology photography, sharp detail.",
    section: "Fungal Formulas"
  },
  {
    filename: "forest-duff-collection.png",
    prompt: "Photo of hands collecting forest floor duff material - dark spongy decomposed leaf litter from under pine trees. Forest setting, educational documentation style showing fungal inoculum source material.",
    section: "Appendix"
  },

  // Monitoring & Testing Images
  {
    filename: "soil-sampling-field.png",
    prompt: "Professional photo of soil scientist using soil probe to collect samples in research plot, labeled sample bags visible, GPS device for location marking. Desert farm research setting, scientific documentation style.",
    section: "Monitoring"
  },
  {
    filename: "infiltration-test.png",
    prompt: "Close-up photo of water infiltration ring test in desert soil - metal cylinder embedded in ground with water inside, stopwatch and data sheet visible nearby. Arizona farm setting, scientific testing documentation.",
    section: "Monitoring"
  },
  {
    filename: "soil-health-dashboard.png",
    prompt: "Clean infographic dashboard showing soil health metrics: SOC percentage gauge, F:B ratio indicator, infiltration rate chart, pH scale. Green and blue color scheme, professional data visualization style for agricultural research.",
    section: "Monitoring"
  },

  // Economic & Results Images
  {
    filename: "economic-comparison-chart.png",
    prompt: "Professional bar chart infographic comparing Industrial Agriculture vs Regenerative Agriculture costs over 5 years - showing input costs, water usage, equipment needs. Green and gray color scheme, clean business document style.",
    section: "Economic Evaluation"
  },
  {
    filename: "yield-progression-graph.png",
    prompt: "Line graph illustration showing crop yield progression over 5-year study period, multiple colored lines for different soil treatments, upward trending. Clean scientific chart style with legend, green color theme.",
    section: "Economic Evaluation"
  },

  // Field Protocol Images
  {
    filename: "drench-application.png",
    prompt: "Photo of biological extract being applied to crop rows via boom sprayer, dark liquid drenching soil at base of young hemp plants. Desert farm setting, morning application timing, professional agricultural photography.",
    section: "Field Protocol"
  },
  {
    filename: "water-bubble-tank.png",
    prompt: "Photo of large water trailer tank (water bubble) being pulled by tractor in desert farm field, used for dilution water in biological applications. Arizona agriculture setting, practical farm equipment photography.",
    section: "Field Protocol"
  },

  // Research & Outcomes Images
  {
    filename: "research-plot-markers.png",
    prompt: "Photo of clearly marked research plots in field with numbered stakes and treatment labels, randomized block design visible. University agricultural research setting, scientific trial documentation style.",
    section: "Methods"
  },
  {
    filename: "healthy-soil-handful.png",
    prompt: "Close-up photo of farmer's weathered hands holding dark rich healthy soil with visible organic matter, earthworms, and root fragments. Emotional, hopeful image representing successful soil regeneration. Professional portrait photography.",
    section: "Project Outcomes"
  },
  {
    filename: "transition-guide-mockup.png",
    prompt: "Clean mockup of professional printed guidebook titled 'Desert Regenerative Agriculture Transition Guide' with soil and plant imagery on cover. Spiral bound, professional document design style.",
    section: "Project Outcomes"
  }
];

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

async function generateImage(prompt, filename) {
  try {
    console.log(`\n🎨 Generating: ${filename}`);
    console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

    // Use Gemini with image generation capability
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["image", "text"],
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Check if we got an image in the response
    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts;

      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
          // Decode base64 image data
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

async function generateAllImages() {
  console.log("");
  console.log("🌱 ═══════════════════════════════════════════════════════════════");
  console.log("   REGENERATIVE FIELD TRIAL - Image Generator (Nano Banana Pro)");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log(`📁 Output directory: ${ASSETS_DIR}`);
  console.log(`📝 Images to generate: ${IMAGE_PROMPTS.length}`);
  console.log("");

  if (API_KEY === "YOUR_API_KEY_HERE") {
    console.log("❌ ERROR: Please set your Google AI API key!");
    console.log("   export GOOGLE_AI_API_KEY='your-key-here'");
    console.log("   Or edit generate-images.js and replace YOUR_API_KEY_HERE");
    return;
  }

  let successful = 0;
  let failed = 0;

  for (const { filename, prompt, section } of IMAGE_PROMPTS) {
    console.log(`\n📌 Section: ${section}`);
    const success = await generateImage(prompt, filename);

    if (success) {
      successful++;
    } else {
      failed++;
    }

    // Rate limiting - wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n═══════════════════════════════════════════════════════════════════");
  console.log("📊 Generation Complete!");
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Images saved to: ${ASSETS_DIR}`);
  console.log("═══════════════════════════════════════════════════════════════════");
}

// Generate a single image by name
async function generateSingleImage(imageName) {
  const imageConfig = IMAGE_PROMPTS.find(p => p.filename === imageName);
  if (!imageConfig) {
    console.log(`❌ Image "${imageName}" not found in prompts list`);
    console.log(`\nAvailable images:`);
    IMAGE_PROMPTS.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.filename}`);
    });
    return;
  }

  if (API_KEY === "YOUR_API_KEY_HERE") {
    console.log("❌ ERROR: Please set your Google AI API key!");
    console.log("   export GOOGLE_AI_API_KEY='your-key-here'");
    return;
  }

  await generateImage(imageConfig.prompt, imageConfig.filename);
}

// List all available images
function listImages() {
  console.log("");
  console.log("🌱 ═══════════════════════════════════════════════════════════════");
  console.log("   AVAILABLE IMAGES TO GENERATE");
  console.log("═══════════════════════════════════════════════════════════════════");
  console.log("");

  const sections = {};
  IMAGE_PROMPTS.forEach(p => {
    if (!sections[p.section]) sections[p.section] = [];
    sections[p.section].push(p.filename);
  });

  Object.entries(sections).forEach(([section, files]) => {
    console.log(`📌 ${section}:`);
    files.forEach(f => console.log(`   • ${f}`));
    console.log("");
  });

  console.log(`Total: ${IMAGE_PROMPTS.length} images`);
  console.log("");
  console.log("Usage:");
  console.log("  npm run generate                    Generate all images");
  console.log("  npm run generate:single <filename>  Generate single image");
  console.log("═══════════════════════════════════════════════════════════════════");
}

// Run the generator
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === "--single" && args[1]) {
    generateSingleImage(args[1]);
  } else if (args[0] === "--list") {
    listImages();
  } else if (args.length === 0) {
    generateAllImages();
  } else {
    console.log("Usage:");
    console.log("  node generate-images.js           Generate all images");
    console.log("  node generate-images.js --list    List available images");
    console.log("  node generate-images.js --single <filename>  Generate one image");
  }
}

module.exports = { generateImage, generateAllImages, IMAGE_PROMPTS };
