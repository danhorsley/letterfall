extends RefCounted

# Letter frequency weights (English)
const LETTER_WEIGHTS = {
	"A": 8.2, "B": 1.5, "C": 2.8, "D": 4.3, "E": 12.7,
	"F": 2.2, "G": 2.0, "H": 6.1, "I": 7.0, "J": 0.2,
	"K": 0.8, "L": 4.0, "M": 2.4, "N": 6.7, "O": 7.5,
	"P": 1.9, "Q": 0.1, "R": 6.0, "S": 6.3, "T": 9.1,
	"U": 2.8, "V": 1.0, "W": 2.4, "X": 0.2, "Y": 2.0,
	"Z": 0.1
}

# Cache the letter pool
var letter_pool = []

func _init():
	initialize_letter_pool()

func initialize_letter_pool():
	letter_pool = []
	
	# Create a weighted pool of letters
	for letter in LETTER_WEIGHTS:
		var weight = int(LETTER_WEIGHTS[letter] * 10)  # Scale up for precision
		for i in range(weight):
			letter_pool.append(letter)

func get_random_letter():
	if letter_pool.size() == 0:
		initialize_letter_pool()
	
	var index = randi() % letter_pool.size()
	return letter_pool[index]

func generate_strips(count, length):
	var strips = []
	
	for i in range(count):
		var strip = []
		for j in range(length):
			strip.append(get_random_letter())
		strips.append(strip)
	
	return strips

func shift_strip(strip, amount):
	# Handle negative shifts (left/up)
	var effective_amount = amount % strip.size()
	if effective_amount < 0:
		effective_amount += strip.size()
	
	# Shift the strip
	for i in range(effective_amount):
		var temp = strip.pop_back()
		strip.push_front(temp)

func get_strip_position(strip):
	# For now, always use the first 5 positions
	# This could be enhanced to track the actual position
	return 0

func check_for_cross_matches(matches):
	# Identify if we have matches that cross (useful for cascade logic)
	var horizontal_matches = {}
	var vertical_matches = {}
	
	for match_data in matches:
		if match_data.is_horizontal:
			for i in range(match_data.length):
				var pos = Vector2(match_data.start + i, match_data.row)
				horizontal_matches[pos] = true
		else:
			for i in range(match_data.length):
				var pos = Vector2(match_data.col, match_data.start + i)
				vertical_matches[pos] = true
	
	# Find intersections
	var intersections = []
	for pos in horizontal_matches.keys():
		if vertical_matches.has(pos):
			intersections.append(pos)
	
	return intersections
