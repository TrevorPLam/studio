#!/usr/bin/env node

/**
 * Check Expo configuration for required plugins
 *
 * This script verifies that app.json has all required Expo plugins configured,
 * particularly react-native-reanimated which is critical for worklets support.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

function checkExpoConfig() {
  console.log("🔍 Checking Expo configuration (app.json)...\n");

  try {
    // Read app.json
    const appJsonPath = join(rootDir, "app.json");
    const appJson = JSON.parse(readFileSync(appJsonPath, "utf8"));

    const plugins = appJson.expo?.plugins || [];

    // Check for react-native-reanimated plugin
    const hasReanimatedPlugin = plugins.some((plugin) => {
      if (typeof plugin === "string") {
        return plugin === "react-native-reanimated";
      } else if (Array.isArray(plugin)) {
        return plugin[0] === "react-native-reanimated";
      }
      return false;
    });

    if (!hasReanimatedPlugin) {
      console.log("❌ Missing react-native-reanimated plugin in app.json!\n");
      console.log("This plugin is required for proper worklets support.\n");
      console.log("💡 FIX: Add to app.json plugins array:\n");
      console.log("  {");
      console.log('    "expo": {');
      console.log('      "plugins": [');
      console.log('        "react-native-reanimated"  // ← Add this');
      console.log("      ]");
      console.log("    }");
      console.log("  }\n");
      console.log(
        "📖 See: docs/archive/project-management/WORKLETS_FIX_GUIDE.md for details\n",
      );
      return false;
    }

    console.log("✅ react-native-reanimated plugin: Configured");
    console.log("✅ Expo configuration: OK\n");
    return true;
  } catch (error) {
    console.error("❌ Error checking Expo configuration:", error.message);
    return false;
  }
}

console.log("📱 Expo Configuration Check\n");
console.log("=".repeat(50));
console.log("\nℹ️  Verifying required Expo plugins are configured");
console.log("=".repeat(50));
console.log();

const result = checkExpoConfig();

if (!result) {
  console.log("=".repeat(50));
  console.log("⚠️  ACTION REQUIRED: Fix app.json configuration\n");
  console.log("After fixing, rebuild your native app:");
  console.log("  npm run expo:rebuild:ios  # or :android\n");
  console.log("=".repeat(50));
}

process.exit(result ? 0 : 1);
