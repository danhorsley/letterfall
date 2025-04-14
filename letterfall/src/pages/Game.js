import React, { useState, useEffect } from "react";
import { create } from "zustand";
import dictionary from "./wordDictionary";
import { getRandomLetter, generateLetterGrid } from "./letterFrequency";

// Helper function to calculate points based on word length
const calculateWordPoints = (length) => {
  const pointValues = {
    3: 30, // 3-letter words: 30 points
    4: 60, // 4-letter words: 60 points
    5: 100, // 5-letter words: 100 points
  };

  return pointValues[length] || length * 20; // Fallback calculation
};
// Add a component to display the word history
const WordHistory = ({ words }) => {
  return (
    <div className="w-48 ml-4 p-2 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Words Found</h3>
      {words.length === 0 ? (
        <p className="text-gray-500 text-sm">No words found yet</p>
      ) : (
        <ul className="max-h-64 overflow-y-auto">
          {words.map((item, index) => (
            <li key={index} className="flex justify-between text-sm mb-1">
              <span className="font-medium">{item.word}</span>
              <span className="text-green-600">+{item.points}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
// Create the game store with Zustand
const useGameStore = create((set, get) => ({
  // The 10-length strips that form our letter loops - now with better letter distribution
  letterStrips: generateLetterGrid(5, 10),

  // Vertical strips (columns) - also with better letter distribution
  letterColumns: generateLetterGrid(5, 10),

  // Current positions for rendering the visible parts of each strip/column
  rowPositions: Array(5).fill(0),
  colPositions: Array(5).fill(0),

  // Currently selected word
  selectedWord: [],
  highlightedWords: [],

  // Dictionary loading state
  dictionaryLoaded: false,

  // Game score
  score: 0,

  // Load dictionary
  loadDictionary: async () => {
    try {
      // Try to load the dictionary or fall back to sample words
      await dictionary.loadFromJSON("/dictionary.json");
      set({ dictionaryLoaded: true });
      get().findWords();
    } catch (error) {
      console.error("Failed to load dictionary:", error);
      // Fallback to sample words
      dictionary.loadSampleWords();
      set({ dictionaryLoaded: true });
      get().findWords();
    }
  },

  // Shift a row left or right
  shiftRow: (rowIndex, direction) => {
    set((state) => {
      const newPositions = [...state.rowPositions];
      if (direction === "left") {
        newPositions[rowIndex] = (newPositions[rowIndex] + 1) % 10;
      } else {
        newPositions[rowIndex] = (newPositions[rowIndex] + 9) % 10; // -1 mod 10
      }
      return { rowPositions: newPositions };
    });
    get().findWords();
  },

  // Shift a column up or down
  shiftColumn: (colIndex, direction) => {
    set((state) => {
      const newPositions = [...state.colPositions];
      if (direction === "up") {
        newPositions[colIndex] = (newPositions[colIndex] + 1) % 10;
      } else {
        newPositions[colIndex] = (newPositions[colIndex] + 9) % 10; // -1 mod 10
      }
      return { colPositions: newPositions };
    });
    get().findWords();
  },

  // Get the current active grid based on positions
  getActiveGrid: () => {
    const { letterStrips, letterColumns, rowPositions, colPositions } = get();
    const grid = Array(5)
      .fill()
      .map(() => Array(5).fill(""));

    // Fill in the grid based on the current row positions
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        // For simplicity in this prototype, we'll use the row strips as the primary source
        // In a more advanced version, we would reconcile row and column positions
        const stripPos = (rowPositions[r] + c) % 10;
        grid[r][c] = letterStrips[r][stripPos];
      }
    }

    return grid;
  },

  // Select a word from the grid
  selectWord: (cells) => {
    set({ selectedWord: cells });
  },

  // Confirm word selection and process it
  confirmWordSelection: () => {
    const { selectedWord, letterStrips, rowPositions, score } = get();
    if (selectedWord.length < 3) {
      // Clear selection if fewer than 3 letters
      set({ selectedWord: [] });
      return false;
    }

    const word = selectedWord.map(cell => cell.letter).join('').toLowerCase();

    if (dictionary.isValidWord(word)) {
      // Process the confirmed word
      processMatchedWord(selectedWord);
      return true;
    }

    // If not a valid word, just clear selection
    set({ selectedWord: [] });
    return false;
  },

  // New helper function to process matched words and check for cascades
  processMatchedWord: (matchedWord) => {
    const { letterStrips, rowPositions, score } = get();

    // Calculate points based on word length
    const points = calculateWordPoints(matchedWord.length);

    // Clone the strips to update
    const newStrips = JSON.parse(JSON.stringify(letterStrips));

    // Group selected cells by row to handle replacements
    const cellsByRow = {};
    matchedWord.forEach(cell => {
      if (!cellsByRow[cell.row]) cellsByRow[cell.row] = [];
      cellsByRow[cell.row].push(cell);
    });

    // Process each row with selected cells
    Object.entries(cellsByRow).forEach(([rowIdx, cells]) => {
      const row = parseInt(rowIdx);

      // Sort cells by actual position in the strip
      cells.sort((a, b) => {
        const posA = (rowPositions[row] + a.col) % 10;
        const posB = (rowPositions[row] + b.col) % 10;
        return posA - posB;
      });

      // Remove letters and replace with new ones
      cells.forEach(cell => {
        const stripPos = (rowPositions[row] + cell.col) % 10;

        // Shift all letters after this position one position forward
        for (let i = stripPos; i < 9; i++) {
          newStrips[row][i] = newStrips[row][i + 1];
        }

        // Add new random letter at the end
        newStrips[row][9] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      });
    });

    // Update state with new strips and score
    set(state => ({
      letterStrips: newStrips,
      score: state.score + points,
      selectedWord: [],
    }));

    // Check for new words that might have formed after a short delay
    setTimeout(() => {
      // Find new words with the updated grid
      get().findWords();

      // Get the new highlighted words
      const newHighlightedWords = get().highlightedWords;

      // If new words were found, trigger cascade effect
      if (newHighlightedWords.length > 0) {
        // Sort words by length (descending) to prioritize longer words
        newHighlightedWords.sort((a, b) => b.word.length - a.word.length);

        // Select the longest word for automatic processing
        const bestWord = newHighlightedWords[0];

        // Visual feedback - briefly highlight the word before processing it
        set({ selectedWord: bestWord.cells });

        // Process this word after a short delay for visual feedback
        setTimeout(() => {
          get().processMatchedWord(bestWord.cells);
        }, 500);
      }
    }, 300);
  },

  // Find possible words in the current grid
  findWords: () => {
    if (!get().dictionaryLoaded) return;

    const grid = get().getActiveGrid();
    const words = [];

    // Check horizontal words - now starting at length 3
    for (let r = 0; r < 5; r++) {
      // For each possible word length (3-5)
      for (let len = 3; len <= 5; len++) {
        // Check each possible starting position
        for (let start = 0; start <= 5 - len; start++) {
          const wordCells = Array.from({ length: len }, (_, i) => ({
            row: r,
            col: start + i,
            letter: grid[r][start + i],
          }));

          const word = wordCells
            .map((cell) => cell.letter)
            .join("")
            .toLowerCase();

          if (dictionary.isValidWord(word)) {
            words.push({
              word,
              cells: wordCells,
            });
          }
        }
      }
    }

    // Check vertical words - now starting at length 3
    for (let c = 0; c < 5; c++) {
      // For each possible word length (3-5)
      for (let len = 3; len <= 5; len++) {
        // Check each possible starting position
        for (let start = 0; start <= 5 - len; start++) {
          const wordCells = Array.from({ length: len }, (_, i) => ({
            row: start + i,
            col: c,
            letter: grid[start + i][c],
          }));

          const word = wordCells
            .map((cell) => cell.letter)
            .join("")
            .toLowerCase();

          if (dictionary.isValidWord(word)) {
            words.push({
              word,
              cells: wordCells,
            });
          }
        }
      }
    }

    set({ highlightedWords: words });
  },

  // Reset the game
  resetGame: () => {
    // Generate new letter strips with improved distribution
    const newStrips = generateLetterGrid(5, 10);
    const newColumns = generateLetterGrid(5, 10);

    set({
      letterStrips: newStrips,
      letterColumns: newColumns,
      rowPositions: Array(5).fill(0),
      colPositions: Array(5).fill(0),
      selectedWord: [],
      highlightedWords: [],
      score: 0,
    });

    // Look for words in the initial grid
    setTimeout(() => get().findWords(), 100);
  },
}));

// Cell component to render each letter in the grid
const Cell = ({ letter, isSelected, isHighlighted, onClick }) => {
  // Highlight vowels with a subtle background color when not selected or highlighted
  const isVowel = /[AEIOU]/.test(letter);
  const baseStyle =
    isVowel && !isSelected && !isHighlighted ? "bg-yellow-50" : "bg-white";

  return (
    <div
      className={`w-12 h-12 flex items-center justify-center border-2 
        ${
          isSelected
            ? "bg-blue-400 text-white"
            : isHighlighted
              ? "bg-green-200"
              : baseStyle
        } 
        border-gray-300 rounded-md m-1 text-xl font-bold cursor-pointer`}
      onClick={onClick}
    >
      {letter}
    </div>
  );
};

// Row control for shifting rows
const RowControl = ({ rowIndex, onShift }) => {
  return (
    <div className="flex justify-between items-center w-full mb-1">
      <button
        className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
        onClick={() => onShift(rowIndex, "left")}
      >
        ←
      </button>
      <div className="text-xs text-gray-500">Row {rowIndex + 1}</div>
      <button
        className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
        onClick={() => onShift(rowIndex, "right")}
      >
        →
      </button>
    </div>
  );
};

// Column control for shifting columns
const ColumnControl = ({ colIndex, onShift }) => {
  return (
    <div className="flex flex-col items-center h-full mx-1">
      <button
        className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
        onClick={() => onShift(colIndex, "up")}
      >
        ↑
      </button>
      <div className="text-xs text-gray-500 my-1">Col {colIndex + 1}</div>
      <button
        className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
        onClick={() => onShift(colIndex, "down")}
      >
        ↓
      </button>
    </div>
  );
};

// Main game component
const LetterFallGame = () => {
  const {
    getActiveGrid,
    shiftRow,
    shiftColumn,
    selectedWord,
    highlightedWords,
    selectWord,
    confirmWordSelection,
    resetGame,
    loadDictionary,
    dictionaryLoaded,
    score,
  } = useGameStore();

  const [loading, setLoading] = useState(true);

  // Start a new game on mount and load dictionary
  useEffect(() => {
    const initialize = async () => {
      await loadDictionary();
      resetGame();
      setLoading(false);
    };

    initialize();
  }, [loadDictionary, resetGame]);

  const grid = getActiveGrid();

  // Check if a cell is in the current selection
  const isCellSelected = (row, col) => {
    return selectedWord.some((cell) => cell.row === row && cell.col === col);
  };

  // Check if a cell is part of any highlighted word
  const isCellHighlighted = (row, col) => {
    if (selectedWord.length > 0) return false; // Don't show highlights during selection

    return highlightedWords.some((wordObj) =>
      wordObj.cells.some((cell) => cell.row === row && cell.col === col),
    );
  };

  const handleCellClick = (row, col) => {
    if (selectedWord.length === 0) {
      // Find all highlighted words that contain this cell
      const highlightedCellsAtPosition = highlightedWords.filter(wordObj => 
        wordObj.cells.some(cell => cell.row === row && cell.col === col)
      );

      if (highlightedCellsAtPosition.length > 0) {
        // Sort by word length (descending) to prioritize longer words
        highlightedCellsAtPosition.sort((a, b) => b.word.length - a.word.length);

        // Select the longest word at this position
        selectWord(highlightedCellsAtPosition[0].cells);
      }
    } else {
      // Selection is already active, attempt to confirm it
      confirmWordSelection();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading word dictionary...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">LetterFall Game</h1>

      <div className="mb-4">
        <div className="text-xl">Score: {score}</div>
        {selectedWord.length > 0 && (
          <div className="h-8 bg-gray-100 rounded p-1 min-w-64 text-center">
            Selected: {selectedWord.map((cell) => cell.letter).join("")}
            <button
              className="ml-2 px-2 py-0 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              onClick={confirmWordSelection}
            >
              Confirm
            </button>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Column controls */}
        <div className="flex mt-10">
          {Array(5)
            .fill()
            .map((_, colIndex) => (
              <ColumnControl
                key={`col-${colIndex}`}
                colIndex={colIndex}
                onShift={shiftColumn}
              />
            ))}
        </div>
      </div>

      <div className="flex">
        {/* Row controls and grid */}
        <div className="flex flex-col">
          {Array(5)
            .fill()
            .map((_, rowIndex) => (
              <RowControl
                key={`row-${rowIndex}`}
                rowIndex={rowIndex}
                onShift={shiftRow}
              />
            ))}
        </div>

        <div className="grid grid-cols-5 gap-1 p-2 bg-gray-100 rounded-lg">
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                letter={letter}
                isSelected={isCellSelected(rowIndex, colIndex)}
                isHighlighted={isCellHighlighted(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              />
            )),
          )}
        </div>
      </div>

      <div className="mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={resetGame}
        >
          New Game
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg max-w-md">
        <h2 className="text-lg font-bold mb-2">How to Play:</h2>
        <ul className="list-disc pl-5">
          <li>Shift rows and columns using the arrow buttons</li>
          <li>Look for words that form horizontally or vertically</li>
          <li>Words must be at least 3 letters long</li>
          <li>Click on a highlighted word to select it</li>
          <li>Confirm selection to remove letters and score points</li>
          <li>
            Removed letters are replaced with new ones at the end of each row
          </li>
          <li>
            Longer words are worth more points:
            <ul className="list-disc pl-5 mt-1">
              <li>3-letter words: 30 points</li>
              <li>4-letter words: 60 points</li>
              <li>5-letter words: 100 points</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LetterFallGame;
