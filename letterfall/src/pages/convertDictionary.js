// Save this as convertDictionary.js
// Run with: node convertDictionary.js input.txt output.json

const fs = require("fs");
const path = require("path");

// Get command line arguments
const inputFile = process.argv[2];
const outputFile = process.argv[3] || "dictionary.json";

if (!inputFile) {
  console.error("Please provide an input file path");
  process.exit(1);
}

console.log(`Converting dictionary from ${inputFile} to ${outputFile}`);

// Read the input file
try {
  const data = fs.readFileSync(inputFile, "utf8");
  const words = data
    .split("\n")
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0 && word.length <= 5); // Filter for words of length 5 or less

  console.log(`Found ${words.length} valid words`);

  // Option 1: Save as JSON array
  fs.writeFileSync(outputFile, JSON.stringify(words));
  console.log(`Saved dictionary as JSON to ${outputFile}`);

  // Option 2: Save as optimized lookup object (by word length and prefix)
  const optimizedDict = {};

  // Group by word length
  for (const word of words) {
    const len = word.length;
    if (!optimizedDict[len]) {
      optimizedDict[len] = {};
    }

    // Group by first letter for faster lookups
    const firstLetter = word.charAt(0);
    if (!optimizedDict[len][firstLetter]) {
      optimizedDict[len][firstLetter] = [];
    }

    optimizedDict[len][firstLetter].push(word);
  }

  const optimizedOutput = outputFile.replace(".json", ".optimized.json");
  fs.writeFileSync(optimizedOutput, JSON.stringify(optimizedDict));
  console.log(`Saved optimized dictionary to ${optimizedOutput}`);
} catch (err) {
  console.error("Error processing dictionary:", err);
  process.exit(1);
}
