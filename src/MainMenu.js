var menuMusic

BasicGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)
        if (loadMusic) {
            menuMusic = this.add.audio('gameMusic');
            menuMusic.play();
        }
	        width = window.innerWidth;
	        height = window.innerHeight;
		this.add.sprite((width-640)/2, (height-400)/4, 'titlepage');
			

		this.instructionsButton = this.add.button((width-150)/2, Math.min((height-320)/2+320, height-20), 'instructionsButton', this.showInstructions, this, 'buttonOver', 'buttonOut', 'buttonOver');
		this.playButton = this.add.button((width-40)/2, Math.min((height-320)/2+350, height-20), 'playButton', this.startGame, this, 'buttonOver', 'buttonOut', 'buttonOver');

	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

    showInstructions: function(pointer) {
        this.state.start('Instructions')
    },
	startGame: function (pointer) {
        if (loadMusic) {
            //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
            menuMusic.stop();
        }

		//	And start the actual game
		this.state.start('Game');

	}

};
