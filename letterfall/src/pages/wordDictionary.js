// Import Papa Parse if you're loading from CSV
import Papa from "papaparse";

// wordDictionary.js with minimum word length

class WordDictionary {
  constructor(minLength = 3, maxLength = 5) {
    this.words = new Set();
    this.isLoading = false;
    this.isLoaded = false;
    this.minLength = minLength;
    this.maxLength = maxLength;
  }

  // Check if a word exists in our dictionary and meets length requirements
  isValidWord(word) {
    const normalizedWord = word.toLowerCase();
    return (
      normalizedWord.length >= this.minLength &&
      normalizedWord.length <= this.maxLength &&
      this.words.has(normalizedWord)
    );
  }

  // Load dictionary from a text file
  async loadFromTxt(txtPath) {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    try {
      const response = await fetch(txtPath);
      const text = await response.text();

      // Split by newlines and add each word to the Set
      // Only include words that meet our length criteria
      text.split("\n").forEach((word) => {
        const trimmed = word.trim().toLowerCase();
        if (
          trimmed &&
          trimmed.length >= this.minLength &&
          trimmed.length <= this.maxLength
        ) {
          this.words.add(trimmed);
        }
      });

      this.isLoaded = true;
      this.isLoading = false;

      console.log(
        `Dictionary loaded with ${this.words.size} words (${this.minLength}-${this.maxLength} letters)`,
      );
    } catch (error) {
      console.error("Error loading dictionary:", error);
      this.isLoading = false;
    }
  }

  // Other loading methods would also need the length filter...

  // For testing/development, we can add a sample dictionary directly
  loadSampleWords() {
    this.isLoading = true;

    // Sample 3-5 letter words
    const sampleWords = [
      // 3-letter words
      "cat",
      "dog",
      "hat",
      "bat",
      "rat",
      "sat",
      "mat",
      "fat",
      "pat",
      "run",
      "sun",
      "fun",
      "bun",
      "gun",
      "hut",
      "cut",
      "nut",
      "but",
      "rip",
      "sip",
      "tip",
      "lip",
      "hip",
      "dip",
      "nip",
      "zip",
      "pip",

      // 4-letter words
      "cake",
      "make",
      "take",
      "lake",
      "fake",
      "sake",
      "wake",
      "bake",
      "time",
      "lime",
      "dime",
      "mime",
      "rime",
      "chime",
      "grime",
      "prime",
      "fish",
      "dish",
      "wish",
      "risk",
      "disk",
      "mask",
      "task",
      "dusk",

      // 5-letter words
      "stare",
      "flare",
      "snare",
      "spare",
      "share",
      "scare",
      "glare",
      "place",
      "trace",
      "grace",
      "brace",
      "space",
      "plane",
      "flame",
      "house",
      "mouse",
      "louse",
      "greet",
      "sheet",
      "sweet",
      "fleet",
    ];

    sampleWords.forEach((word) => {
      if (word.length >= this.minLength && word.length <= this.maxLength) {
        this.words.add(word.toLowerCase());
      }
    });

    this.isLoaded = true;
    this.isLoading = false;

    console.log(`Sample dictionary loaded with ${this.words.size} words`);
  }
}

// Create and export a singleton instance with minimum length of 3
const dictionary = new WordDictionary(3, 5);
export default dictionary;
