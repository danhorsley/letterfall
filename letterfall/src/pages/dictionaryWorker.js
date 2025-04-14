// This is a Web Worker file that loads and processes the dictionary in a separate thread

self.onmessage = async function (e) {
  if (e.data.type === "load") {
    try {
      const wordSet = await loadDictionary(e.data.path);
      self.postMessage({ type: "loaded", words: Array.from(wordSet) });
    } catch (error) {
      self.postMessage({ type: "error", message: error.message });
    }
  }
};

async function loadDictionary(path) {
  const wordSet = new Set();

  try {
    const response = await fetch(path);
    const text = await response.text();

    // Split text by newlines and process each word
    const words = text.split("\n");

    // Process in chunks to stay responsive
    const chunkSize = 1000;
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize);

      for (const word of chunk) {
        const trimmed = word.trim();
        if (trimmed) {
          wordSet.add(trimmed.toLowerCase());
        }
      }

      // Optional: report progress
      if (i % 5000 === 0) {
        self.postMessage({
          type: "progress",
          processed: i,
          total: words.length,
        });
      }
    }

    return wordSet;
  } catch (error) {
    throw new Error(`Failed to load dictionary: ${error.message}`);
  }
}
