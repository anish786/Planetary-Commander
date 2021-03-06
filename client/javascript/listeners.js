// Listener for the play button
var play_button_listener = function(event) {
	// Change to hover image on mouse over and play sound
	if(event.type == 'mouseover') {
		play_button.image = play_button_hover_img.image;
		stage.update();
		var over_sound_instance = createjs.Sound.play("button_over");
		over_sound_instance.volume = 0.1;
	} 
	// Change to normal image on mouse out
	else if(event.type == 'mouseout') {
		play_button.image = play_button_img.image;
		stage.update();
	} 
	// Remove the start menu, play a sound and start the game on click
	else if(event.type == 'click') {
		start_game();
		var click_sound_instance = createjs.Sound.play("button_click");
		click_sound_instance.volume = 0.1;
	}
}

// Listener for the insturction button
var instruction_button_listener = function(event) {
	// Change to hover image on mouse over and play sound
	if(event.type == 'mouseover') {
		instructions_button.image = instructions_button_hover_img.image;
		stage.update();
		var over_sound_instance = createjs.Sound.play("button_over");
		over_sound_instance.volume = 0.1;
	} 
	// Change to normal image on mouse out
	else if(event.type == 'mouseout') {
		instructions_button.image = instructions_button_img.image;
		stage.update();
	} 
	// Open the instructions in a new window and play a sound on click
	else if(event.type == 'click') {
		counters = 1;
		start_instruction();
		var click_sound_instance = createjs.Sound.play("button_click");
		click_sound_instance.volume = 0.1;
	}
}

// Click listener for bgm control
var bgm_control = function(event) {
	// If playing stop and change to muted icon
	if(bgm_button.playing == true) {
		bgm_button.playing = false;
		bgm_button.image = bgm_mute_img.image;
		bgm_loop.pause();
	}
	// Else start and change to playing icon
	else {
		bgm_button.playing = true;
		bgm_button.image = bgm_play_img.image;
		bgm_loop.resume();
	}
	stage.update();
}

// Handles animate messages from the server
var animation_handler = function(movements_to_animate) {
	// Remove waiting message
	stage.removeChild(waiting);
	
	stage.addChild(sending);
	
	// Stop timer
	clearInterval(timer.interval);
	stage.removeChild(timer.text);
	stage.removeChild(timer.img);
	
	// Remove units from the stage
	for(var i = 0; i < units_list.length; i++){
		stage.removeChild(units_list[i].img);
		stage.removeChild(units_list[i].text);
	}
	stage.update();
	
	// Clear the units list array
	units_list = [];
	
	// Clear the animation list
	animation_list = []
	
	// Create the new unit animations
	for(var i = 0; i < movements_to_animate.length; i++) {
		animation_list.push(new animation_unit(movements_to_animate[i]));
	}
	// Animate
	animation_time = 0;
	animation_interval = setInterval(call_animations, 1);
}

// Finished animating so remove animation objects and tell the server
var done_animating = function() {
	// Tell the server done, wait for update
	socket.emit("animation_done");
	
	for(var i = 0; i < animation_list.length; i++) {
		stage.removeChild(animation_list[i].img);
		stage.removeChild(animation_list[i].text);
		stage.removeChild(animation_list[i].target);
	}
	
	stage.removeChild(sending);
	stage.removeChild(waiting_sending_text_box);
	
	stage.update();
}

// Handles update messages from the server
var update_handler = function(updates) {
	// Apply updates from the server
	for(var i = 0; i < updates.length; i++){
		nodes[i].update(updates[i]);
	}
	// Add back the finalize button
	stage.addChild(finalize_button);
	finalize_button.image = finalize_button_img.image;
	
	// Add back the timer
	stage.addChild(timer.text);
	stage.addChild(timer.img);
	
	// Clear the movements arrary
	movements = [];
	
	// Show updates
	stage.update();
	
	// Add listeners for owned nodes
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player && nodes[i].visible == true){
			nodes[i].img.addEventListener("click", source_node_select);
			nodes[i].img.addEventListener("mouseover", node_in_source);
			nodes[i].img.addEventListener("mouseout", node_out_source);
		}
	}
	
	// Start or restart the timer
	if(timer.started == false) {
		timer.setup(time_limit);
	}
	else {
		timer.restart(time_limit);
	}
}

// Listener for mouse over for a node when selecting source node
var node_in_source = function(event) {
	var hover = event.currentTarget.node_id;
	nodes[hover].show_target_source();
	stage.update();
	var over_sound_instance = createjs.Sound.play("button_over");
	over_sound_instance.volume = 0.05;
}

// Listener for mouse out for a node when selecting source node
var node_out_source = function(event) {
	var hover = event.currentTarget.node_id;
	nodes[hover].hide_target_source();
	stage.update();
	var over_sound_instance = createjs.Sound.play("button_over");
	over_sound_instance.volume = 0.05;
}

// Listener for mouse over for a node when selecting destination node
var node_in_dest = function(event) {
	var hover = event.currentTarget.node_id;
	nodes[hover].show_target_dest();
	stage.update();
	var over_sound_instance = createjs.Sound.play("button_over");
	over_sound_instance.volume = 0.05;
}

// Listener for mouse out for a node when selecting destination node
var node_out_dest = function(event) {
	var hover = event.currentTarget.node_id;
	nodes[hover].hide_target_dest();
	stage.update();
	var over_sound_instance = createjs.Sound.play("button_over");
	over_sound_instance.volume = 0.05;
}

// Handles results messages from the server
var result_handler = function(message) {
	// Update all the nodes one last time
	for(var i = 0; i < message.updates.length; i++){
		nodes[i].update(message.updates[i]);
	}
	
	// Disconnect from the server
	socket.disconnect();
	
	// Show appropriate win or lose message
	if(message.results == "winner"){
		stage.addChild(win_message_text_box);
		stage.addChild(win_message);
	}
	else if (message.results == "loser") {
		stage.addChild(lose_message_text_box);
		stage.addChild(lose_message);
	}
	
	// If a node was selected deselect it
	if(selected >= 0) {
		nodes[selected].hide_target_source();
		nodes[selected].update({owner:player, units:selection_units.max, visible:true});
		stage.removeChild(selection_units.img);
		stage.removeChild(selection_units.text);
		stage.removeEventListener("stagemousemove", units_track_mouse);
		selection_units = null;
		selected = -1;
	}
	
	//Remove listeners for nodes
	for (var i = 0; i < nodes.length; i++) {
		nodes[i].img.removeAllEventListeners();
	}
	// Remove listeners for units as well as removing them from the stage
	for (var i = 0; i < units_list.length; i++) {
		units_list[i].img.removeAllEventListeners();
		stage.removeChild(units_list[i].img);
		stage.removeChild(units_list[i].text);
	}
	
	// Remove the finalize button or waiting message if present
	stage.removeChild(finalize_button);
	stage.removeChild(waiting);
	stage.removeChild(waiting_sending_text_box);
	
	// Stop the timer
	timer.started = false;
	window.clearInterval(timer.interval);
	stage.removeChild(timer.text);
	stage.removeChild(timer.img);
	
	// Add back the play button and reposition it where the finish button was
	stage.addChild(play_button);
	play_button.x = 890;
	play_button.y = 670;
	
	stage.update();
}

// Handle clicks for selecting a source node
var source_node_select = function(event) {
	// Remove listeners from nodes
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player){
			nodes[i].img.removeAllEventListeners();
		}
	}
	// Set selected to the node id of the selected node
	selected = event.currentTarget.node_id;
	
	// Show source target if not already shown
	nodes[selected].show_target_source();
	// Set up selection units and units to send
	units_to_send = nodes[selected].units;
	selection_units = new create_selection_units(selected, units_to_send);
	nodes[selected].update({owner:player, units:0, visible:true});
	stage.addEventListener("stagemousemove", units_track_mouse);
	
	stage.update();
	
	// Add listeners for destination selection
	nodes[selected].img.addEventListener("click", destination_node_select);
	for(var i = 0; i < nodes[selected].adjacent.length; i++){
		nodes[nodes[selected].adjacent[i]].img.addEventListener("click", destination_node_select);
		nodes[nodes[selected].adjacent[i]].img.addEventListener("mouseover", node_in_dest);
		nodes[nodes[selected].adjacent[i]].img.addEventListener("mouseout", node_out_dest);
		var over_sound_instance = createjs.Sound.play("source_click");
		over_sound_instance.volume = 0.1;
	}
}

// Handles clicks for selecting a destination node
var destination_node_select = function(event) {
	// Remove listeners from nodes
	nodes[selected].img.removeEventListener("click", destination_node_select);
	for(var i = 0; i < nodes[selected].adjacent.length; i++){
		nodes[nodes[selected].adjacent[i]].img.removeAllEventListeners();
	}
	
	// Get the id of the node clicked
	var destination = event.currentTarget.node_id;
	
	// Remove target reticles
	nodes[selected].hide_target_source();
	nodes[destination].hide_target_dest();
	
	// If the node is not the selected source node
	if(selected != destination){
		// Create the movement to send to the server and the unit to show on the screen
		var send_units = units_to_send;
		if ( send_units == 0 ){
			send_units = 1;
		}
		movements.push(new movement(selected, destination, send_units));
		units_list.push(new units(selected, destination, send_units));
		
		var over_sound_instance = createjs.Sound.play("dest_click");
		over_sound_instance.volume = 0.1;
	}
	// The node clicked was the source, so cancel the movement
	else {
		nodes[selected].update({owner:player, units:selection_units.max, visible:true});
		
		var over_sound_instance = createjs.Sound.play("cancel");
		over_sound_instance.volume = 0.1;
	}
	
	// Remove the selection units and clear it for future use
	stage.removeChild(selection_units.img);
	stage.removeChild(selection_units.text);
	stage.removeEventListener("stagemousemove", units_track_mouse);
	selection_units = null;
	
	stage.update();
	selected = -1;
	
	// Set listeners from player owned nodes that don't already have a movement
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player && nodes[i].visible == true){
			var movement_found = false;
			for(var j = 0; j < movements.length; j++) {
				if(movements[j].source == i && movements[j].units > 0) {
					movement_found = true;
				}
			}
			if(!movement_found){
				nodes[i].img.addEventListener("click", source_node_select);
				nodes[i].img.addEventListener("mouseover", node_in_source);
				nodes[i].img.addEventListener("mouseout", node_out_source);
			}
		}
	}
	// Set click listeners for units
	for(var i = 0; i < units_list.length; i++) {
		units_list[i].img.addEventListener("click", units_click_listener);
	}
}

// Handles click on units to cancel them
var units_click_listener = function(event) {
	// Get the id of the units
	var unit_id = event.currentTarget.units_id;
	
	// Remove the unit from the stage
	stage.removeChild(units_list[unit_id].img);
	stage.removeChild(units_list[unit_id].text);
	
	// Find the corresponding movement and clear it
	for(var i = 0; i < movements.length; i++) {
		if(movements[i].source == units_list[unit_id].source){
			movements[i].units = 0;
		}
	}
	
	// Update the source with its correct amount of units after cancellation
	var update_source = {owner: -1, units:nodes[units_list[unit_id].source].units + units_list[unit_id].units, visible: true};
	nodes[units_list[unit_id].source].update(update_source);
	stage.update();
	
	// Add back the listener for the source so a new movement can be made
	nodes[units_list[unit_id].source].img.addEventListener("click", source_node_select);
	nodes[units_list[unit_id].source].img.addEventListener("mouseover", node_in_source);
	nodes[units_list[unit_id].source].img.addEventListener("mouseout", node_out_source);
	
	var over_sound_instance = createjs.Sound.play("cancel");
	over_sound_instance.volume = 0.1;
}

// Handles events for the finish button
var finish_click_listener = function(event) {
	// Change to hover image on mouse over and play sound
	if(event.type == 'mouseover') {
		finalize_button.image = finalize_button_hover_img.image;
		stage.update();
		var over_sound_instance = createjs.Sound.play("button_over");
		over_sound_instance.volume = 0.1;
	} 
	// Change to normal image on mouse out
	else if(event.type == 'mouseout') {
		finalize_button.image = finalize_button_img.image;
		stage.update();
	}
	// Call the end turn function and play a sound
	else if(event.type == 'click') {
		end_turn();
		var click_sound_instance = createjs.Sound.play("button_click");
		click_sound_instance.volume = 0.1;
	}
}

// Handles events for the quit button
var quit_button_listener = function(event) {
	// Change to hover image on mouse over and play sound
	if(event.type == 'mouseover') {
		quit_button.image = quit_hover_img.image;
		stage.update();
	} 
	// Change to normal image on mouse out
	else if(event.type == 'mouseout') {
		quit_button.image = quit_img.image;
		stage.update();
	}
	// Return to menu and play a sound
	else if(event.type == 'click') {
		return_to_menu();
		var click_sound_instance = createjs.Sound.play("button_click");
		click_sound_instance.volume = 0.1;
	}
}

// Handles events for the next button in the instructions
var next_click_listener = function(event) {
	
	// Change to hover image on mouse over and play sound
	if(event.type == 'mouseover') {
		next_button.image = next_button_hover_img.image;
		stage.update();
		var over_sound_instance = createjs.Sound.play("button_over");
		over_sound_instance.volume = 0.1;
	} 
	// Change to normal image on mouse out
	else if(event.type == 'mouseout') {
		next_button.image = next_button_img.image;
		stage.update();
	}
	// Go to the next instruction page and play a sound
	else if(event.type == 'click') {
		counters++;
		if( counters==12)
			counters=1;
		check_next();
		var click_sound_instance = createjs.Sound.play("button_click");
		click_sound_instance.volume = 0.1;
	}
}

// Handles events for the previous button in the instructions
var previous_click_listener = function(event) {
	// Change to hover image on mouse over and play sound
	if(event.type == 'mouseover') {
		previous_button.image = previous_button_hover_img.image;
		stage.update();
		var over_sound_instance = createjs.Sound.play("button_over");
		over_sound_instance.volume = 0.1;
	} 
	// Change to normal image on mouse out
	else if(event.type == 'mouseout') {
		previous_button.image = previous_button_img.image;
		stage.update();
	}
	// Go to the previous instruction page and play a sound
	else if(event.type == 'click') {
		counters--;
		if( counters==0)
			counters=1;
		check_next();
		var click_sound_instance = createjs.Sound.play("button_click");
		click_sound_instance.volume = 0.1;
	}
}

// Handles events for the return button in the instructions
var back_click_listener = function(event) {
	// Change to hover image on mouse over and play sound
	if(event.type == 'mouseover') {
		back_button.image = back_button_hover_img.image;
		stage.update();
		var over_sound_instance = createjs.Sound.play("button_over");
		over_sound_instance.volume = 0.1;
	} 
	// Change to normal image on mouse out
	else if(event.type == 'mouseout') {
		back_button.image = back_button_img.image;
		stage.update();
	}
	// Return to the main menu and play a sound
	else if(event.type == 'click') {
		return_to_menu();
		var click_sound_instance = createjs.Sound.play("button_click");
		click_sound_instance.volume = 0.1;
	}
}


// Called by the timer or by clicking on the finalize button to end a turn
var end_turn = function() {
	// send movements to the server
	socket.emit("movements", movements);
	// remove the finalize button from the screen
	stage.removeChild(finalize_button);
	// show the waiting message
	stage.addChild(waiting);
	stage.addChild(waiting_sending_text_box);
	
	// make sure the timer won't send the call this again when it reaches 0
	timer.already_finished = true;
	
	// if there is a node selected deselect it
	if(selected >= 0) {
		nodes[selected].hide_target_source();
		nodes[selected].update({owner:player, units:selection_units.max, visible:true});
		stage.removeChild(selection_units.img);
		stage.removeChild(selection_units.text);
		stage.removeEventListener("stagemousemove", units_track_mouse);
		selection_units = null;
		selected = -1;
	}
	stage.update();
	
	// Remove event listeners for the units
	for(var i = 0; i < units_list.length; i++) {
		units_list[i].img.removeEventListener("click", units_click_listener);
	}
	// remove event listeners for the nodes
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].owner == player){
			nodes[i].img.removeAllEventListeners();
		}
	}
}

// Handles key events
var key_listener = function(event) {
	//Tested this, confirmed working in FireFox and Chrome Internet Explorer 11
	var key_pressed = event.which;
	
	// If there is a node selected adjust the units to be sent
	if(selected >= 0) {
		// set the units to send to the percent related to each key
		if(key_pressed >= 49 && key_pressed <= 57) {
			units_to_send = Math.floor(selection_units.max*(key_pressed-48)/10);
		}
		else if(key_pressed == 48) {
			units_to_send = selection_units.max;
		}
		// Check to make sure at least 1 unit will be sent
		if(units_to_send == 0) {
			units_to_send = 1;
		}
		selection_units.text.text = units_to_send;
		nodes[selected].update({owner:player, units:selection_units.max-units_to_send, visible:true});
		stage.update();
	}
}

var full_screen_listener = function(event) {
	//Tested this, confirmed working in FireFox and Chrome Internet Explorer 11
	var key_pressed = event.which;
	
	// F key
	if (key_pressed == 70) {
		canvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	}
}

// Handles mouse wheel events
var wheel_listener = function(event) {
	//wheelDelta is for chrome, detail is for firefox
	var wheelinfo;
	if(/Firefox/i.test(navigator.userAgent)) {
		wheelinfo = -1 * event.detail;
	}
	else {
		wheelinfo = event.wheelDelta;
	}
	
	// If there is a node selected adjust the units to be sent
	if(selected >= 0) {
		// If the mouse wheel was scrolled down decrease units to send
		if(wheelinfo < 0) {
			if(units_to_send > 1) {
				units_to_send--;
				nodes[selected].update({owner:player, units:nodes[selected].units+1, visible:true});
			}
		}
		// If the mouse wheel was scrolled up inscrease the units to send
		else if(wheelinfo > 0) {
			if(units_to_send < selection_units.max) {
				units_to_send++;
				nodes[selected].update({owner:player, units:nodes[selected].units-1, visible:true});
			}
		}
		selection_units.text.text = units_to_send;
		
		stage.update();
	}
}