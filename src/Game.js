// Gross hack for switching between contexts;
var topPointer;
BasicGame.Game = function (game) {

var timer
    topPointer = this;
	//	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

    this.score = 0;

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

BasicGame.Game.prototype = {

    preload: function() {

    },

	create: function () {

        this.score = 0;
        this.game.world.setBounds(0,0,2560,1600)
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.setBoundsToWorld();
        this.game.add.sprite(0, 0, 'galaxy');
        
        this.player = this.game.add.sprite(this.game.world.width/2, this.game.world.height/2, 'rocket');
        this.player.scale.set(playerSize, playerSize); // The sprite is really big
        this.player.anchor.setTo(0.5, 0.5); // Swivel around the middle
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true; // Break space physics by bouncing off edge of universe (gasp!)
        this.player.body.bounce.x = universeEdgeBounciness;
        this.player.body.bounce.y = universeEdgeBounciness;
        this.player.body.scaleFactor = playerSize;
        this.player.body.strainAmplitude = 0;
        this.player.body.strainAmplitudeGain = 0;
        this.player.body.strainAngle = 1;

        this.game.camera.follow(this.player)

        // Setup explosions
        this.explosions = this.game.add.group();
        this.explosions.createMultiple(30, 'explode');
        this.explosions.forEach(setupExplosion, this);
        this.player.animations.add('explode');
                timer = this.game.time.create();
        timerEvent = timer.add(Phaser.Timer.MINUTE * 2 + Phaser.Timer.SECOND * 5, this.endTimer, this);

        timer.start();



        // Create a group to hold all of our chickens!

        this.chickens = this.game.add.group();
        this.chickens.enableBody = true; // It's no fun if the chickens don't interact with other matter!
//        this.chickens.position.setTo(this.game.world.width,this.game.world.height)
//        this.chickens.position.setTo(0, 0)
        // Which spit out feathers and eggs!


        this.feathers = this.game.add.group();
        this.feathers.enableBody = true;
        this.feathers.name = "feathers";
        this.eggs = this.game.add.group();
        this.eggs.enableBody = true;
        this.eggs.name = "eggs";
        this.chickens.x = 0
        this.chickens.y = 0
        this.chickens.name = "chickens";

        // If chickens get too big they become blackholes!

        this.blackHoles = this.game.add.group();
        this.blackHoles.enableBody = true;
        this.blackHoles.name = "blackHoles";


        this.gravitons = this.game.add.group();
        this.gravitons.enableBody = true;
        this.gravitons.physicsBodyType = Phaser.Physics.ARCADE;
        this.gravitons.name = "gravitons";
        this.game.world.bringToTop(this.chickens);

        // Enable inputs
        this.cursors = this.game.input.keyboard.createCursorKeys();
        if (loadMusic) {
            //Queue up music
            this.music = this.add.audio('titleMusic');
            this.music.play();
            this.collectCoin = this.add.audio('collectCoin');
        }
	},

	update: function () {

        this.player.rotation = this.game.physics.arcade.angleToPointer(this.player) - Math.PI/2; // Phaser recons angle from vertical, not from horizontal.

        // What happens when objects collide?
        this.game.physics.arcade.overlap(this.chickens, this.chickens, coalesce, null, this);
        this.game.physics.arcade.overlap(this.player, this.chickens, destroyPlayer);
        this.game.physics.arcade.overlap(this.player, this.blackHoles, destroyPlayer);
        this.game.physics.arcade.overlap(this.chickens, this.blackHoles, coalesceBlackHoles);
        this.game.physics.arcade.overlap(this.blackHoles, this.blackHoles, coalesceBlackHoles);
        this.game.physics.arcade.overlap(this.player, this.gravitons, addStrain2);
        this.game.physics.arcade.overlap(this.player, this.feathers, collectFeather);
        this.game.physics.arcade.overlap(this.chickens, this.gravitons, addStrain2);
        this.game.physics.arcade.overlap(this.player, this.eggs, destroyPlayer);
        ripenFeathers()
        strainObjects();

        this.game.debug.text('Score: ' + this.score, 20, 20)
        if (timer.running) {
            this.game.debug.text("Time Remaining: " +(this.formatTime(Math.round((timerEvent.delay - timer.ms) / 1000))), 20, 40);
        }
        else {
            game.debug.text("Done!", 20, 40, "#0f0");
        }

        // Handle input

        if (this.game.input.activePointer.isDown) {
            // Emit chicken (most exciting thing in the entire game)!
            fire(this.player);
        }

        // Instantly reload chicken gun if cursor isn't down
        if (this.game.input.activePointer.isUp) {
            nextFire = this.game.time.now;
        }

        gravitate(this.chickens, this.blackHoles);
        gravitatePlayer(this.player);
        gravitateEggs(this.eggs, this.chickens, this.blackHoles);
        checkCoreCollapse(this.chickens);
	},

    formatTime: function(s) {
        // Convert seconds (s) to a nicely formatted and padded time string
        var minutes = "0" + Math.floor(s / 60);
        var seconds = "0" + (s - minutes * 60);
        return minutes.substr(-2) + ":" + seconds.substr(-2);   
    },

    render : function() {


     },

    endTimer: function() {
    quit()
},

	quitGame: function (pointer) {

		//	Here you should destroy anything you no longer need.
		//	Stop music, delete sprites, purge caches, free resources, all that good stuff.
        if (loadMusic) {
            this.music.stop();
            //	Then's go back to the main menu.
        }
		this.state.start('MainMenu');

	}

};
