// wordDictionary.js with proper word handling

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
    const normalizedWord = word.toLowerCase().trim();
    return (
      normalizedWord.length >= this.minLength &&
      normalizedWord.length <= this.maxLength &&
      this.words.has(normalizedWord)
    );
  }

  // Load dictionary from a JSON file (array format)
  async loadFromJSON(jsonPath) {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    try {
      const response = await fetch(jsonPath);
      const wordArray = await response.json();

      // Add each word to the Set if it meets length requirements
      wordArray.forEach((word) => {
        if (typeof word === "string") {
          // Clean up the word - remove tabs and numbers
          const cleanWord = word.split("\t")[0].toLowerCase().trim();
          if (
            cleanWord &&
            cleanWord.length >= this.minLength &&
            cleanWord.length <= this.maxLength
          ) {
            this.words.add(cleanWord);
          }
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

      // Fallback to sample dictionary if loading fails
      this.loadSampleWords();
    }
  }

  // Load sample words for testing
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
      "the",
      "and",
      "for",
      "you",
      "can",
      "has",
      "was",
      "are",
      "this",
      "that",
      "will",
      "have",
      "from",

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
      "chime",
      "fish",
      "dish",
      "wish",
      "risk",
      "disk",
      "mask",
      "task",
      "dusk",
      "home",
      "some",
      "come",
      "love",
      "hate",
      "gate",
      "fate",
      "date",
      "late",
      "mate",
      "rate",

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
      "brain",
      "train",
      "grain",
      "drain",
      "chain",
      "plain",
      "slain",
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
