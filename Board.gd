extends Node2D

# Constants
const TILE_SCENE = preload("res://Tile.tscn")
const TILE_SIZE = 64  # Size in pixels
const DRAG_THRESHOLD = 10  # Minimum drag distance to register movement

# References
var main_game = null
var tiles = []  # 2D array of tile nodes

# Dragging state
var is_dragging = false
var drag_start_position = Vector2.ZERO
var current_drag_type = ""  # "row" or "column"
var drag_index = -1  # Which row or column is being dragged
var drag_offset = 0  # How far the drag has moved

func initialize(game_reference):
	main_game = game_reference
	create_tiles()

func create_tiles():
	# Clear any existing tiles
	for row in tiles:
		for tile in row:
			tile.queue_free()
	
	tiles = []
	
	# Create new tiles
	for row in range(main_game.GRID_SIZE):
		var tile_row = []
		for col in range(main_game.GRID_SIZE):
			var tile = TILE_SCENE.instantiate()
			tile.position = Vector2(col * TILE_SIZE, row * TILE_SIZE)
			add_child(tile)
			tile_row.append(tile)
		tiles.append(tile_row)
	
	# Update visuals
	update_visuals(main_game.board)

func update_visuals(board_data):
	for row in range(main_game.GRID_SIZE):
		for col in range(main_game.GRID_SIZE):
			tiles[row][col].set_letter(board_data[row][col])

func _input(event):
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				# Start dragging
				drag_start_position = event.position
				is_dragging = true
				identify_drag_type(drag_start_position)
			else:
				# End dragging and apply changes
				if is_dragging:
					apply_drag()
					reset_drag_state()
	
	elif event is InputEventMouseMotion and is_dragging:
		# Update drag position
		update_drag(event.position)

func identify_drag_type(position):
	# Convert global position to local
	var local_pos = to_local(position)
	
	# Determine if user is dragging a row or column
	var row = int(local_pos.y / TILE_SIZE)
	var col = int(local_pos.x / TILE_SIZE)
	
	if row >= 0 and row < main_game.GRID_SIZE and col >= 0 and col < main_game.GRID_SIZE:
		# Store which row/column is being dragged
		# For now, default to row dragging
		current_drag_type = "row"
		drag_index = row
		# Logic to determine row vs column could be refined

func update_drag(position):
	var local_pos = to_local(position)
	var drag_delta = Vector2.ZERO
	
	if current_drag_type == "row":
		drag_delta.x = local_pos.x - drag_start_position.x
		# Calculate how many positions to shift
		drag_offset = int(drag_delta.x / TILE_SIZE)
	elif current_drag_type == "column":
		drag_delta.y = local_pos.y - drag_start_position.y
		drag_offset = int(drag_delta.y / TILE_SIZE)
	
	# Visual feedback during drag (optional for MVP)
	update_drag_visuals()

func update_drag_visuals():
	# Visual feedback during dragging
	# This could be simplified or removed for the MVP
	pass

func apply_drag():
	if abs(drag_offset) >= 1:  # Only apply if drag is significant
		if current_drag_type == "row":
			main_game.shift_horizontal_strip(drag_index, drag_offset)
		elif current_drag_type == "column":
			main_game.shift_vertical_strip(drag_index, drag_offset)

func reset_drag_state():
	is_dragging = false
	current_drag_type = ""
	drag_index = -1
	drag_offset = 0
