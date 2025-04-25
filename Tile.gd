extends Node2D

# References
@onready var letter_label = $Label

# Properties
var letter = ""

func set_letter(new_letter):
	letter = new_letter
	letter_label.text = letter

func highlight(is_highlighted):
	# Visual highlighting for potential matches
	if is_highlighted:
		modulate = Color(1.5, 1.5, 0.5)  # Yellow highlight
	else:
		modulate = Color(1, 1, 1)  # Normal
