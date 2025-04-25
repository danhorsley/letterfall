extends RefCounted

# Dictionary of valid words (will be populated at runtime)
var valid_words = {}
var min_word_length = 3
var max_word_length = 5

func _init():
	load_dictionary()

func load_dictionary():
	# In a real implementation, you'd load from a file
	# For now, we'll use a small test set
	var test_words = ["cat", "dog", "bird", "fish", "apple", "orange"]
	
	for word in test_words:
		valid_words[word.to_lower()] = true
	
	print("Dictionary loaded with ", valid_words.size(), " words")

func find_words(board):
	var matches = []
	
	# Check horizontal words
	for row in range(board.size()):
		var potential_matches = check_line(board[row])
		for match_data in potential_matches:
			match_data.row = row
			match_data.is_horizontal = true
			matches.append(match_data)
	
	# Check vertical words
	for col in range(board[0].size()):
		var column = []
		for row in range(board.size()):
			column.append(board[row][col])
		
		var potential_matches = check_line(column)
		for match_data in potential_matches:
			match_data.col = col
			match_data.is_horizontal = false
			matches.append(match_data)
	
	return matches

func check_line(line):
	var matches = []
	
	# Check all possible substrings of appropriate length
	for start in range(line.size() - min_word_length + 1):
		for length in range(min_word_length, min(max_word_length + 1, line.size() - start + 1)):
			var substring = line.slice(start, start + length)
			var word = "".join(substring)
			
			if valid_words.has(word.to_lower()):
				var match_data = {
					"word": word,
					"start": start,
					"length": length,
					"row": -1,  # Will be filled in by caller
					"col": -1,  # Will be filled in by caller
					"is_horizontal": false  # Will be filled in by caller
				}
				matches.append(match_data)
	
	return matches
