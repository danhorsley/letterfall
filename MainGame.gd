extends Node2D

# Configuration
const GRID_SIZE = 5
const STRIP_LENGTH = 10
const MIN_WORD_LENGTH = 3
const MAX_WORD_LENGTH = 5

# Game state
var score = 0
var chain_counter = 0
var is_cascade_active = false

# Core data structures
var horizontal_strips = []  # 5 strips of 10 letters each
var vertical_strips = []    # 5 strips of 10 letters each
var board = []             # 5x5 visible grid

# References
@onready var board_node = $Board
@onready var score_label = $UI/ScoreLabel
@onready var chain_counter_label = $UI/ChainCounter

# Preload needed resources
var word_checker = preload("res://WordChecker.gd").new()
var utils = preload("res://Utils.gd").new()

func _ready():
	initialize_game()
	
func initialize_game():
	# Initialize the strips with weighted random letters
	horizontal_strips = utils.generate_strips(GRID_SIZE, STRIP_LENGTH)
	vertical_strips = utils.generate_strips(GRID_SIZE, STRIP_LENGTH)
	
	# Derive the initial board from strips
	update_board_from_strips()
	
	# Initialize the visual board
	board_node.initialize(self)
	
	# Check for initial matches
	check_for_matches()
	
	# Update UI
	update_ui()

func update_board_from_strips():
	# Reset the board
	board = []
	
	# Fill the board based on strip intersections
	for row in range(GRID_SIZE):
		var board_row = []
		for col in range(GRID_SIZE):
			# Get letter at intersection of horizontal and vertical strips
			var h_index = row
			var v_index = col
			var h_pos = utils.get_strip_position(horizontal_strips[h_index])
			var v_pos = utils.get_strip_position(vertical_strips[v_index])
			
			var letter = horizontal_strips[h_index][h_pos]
			board_row.append(letter)
		board.append(board_row)
	
	# Update visual representation
	board_node.update_visuals(board)

func shift_horizontal_strip(strip_index, amount):
	utils.shift_strip(horizontal_strips[strip_index], amount)
	update_board_from_strips()
	check_for_matches()

func shift_vertical_strip(strip_index, amount):
	utils.shift_strip(vertical_strips[strip_index], amount)
	update_board_from_strips()
	check_for_matches()

func check_for_matches():
	var matches = word_checker.find_words(board)
	if matches.size() > 0:
		handle_matches(matches)

func handle_matches(matches):
	# Score calculation
	var points = calculate_points(matches)
	score += points
	
	# Update chain counter
	chain_counter += 1
	
	# Remove matched letters and refill
	for match_data in matches:
		remove_matched_letters(match_data)
	
	# Refill the board
	refill_board()
	
	# Check for cascading matches
	check_for_cascade()
	
	# Update UI
	update_ui()

func remove_matched_letters(match_data):
	# Implementation depends on how match_data is structured
	pass

func refill_board():
	# Logic to refill strips with new letters
	pass

func check_for_cascade():
	# Check if new matches formed after refilling
	# If so, trigger another round of matching
	pass

func calculate_points(matches):
	# Calculate points based on word length, chain counter, etc.
	var total_points = 0
	for match_data in matches:
		var word_length = match_data.word.length()
		var base_points = word_length * 10
		var chain_multiplier = max(1, chain_counter)
		
		total_points += base_points * chain_multiplier
	
	return total_points

func update_ui():
	score_label.text = "Score: " + str(score)
	chain_counter_label.text = "Chain: " + str(chain_counter)
