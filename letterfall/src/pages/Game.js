import React, { useState, useEffect } from "react";
import create from "zustand";

// Sample word list - in production this would be loaded from a CSV
const WORD_LIST = new Set([
  "cat",
  "dog",
  "hat",
  "bat",
  "rat",
  "sat",
  "mat",
  "fat",
  "pat",
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
  "stare",
  "flare",
  "snare",
  "spare",
  "share",
  "scare",
]);

// Create the game store with Zustand
const useGameStore = create((set, get) => ({
  // The 10-length strips that feed the active grid
  letterStrips: Array(5)
    .fill()
    .map(() =>
      Array(10)
        .fill()
        .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))),
    ),

  // The active 5x5 grid (first 5 letters of each strip)
  activeGrid: [],

  // Currently selected letters
  selectedLetters: [],

  // Track the current selection coordinates
  selectionStart: null,
  selectionDirection: null, // 'horizontal' or 'vertical'

  // Game score
  score: 0,
  combo: 0,

  // Initialize the grid
  initializeGrid: () => {
    const strips = get().letterStrips;
    const grid = strips.map((strip) => strip.slice(0, 5));
    set({ activeGrid: grid });
  },

  // Start a new selection
  startSelection: (row, col) => {
    set({
      selectedLetters: [{ row, col, letter: get().activeGrid[row][col] }],
      selectionStart: { row, col },
      selectionDirection: null,
    });
  },

  // Update active selection
  updateSelection: (row, col) => {
    const { selectionStart, selectionDirection, activeGrid } = get();

    if (!selectionStart) return;

    // Determine or confirm selection direction
    let direction = selectionDirection;
    if (!direction) {
      if (row === selectionStart.row && col !== selectionStart.col) {
        direction = "horizontal";
      } else if (col === selectionStart.col && row !== selectionStart.row) {
        direction = "vertical";
      } else if (row === selectionStart.row && col === selectionStart.col) {
        // Still on starting position
        return;
      } else {
        // Diagonal movement - not allowed
        return;
      }
    }

    // Create new selection based on direction
    let newSelection = [];

    if (direction === "horizontal") {
      const r = selectionStart.row;
      // Handle wrapping for horizontal selection
      if (col >= selectionStart.col) {
        for (let c = selectionStart.col; c <= col; c++) {
          const wrappedCol = c % 5;
          newSelection.push({
            row: r,
            col: wrappedCol,
            letter: activeGrid[r][wrappedCol],
          });
        }
      } else {
        for (let c = selectionStart.col; c >= col; c--) {
          const wrappedCol = (c + 5) % 5;
          newSelection.push({
            row: r,
            col: wrappedCol,
            letter: activeGrid[r][wrappedCol],
          });
        }
      }
    } else if (direction === "vertical") {
      const c = selectionStart.col;
      // Handle wrapping for vertical selection
      if (row >= selectionStart.row) {
        for (let r = selectionStart.row; r <= row; r++) {
          const wrappedRow = r % 5;
          newSelection.push({
            row: wrappedRow,
            col: c,
            letter: activeGrid[wrappedRow][c],
          });
        }
      } else {
        for (let r = selectionStart.row; r >= row; r--) {
          const wrappedRow = (r + 5) % 5;
          newSelection.push({
            row: wrappedRow,
            col: c,
            letter: activeGrid[wrappedRow][c],
          });
        }
      }
    }

    set({
      selectedLetters: newSelection,
      selectionDirection: direction,
    });
  },

  // Complete selection and check if valid word
  completeSelection: () => {
    const { selectedLetters, letterStrips } = get();
    const word = selectedLetters
      .map((item) => item.letter)
      .join("")
      .toLowerCase();

    // Check if word is valid
    if (selectedLetters.length >= 2 && WORD_LIST.has(word)) {
      // Valid word found
      const points = calculatePoints(word.length);

      // Update score
      set((state) => ({
        score: state.score + points,
        combo: state.combo + 1,
      }));

      // Remove matched letters and shift in new ones
      const newStrips = [...letterStrips];

      // Group selected letters by their rows for processing
      const rowsToUpdate = new Set();
      selectedLetters.forEach((item) => rowsToUpdate.add(item.row));

      rowsToUpdate.forEach((row) => {
        const colsInThisRow = selectedLetters
          .filter((item) => item.row === row)
          .map((item) => item.col);

        // For each column in this row that has a selected letter
        colsInThisRow.forEach((col) => {
          // Shift letters in the strip
          newStrips[row].shift();
          // Generate a new letter at the end of the strip
          newStrips[row].push(
            String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          );
        });
      });

      // Update the active grid with the first 5 letters of each strip
      const newGrid = newStrips.map((strip) => strip.slice(0, 5));

      set({
        letterStrips: newStrips,
        activeGrid: newGrid,
        selectedLetters: [],
      });

      // Check for potential chain combos
      setTimeout(() => {
        get().checkForCombos();
      }, 300);

      return true;
    } else {
      // Invalid word - reset selection
      set({
        selectedLetters: [],
        selectionStart: null,
        selectionDirection: null,
        combo: 0,
      });
      return false;
    }
  },

  // Check for any automatic combos that might have formed
  checkForCombos: () => {
    // This would be more complex in a full implementation
    // For now, we'll just simulate checking for horizontals and verticals

    // Check horizontal words
    for (let row = 0; row < 5; row++) {
      const horizontalWord = get().activeGrid[row].join("").toLowerCase();
      for (let len = 5; len >= 3; len--) {
        for (let start = 0; start <= 5 - len; start++) {
          const subWord = horizontalWord.substring(start, start + len);
          if (WORD_LIST.has(subWord)) {
            console.log(`Found combo word: ${subWord}`);
            // In a real implementation, we would handle this combo
            // by selecting those letters and calling completeSelection
            break;
          }
        }
      }
    }

    // Similar checks would be done for vertical words
  },

  // Reset the game
  resetGame: () => {
    const newStrips = Array(5)
      .fill()
      .map(() =>
        Array(10)
          .fill()
          .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))),
      );

    set({
      letterStrips: newStrips,
      selectedLetters: [],
      selectionStart: null,
      selectionDirection: null,
      score: 0,
      combo: 0,
    });

    // Initialize new grid
    set((state) => ({
      activeGrid: state.letterStrips.map((strip) => strip.slice(0, 5)),
    }));
  },
}));

// Helper function to calculate points based on word length
const calculatePoints = (length) => {
  // Base points for word length
  const basePoints = {
    2: 10,
    3: 20,
    4: 40,
    5: 80,
  };

  return basePoints[length] || length * 20; // Fallback calculation
};

// Game board cell component
const Cell = ({
  letter,
  row,
  col,
  isSelected,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}) => {
  return (
    <div
      className={`w-12 h-12 flex items-center justify-center border-2 
                 ${isSelected ? "bg-blue-300 border-blue-500" : "bg-white border-gray-300"}
                 rounded-md m-1 text-xl font-bold cursor-pointer select-none`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={onMouseUp}
    >
      {letter}
    </div>
  );
};

// Main game component
const WordGame = () => {
  const {
    activeGrid,
    selectedLetters,
    score,
    combo,
    initializeGrid,
    startSelection,
    updateSelection,
    completeSelection,
    resetGame,
  } = useGameStore();

  const [isDragging, setIsDragging] = useState(false);

  // Initialize the grid on component mount
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // Check if a cell is in the current selection
  const isCellSelected = (row, col) => {
    return selectedLetters.some((item) => item.row === row && item.col === col);
  };

  // Handle mouse down on a cell
  const handleMouseDown = (row, col) => {
    setIsDragging(true);
    startSelection(row, col);
  };

  // Handle mouse enter on a cell during drag
  const handleMouseEnter = (row, col) => {
    if (isDragging) {
      updateSelection(row, col);
    }
  };

  // Handle mouse up to complete selection
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      completeSelection();
    }
  };

  // Handle mouse leaving the game area
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      // Optional: could auto-complete the selection here or just cancel it
    }
  };

  // Create a visual representation of the word being formed
  const currentWord = selectedLetters.map((item) => item.letter).join("");

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Word Grid Game</h1>

      <div className="mb-4">
        <div className="flex items-center justify-between w-full">
          <div className="text-xl">Score: {score}</div>
          <div className="text-xl">Combo: {combo}x</div>
        </div>
        <div className="h-8 bg-gray-100 rounded p-1 min-w-64 text-center">
          {currentWord}
        </div>
      </div>

      <div
        className="grid grid-cols-5 gap-1 p-2 bg-gray-100 rounded-lg"
        onMouseLeave={handleMouseLeave}
      >
        {activeGrid.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              letter={letter}
              row={rowIndex}
              col={colIndex}
              isSelected={isCellSelected(rowIndex, colIndex)}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseUp={handleMouseUp}
            />
          )),
        )}
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
          <li>
            Drag horizontally or vertically to select letters and form words
          </li>
          <li>Words must be at least 2 letters long</li>
          <li>
            When you match a word, those letters disappear and new ones appear
          </li>
          <li>
            The grid wraps around, so you can continue selections from one edge
            to another
          </li>
          <li>Longer words and combos give more points!</li>
        </ul>
      </div>
    </div>
  );
};

export default WordGame;
