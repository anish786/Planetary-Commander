var node = function(size, x, y, adjacent) {
	this.units = -1;
	this.owner = none;
	this.adjacent = adjacent;
	this.visible = false;
	this.size = size;
	this.x = x;
	this.y = y;
	this.targeted = false;
	
	switch(this.size) {
		case small:
			this.img = hidden_unknown_small_node.clone();
			this.target = small_target.clone();
			break;
		case medium:
			this.img = hidden_unknown_medium_node.clone();
			this.target = medium_target.clone();
			break;
		case large:
			this.img = hidden_unknown_large_node.clone();		
			this.target = large_target.clone();
			break;
		default:
	}
	this.img.x = this.x;
	this.img.regX = this.img.image.width/2;
	this.img.y = this.y;
	this.img.regY = this.img.image.width/2;
	stage.addChild(this.img);
	
	this.target.x = this.x;
	this.target.regX = this.target.image.width/2;
	this.target.y = this.y;
	this.target.regY = this.target.image.width/2;
	
	this.img.node_id = nodes.length;
	
	this.text = new createjs.Text(this.units, node_font, node_font_color);
	this.text.x = this.x;
	this.text.regX = this.text.getMeasuredWidth()/2;
	this.text.y = this.y;
	this.text.regY = this.text.getMeasuredHeight()/2;
}

node.prototype.show_target = function() {
	if(this.targeted == false) {
		this.targeted = true;
		stage.addChildAt(this.target, stage.getChildIndex(this.img));
	}
}

node.prototype.hide_target = function() {
	if(this.targeted == true) {
		this.targeted = false;
		stage.removeChild(this.target);
	}
}

node.prototype.update = function(update) {
	if(update.owner != -1) {
		this.owner = update.owner;
	}
	if(update.units != -1) {
		this.units = update.units;
	}
	
	this.text.text = this.units;
	this.text.x = this.x;
	this.text.regX = this.text.getMeasuredWidth()/2;
	this.text.y = this.y;
	this.text.regY = this.text.getMeasuredHeight()/2;
	
	this.visible = update.visible;
	if(this.visible == false) {
		stage.removeChild(this.text);
		switch(this.owner) {
			case none:
				switch(this.size) {
					case small:
						this.img.image = hidden_unknown_small_node.image;
						break;
					case medium:
						this.img.image = hidden_unknown_medium_node.image;
						break;
					case large:
						this.img.image = hidden_unknown_large_node.image;
						break;
					default:
				}
				break;
			case player:
				switch(this.size) {
					case small:
						this.img.image = hidden_opponent_small_node.image;
						break;
					case medium:
						this.img.image = hidden_opponent_medium_node.image;
						break;
					case large:
						this.img.image = hidden_opponent_large_node.image;
						break;
					default:
				}
				break;
			case opponent:
				switch(this.size) {
					case small:
						this.img.image = hidden_opponent_small_node.image;
						break;
					case medium:
						this.img.image = hidden_opponent_medium_node.image;
						break;
					case large:
						this.img.image = hidden_opponent_large_node.image;
						break;
					default:
				}
				break;
			default:
		}
	}
	else if(this.visible == true) {
		stage.addChild(this.text);
		switch(this.owner) {
			case none:
				switch(this.size) {
					case small:
						this.img.image = visible_unowned_small_node.image;
						break;
					case medium:
						this.img.image = visible_unowned_medium_node.image;
						break;
					case large:
						this.img.image = visible_unowned_large_node.image;
						break;
					default:
				}
				break;
			case player:
				switch(this.size) {
					case small:
						this.img.image = visible_player_small_node.image;
						break;
					case medium:
						this.img.image = visible_player_medium_node.image;
						break;
					case large:
						this.img.image = visible_player_large_node.image;
						break;
					default:
				}
				break;
			case opponent:
				switch(this.size) {
					case small:
						this.img.image = visible_opponent_small_node.image;
						break;
					case medium:
						this.img.image = visible_opponent_medium_node.image;
						break;
					case large:
						this.img.image = visible_opponent_large_node.image;
						break;
					default:
				}
				break;
			default:
		}
	}
}
