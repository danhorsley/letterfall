// Import Papa Parse if you're loading from CSV
import Papa from "papaparse";

class WordDictionary {
  constructor() {
    this.words = new Set();
    this.isLoading = false;
    this.isLoaded = false;
  }

  // Check if a word exists in our dictionary
  isValidWord(word) {
    return this.words.has(word.toLowerCase());
  }

  // Load dictionary from a CSV file
  async loadFromCSV(csvPath) {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    try {
      const response = await fetch(csvPath);
      const csvText = await response.text();

      Papa.parse(csvText, {
        complete: (results) => {
          // Assuming CSV has one word per row in the first column
          results.data.forEach((row) => {
            if (row[0] && typeof row[0] === "string") {
              this.words.add(row[0].toLowerCase());
            }
          });

          this.isLoaded = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          this.isLoading = false;
        },
      });
    } catch (error) {
      console.error("Error loading dictionary:", error);
      this.isLoading = false;
    }
  }

  // Alternative: Load dictionary from a plain text file (one word per line)
  async loadFromTxt(txtPath) {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    try {
      const response = await fetch(txtPath);
      const text = await response.text();

      // Split by newlines and add each word to the Set
      text.split("\n").forEach((word) => {
        const trimmed = word.trim();
        if (trimmed) {
          this.words.add(trimmed.toLowerCase());
        }
      });

      this.isLoaded = true;
      this.isLoading = false;
    } catch (error) {
      console.error("Error loading dictionary:", error);
      this.isLoading = false;
    }
  }

  // Load dictionary from a JSON array
  async loadFromJSON(jsonPath) {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    try {
      const response = await fetch(jsonPath);
      const data = await response.json();

      // Handle optimized dictionary format
      Object.values(data).forEach(letterGroups => {
        Object.values(letterGroups).forEach(words => {
          words.forEach(word => {
            if (typeof word === "string") {
              this.words.add(word.toLowerCase());
            }
          });
        });
      });

      this.isLoaded = true;
      this.isLoading = false;
    } catch (error) {
      console.error("Error loading dictionary:", error);
      this.isLoading = false;
    }
  }

  // For very large dictionaries, you might want to chunk the processing
  // to avoid blocking the UI thread
  async loadFromLargeText(txtPath) {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    try {
      const response = await fetch(txtPath);
      const text = await response.text();
      const words = text.split("\n");

      // Process in chunks of 1000 words
      const chunkSize = 1000;
      const totalChunks = Math.ceil(words.length / chunkSize);

      for (let i = 0; i < totalChunks; i++) {
        // Use setTimeout to yield to the browser between chunks
        await new Promise((resolve) => {
          setTimeout(() => {
            const startIdx = i * chunkSize;
            const endIdx = Math.min(startIdx + chunkSize, words.length);

            for (let j = startIdx; j < endIdx; j++) {
              const trimmed = words[j].trim();
              if (trimmed) {
                this.words.add(trimmed.toLowerCase());
              }
            }

            resolve();
          }, 0);
        });
      }

      this.isLoaded = true;
      this.isLoading = false;
    } catch (error) {
      console.error("Error loading dictionary:", error);
      this.isLoading = false;
    }
  }

  // For really huge dictionaries, consider using a Web Worker
  // This is a simplified example - you'd need to implement the worker separately
  loadWithWorker(path) {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;

    const worker = new Worker("/dictionaryWorker.js");

    worker.onmessage = (e) => {
      if (e.data.type === "loaded") {
        this.words = new Set(e.data.words);
        this.isLoaded = true;
        this.isLoading = false;
      }
    };

    worker.postMessage({ type: "load", path });
  }
}

// Create and export a singleton instance
const dictionary = new WordDictionary();
export default dictionary;
