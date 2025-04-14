// Letter frequency utility for the LetterFall game
// Based on common English letter frequencies, but adjusted to ensure playability

// Letter distribution for English with slight adjustments to favor vowels
const letterFrequencies = {
  // Vowels (increased frequencies to ensure better gameplay)
  A: 8.5, // Standard ~8.2%
  E: 12.5, // Standard ~12%
  I: 7.5, // Standard ~7%
  O: 8.0, // Standard ~7.5%
  U: 3.0, // Standard ~2.8%

  // Common consonants
  R: 6.0, // Standard ~6%
  T: 6.0, // Standard ~9% (reduced to balance vowels)
  N: 6.0, // Standard ~6.7%
  S: 5.5, // Standard ~6.3%
  L: 4.0, // Standard ~4%
  C: 3.0, // Standard ~2.8%
  D: 3.5, // Standard ~4.3%
  P: 2.0, // Standard ~1.9%
  M: 2.5, // Standard ~2.5%
  H: 4.0, // Standard ~6% (reduced to balance)

  // Medium frequency consonants
  G: 2.0, // Standard ~2%
  B: 1.5, // Standard ~1.5%
  F: 2.0, // Standard ~2.2%
  Y: 1.5, // Standard ~2%
  W: 1.5, // Standard ~2.4%
  K: 1.5, // Standard ~0.8% (increased slightly)
  V: 1.0, // Standard ~1%

  // Less common consonants
  X: 0.5, // Standard ~0.15% (increased slightly for gameplay)
  Z: 0.5, // Standard ~0.07% (increased slightly for gameplay)
  J: 0.5, // Standard ~0.15%
  Q: 0.3, // Standard ~0.1%
};

// Calculate total weight for normalization
const totalWeight = Object.values(letterFrequencies).reduce(
  (sum, weight) => sum + weight,
  0,
);

// Generate a random weighted letter based on the frequency distribution
function getRandomLetter() {
  // Generate a random number between 0 and the total weight
  const randomNum = Math.random() * totalWeight;

  // Determine which letter this random number corresponds to
  let weightSum = 0;
  for (const [letter, weight] of Object.entries(letterFrequencies)) {
    weightSum += weight;
    if (randomNum <= weightSum) {
      return letter;
    }
  }

  // Fallback (should never reach here)
  return "E";
}

// Generate a row of letters with good distribution
function generateLetterRow(length = 10) {
  return Array(length)
    .fill()
    .map(() => getRandomLetter());
}

// Generate a grid of letters with good distribution
function generateLetterGrid(rows = 5, cols = 10) {
  return Array(rows)
    .fill()
    .map(() => generateLetterRow(cols));
}

export { getRandomLetter, generateLetterRow, generateLetterGrid };
