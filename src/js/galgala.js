// Copyright(c) 2018 Bruno Szymkowiak

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
// associated documentation files (the "Software"), to deal in the Software without restriction, including 
// without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
// copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the 
// following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial 
// portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
// LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// #ifdef RELEASE
// #include  "./src/js/shaders.js"
// #include  "./src/js/behavior.js"
// #include  "./src/js/brunosLE.js"
// #include  "./src/js/config.js"
// #include  "./src/js/explosion.js"
// #include  "./src/js/fire.js"
// #include  "./src/js/player.js"
// #include  "./src/js/starfield.js"
// #include  "./src/js/captions.js"
// #include  "./src/js/HUD.js"
// #include  "./src/js/tools.js"
// #include  "./src/js/scores.js"
// #endif

class galgala extends brunosLE {

    constructor(resource) {

        super(resource);
//        this.SHIP_MAX_ROTATION  = Math.PI
        this.NUMBER_OF_FIRES    = 10;
        this.enemies = [];
        this.playerCollisionArray = [];  // object who collide with player enemiess and fires
        this.enemiesCollisionArray = [];
       

        this.orbitControls = false;
        
        this.actualExpSound;

        this.dateTime = new Date();
        this.schedulerTimer = 0;
        this.autoFireTimer = 0;
        
        this.pathId = 0;                // release enemies path id
        this.enemyToReleaseId = 0;      // enemy id to release form this.enemies array
        this.action = "intro";        // scheduler action 1st release enemies
        this.delayTimer = 0;            // delay timer between scheduler actions
        this.additionalToRelease = 8;   // additional enemies to release
        this.releasedAdditional = 0;    // number of aadditional enemies released after ordered enemies
        this.releaseID = 0;             // release number. 5 per level. 
        this.additionalMucha = false;   // kind of additional object to be released mucha or motylek
        this.firstSchedulerCall = true; // some artefact with first call scheduler
        this.numberOfLives = 2;
        this.score = 0;
        this.introModeInited = false;
        this.scoresModeInited = false;
        this.gameModeInited = false;
        
    }

    initScenes() {

        this.backgroundColor = 0x000000;
        this.planeEnabled = false;
        this.planeColor = 0x121212;
        this.shadowsEnabled = true;    

        super.initScenes();
    }

    initGUI() {

// #ifndef RELEASE
        this.gui = initGUI(this);

        var stats = new Stats();
        stats.showPanel( 0 );
        document.body.appendChild( stats.dom );

        this.stats = stats;
// #endif        
    }
  
    initOrder() {

        var muchaMatA = new THREE.MeshLambertMaterial({map:this.muchaTexture1, skinning: true, alphaTest: 0.4, side: THREE.DoubleSide});
        var motylekMatA = new THREE.MeshLambertMaterial({map:this.motylekTexture1, skinning: true, alphaTest: 0.4, side: THREE.DoubleSide});        
        var sowaMatA = new THREE.MeshLambertMaterial({map:this.sowaTexture1, skinning: true});
        this.sowaHitMat = new THREE.MeshLambertMaterial({map:this.sowaTexture2, skinning: true});
        var m = new THREE.Matrix4().makeRotationY(-Math.PI / 2);
        m.premultiply(new THREE.Matrix4().makeScale(0.3, 0.3, 0.3));
        m.premultiply(new THREE.Matrix4().makeTranslation(0.0, 0.0, cfg.orderGeometryTralslateZ));
    //    m.premultiply(new THREE.Matrix4().makeTranslation(0.0, 0.0, 1.0));

 //       this.mainGroup.add(this.orderGeometry);
        var orderedEnemies = 0; // number of enemies in order - not additional enemies
        var additionalMouchaSize = 0;
        var additionalMotylekSize = 0;
        for(var i=0; i < this.orderGeometry.children.length; i++) {

            var object = this.orderGeometry.children[i];
            object.applyMatrix(m);
            var position = object.position;
            var type = object.material.name;

            var geometry;
            var material;
            var animationDuration;
            var rotation = 0;
            var typeName = "";
            var isAdditional = false;
            switch(type) {

                case "motylek": geometry = this.motylekGeometry; material = motylekMatA; animationDuration = Math.random() + 1; typeName = "motylek"; orderedEnemies++; break;
                case "mucha": geometry = this.muchaGeometry; material = muchaMatA; animationDuration = Math.random() + 0.4; typeName = "mucha"; orderedEnemies++; break;
                case "sowa": geometry = this.sowaGeometry; material = sowaMatA; animationDuration = Math.random() + 0.5; typeName = "sowa"; orderedEnemies++;break;
                case "motylekAdd": geometry = this.motylekGeometry; material = motylekMatA; animationDuration = Math.random() + 1; typeName = "motylekAdd"; isAdditional = true; additionalMotylekSize++; break;
                case "muchaAdd": geometry = this.muchaGeometry; material = muchaMatA; animationDuration = Math.random() + 1; typeName = "muchaAdd"; isAdditional = true; additionalMouchaSize++; break;                
                default:

                   geometry = this.motylekGeometry; material = motylekMatA;
                break;
            }

            var mesh = new THREE.SkinnedMesh(geometry, material);
            mesh.scale.set(0.013,0.013,0.013);
            mesh.rotation.y = rotation;
            mesh.position.set(-i-15, 0, 0);
            if(!isAdditional) {

                mesh.basePosition = new THREE.Vector3(position.x, position.y - 0.1, position.z);
            } else {

                mesh.basePosition = new THREE.Vector3(i-5, 0, 0);
            }
            
            mesh.typeName = typeName;
            mesh.update = Behavior.updateEnemy;
            mesh.setPath = Behavior.setPath;
            mesh.status = "generated";
            mesh.isAdditional = isAdditional;
            mesh.engine = this;
            mesh.followShipVolume =  0;  // enemy follow the ship increment x volume
            mesh.fireTime = 0;          // fire time is freme id when enmy is lunch the fire

            if( mesh.typeName == "sowa" ) {

                mesh.hitCount = 0;
            }
            this.mainGroup.add(mesh);
            this.enemies.push(mesh);

            // var clip = mesh.geometry.animations[ 0 ];
            // var action = this.mixer.clipAction( clip, mesh );//.setDuration( animationDuration ).play();
            // action.setDuration( animationDuration ).play()
            // mesh.clipAction = action;
        }
        this.orderedEnemies = orderedEnemies;
        this.enemiesToRelease = this.orderedEnemies / 5;
    }

    initFire() {
  
        this.playerFires = new PlayerFires(this, 10);
        this.enemyFires = new EnemyFires(this, 20);
       
    }

    initSound() {

        var listener = new THREE.AudioListener();
        this.mainCamera.add( listener );

        var fireSound = new THREE.Audio( listener );
        fireSound.setBuffer( this.shipFireOgg );
        fireSound.setLoop(false);
        fireSound.setVolume(cfg.soundVolume);
        
        var muchaExpSound = new THREE.Audio( listener );
        muchaExpSound.setBuffer( this.muchaExpOgg );
        muchaExpSound.setLoop(false);
        muchaExpSound.setVolume(cfg.soundVolume);

        var motylekExpSound = new THREE.Audio( listener );
        motylekExpSound.setBuffer( this.motylekExpOgg );
        motylekExpSound.setLoop(false);
        motylekExpSound.setVolume(cfg.soundVolume);

        var sowaHitSound = new THREE.Audio( listener );
        sowaHitSound.setBuffer( this.sowaHitOgg );
        sowaHitSound.setLoop(false);
        sowaHitSound.setVolume(cfg.soundVolume);

        var sowaExpSound = new THREE.Audio( listener );
        sowaExpSound.setBuffer( this.sowaExpOgg );
        sowaExpSound.setLoop(false);
        sowaExpSound.setVolume(cfg.soundVolume);

        var shipExpSound = new THREE.Audio( listener );
        shipExpSound.setBuffer( this.shipExpOgg );
        shipExpSound.setLoop(false);
        shipExpSound.setVolume(cfg.soundVolume);


        var beginGameSound = new THREE.Audio( listener );
        beginGameSound.setBuffer( this.beginGameOgg );
        beginGameSound.setLoop(false);
        beginGameSound.setVolume(cfg.soundVolume);

        var enemyFireSound = new THREE.Audio( listener );
        enemyFireSound.setBuffer( this.enemyFireOgg );
        enemyFireSound.setLoop(false);
        enemyFireSound.setVolume(cfg.soundVolume);
        
        
        this.fireSound = fireSound;
        this.muchaExpSound = muchaExpSound;
        this.motylekExpSound = motylekExpSound;
        this.sowaHitSound = sowaHitSound;
        this.sowaExpSound = sowaExpSound;
        this.shipExpSound = shipExpSound;
        this.beginGameSound = beginGameSound;
        this.enemyFireSound = enemyFireSound;


    }

    setSoundVolume(volume) {

        this.fireSound.setVolume(volume);
        this.muchaExpSound.setVolume(volume);
        this.motylekExpSound.setVolume(volume);
        this.sowaHitSound.setVolume(volume);
        this.sowaExpSound.setVolume(volume);
        this.shipExpSound.setVolume(volume);
        this.beginGameSound.setVolume(volume);
    }

    initObjects() {

        var scale = 0.01;

        this.mixer = new THREE.AnimationMixer( this.mainScene );
        this.clock = new THREE.Clock();

        this.initSound();
        this.initOrder();
        this.initFire();

     //   var gameControler = new Gamepad(this);

        // ship & collision cube
        this.player = new Player(this);

        var m = new THREE.Matrix4().makeRotationY(Math.PI / 2);
        m.premultiply(new THREE.Matrix4().makeScale(0.7, 0.7, 0.7));
        this.nurms.applyMatrix(m);

        this.starfield = new StarField(this);

        this.explosions = new Explosions(this);

        var skyGeometry = new THREE.CubeGeometry( 100, 100, 100 );
        var skyMaterial = new THREE.MeshFaceMaterial( this.skyBoxMaterialArray );
        var skybox = new THREE.Mesh( skyGeometry, skyMaterial );
        this.mainGroup.add(skybox);
        this.skybox = skybox;

       // this.portraitPaths = [
        this.paths = [
            // {name: "upDownLeftDouble", curvePoints: 120, finishPoints: 50  },
            // {name: "upDownRightDouble", curvePoints: 120, finishPoints: 50  },     
           
            // {name: "rightCircle", curvePoints: 200, finishPoints: 50  },            
            // {name: "leftCircle", curvePoints: 200, finishPoints: 50  }, // finish p       
            
           
      //      {name: "PathLeft", curvePoints: 120, finishPoints: 50  },
            {name: "pLeftPath", curvePoints: 120, finishPoints: 50  },
            {name: "pRightPath", curvePoints: 120, finishPoints: 50  },
            {name: "pLeftDownPath", curvePoints: 120, finishPoints: 50  },
            {name: "pRightDownPath", curvePoints: 120, finishPoints: 50  },
            {name: "pLeftDownPath", curvePoints: 120, finishPoints: 50  },
          //  {name: "PathRight", curvePoints: 120, finishPoints: 50  },
            
            
            
           

        ];
        this.pathsCountToRelease = 2;   // ilosc sciezek z ktorych sa wypuszczane przy starcie

        this.mottylekAttackPaths = [

            "motylek0",
            "motylek1",
            "motylek2",
            "motylek3",
            "motylek4",
            // {name: "wave", points: 150, approachPoints:50},
            // {name: "wave1", points: 150, approachPoints: 50}
           
        ];

        this.muchaAttackPaths = [

            "mucha0",
            "mucha1",
            "mucha2",
            "mucha3",
            "mucha4",
            "mucha5",

        ];

        // var mat = new THREE.MeshPhongMaterial({map: this.galagaTexture})
        // var galagaMesh = new THREE.Mesh(this.galagaGeometry, mat);
        // galagaMesh.rotation.y = Math.PI;
        // galagaMesh.scale.set(0.6, 0.6, 0.6);
        // this.mainGroup.add(galagaMesh);
        this.HUD = new HUD(this);
        this.HUD.setNumerOfLives( this.numberOfLives );        
        this.Scores = new Scores(this);

        this.initEffectComposer(cfg.ebableBloom);    
        this.reorientGame();
        this.render();


       

        this.isReady = true;
    }

    setFlyAnimationDuration(enemy) {

        if(enemy.clipAction === undefined) {

            var clip = enemy.geometry.animations[ 0 ];
            var action = this.mixer.clipAction( clip, enemy );//.setDuration( animationDuration ).play();
            enemy.clipAction = action;
        }
        var animationDuration = 1;
        switch(enemy.typeName) {
    
            case "motylek": animationDuration = Math.random() * 0.25 + 0.1; break;
            case "mucha": animationDuration = Math.random() * 0.1 + 0.1; break;
            case "sowa": animationDuration = Math.random() * 0.2 + 0.3; break;
            case "motylekAdd": animationDuration = Math.random() * 0.25 + 0.1; break;
    
        }
        enemy.clipAction.enabled = true;
        enemy.clipAction.setDuration(animationDuration).play();
    }

    getPathsCountToRelease(releaseID) {

        switch(releaseID) {

            case 0: return 2;
            case 1: return 1;
            case 2: return 1;
            case 3: return 1;
            case 4: return 1;
            default: return 0;

        }
    }

    Scheduler() {

        if(this.firstSchedulerCall) {

            this.firstSchedulerCall = false;
            return;
        }

        switch(this.action) {

            case "release": // release enemies with destiny: stay in order 

                for(var i = 0; i < this.pathsCountToRelease; i++) {

                    var enemy = this.enemies[this.enemyToReleaseId];

                    enemy.status = "release";


                    var orderPos = this.getOrderPosition(enemy.basePosition.x, enemy.basePosition.z, this.paths[this.pathId + i].curvePoints + this.paths[this.pathId + i].finishPoints)
                    var path = Behavior.generatePath(this.nurms, new THREE.Vector3(orderPos.x,-0.10,orderPos.z), this.paths[this.pathId + i]);
                    enemy.setPath(path);
                    this.setFlyAnimationDuration(enemy);
                    this.enemiesCollisionArray.push(enemy);
                    this.enemyToReleaseId++;
    
                    if(this.enemyToReleaseId % this.enemiesToRelease == 0 ) {
        
                        this.pathId += this.pathsCountToRelease;
                        
                        if(this.pathId > this.paths.length - 1 ) {
        
                            this.pathId = 0;
                        }
                        this.releasedAdditional = 0;
                        this.additionalMucha = !this.additionalMucha;
                        this.action = "releaseadd";
                    }
                    
                }




            break;
            case "releaseadd":  // relase additional enemies 
                
                for(var i = 0; i < this.pathsCountToRelease; i++) {
                    if(this.releasedAdditional < this.additionalToRelease) {

                        var additional;
                        if(this.additionalMucha) {
    
                            additional = Behavior.getAdditionalMucha(this.enemies);
                        } else {
    
                            additional = Behavior.getAdditionalMotylek(this.enemies);
                        }
    
                        additional.status = "release";
                        additional.followShipVolume = Math.random() * 0.04  ;
                        this.setFlyAnimationDuration(additional);
    
                        var bufPathId = 0;
                        if(this.pathId != 0) {
    
                            bufPathId = this.pathId-this.pathsCountToRelease;
                        } else {
                            bufPathId = this.paths.length - this.pathsCountToRelease;
                        }
    
                        var path = Behavior.generateAdditionalPath(this.nurms, this.paths[bufPathId + i]);
                        additional.setPath(path);
                        additional.visible = true;
    
                        this.enemiesCollisionArray.push(additional);
                        this.releasedAdditional++;
    
                    } else {
    
                        this.action = "waitforready";  // litle delay between release enemies
                        this.delayTimer = 0;
                        this.releaseID++;
                        this.pathsCountToRelease = this.getPathsCountToRelease(this.releaseID);
                       
                        if(this.enemyToReleaseId >= this.orderedEnemies) { // end release entirie enemies
    
                            this.action = "game";
                        }

                        return;
                    }
                }                
 
            break;
            case "game":


            break;
            case "waitforplayer":

                
                if(this.isAllReady()) {

                    if(this.frameID - this.startWaitForPlayerFrameID > 100) {

                        this.numberOfLives--;
                        this.HUD.setNumerOfLives(this.numberOfLives);
                        if(this.numberOfLives >= 0) {

                            this.player.Respawn();
                            this.HUD.hideTextCenter();
                            this.action = "release";         
                        }
               
                    }

                } else {

                    if(this.numberOfLives == 0) {

                        this.action = "gameover";   
                    } else {

                        this.HUD.textCenter("READY!", "#00ffde");
                    }
                    
                    this.startWaitForPlayerFrameID = this.frameID;
                }
            break;
            case "gameover":

                this.HUD.textCenter("GAME OVER", "#ff0000");
            break;
            case "waitforready": 

                if(this.player.status == this.player.PLAYER_STATUS_HIT) {

                    this.action = "waitforplayer";  
                    this.delayTimer = 0;

                }
                if(this.isAllReady()) {

                    this.action = "release";
                }
            break;
            case "delay":
            
                if(this.player.status == this.player.PLAYER_STATUS_HIT) {

                    this.action = "waitforplayer";  
                    this.delayTimer = 0;

                }
               if(this.delayTimer > 20) {

                    this.action = "release";
                }
                this.delayTimer++;
            break;
            case "intro": 

                if(!this.introModeInited) {

                    this.initIntroMode();
                    this.introModeInited = true;
                }
                if(this.delayTimer > 100) {

                    this.action = "scores";
                    this.scoresModeInited = false;
                    this.delayTimer = 0;
                }
                this.delayTimer++;
            break;
            case "scores":

                if(!this.scoresModeInited) {

                    this.initScoresMode();
                    this.scoresModeInited = true;
                }
                if(this.delayTimer > 25) {

                    this.action = "intro";
                    this.introModeInited = false;
                    this.delayTimer = 0;
                }
                this.delayTimer++;
            break;
            case "start":

                if(!this.gameModeInited) {

                    this.initGameMode();
                    this.beginGameSound.play();
                    this.gameModeInited = true;
                    this.action = "release";
                }
            break;
        }

    }

    initGameMode() {

        this.HUD.showTopScore(true);
        this.HUD.showNumberOfLives(true);
        this.HUD.showLogo(false);
        this.HUD.hideDescryption();
        this.player.show();
        this.frameID = 430;

    }

    initScoresMode() {

        this.HUD.showTopScore(false);
        this.HUD.showNumberOfLives(false);
        this.HUD.showLogo(false);
        this.HUD.setDescriptionPlanePosition(0);
        this.HUD.updateDescription("scoresdesc");
        this.player.hide();

    }

    initIntroMode() {

        this.HUD.showTopScore(false);
        this.HUD.showNumberOfLives(false);
        this.HUD.showLogo(true);
        this.HUD.updateDescription("introdesc");
        this.HUD.setDescriptionPlanePosition(-this.height + 20);
        
        this.player.hide();
    }

    

    isAllReady() {

        for(var i in this.enemiesCollisionArray) {

            var enemy = this.enemiesCollisionArray[i];
            if( enemy.status != "ready") {

                return false;
            }

        }

        return true;
    }

    
    checkItemsLoaded() {

        if(this.beginGameOgg === undefined) {

            return false;
        }
        return true;
    }

    loadObjects() {

        super.loadObjects();


        var textureLoader = new THREE.TextureLoader( this.downloadManager );
        this.muchaTexture1 = textureLoader.load( 'assets/textures/muchadefault/mucha128A.png' );


        this.motylekTexture1 = textureLoader.load( 'assets/textures/motylek/motylek128.png' );

        this.sowaTexture1 = textureLoader.load( 'assets/textures/sowa/sowa128.png' );
        this.sowaTexture2 = textureLoader.load( 'assets/textures/sowa/sowa128h.png' );


        this.shipTexture1 = textureLoader.load( 'assets/textures/ship/albedo512.png' );
        this.miniShipTexture = textureLoader.load( 'assets/textures/ship/miniship.png' );

        this.fireTexture1 = textureLoader.load( 'assets/textures/fire/fire64.png' );
        this.fireTexture1.magFilter = THREE.NearestFilter;
        this.fireTexture1.minFilter = THREE.NearestFilter;

        this.enemyFireTexture1 = textureLoader.load( 'assets/textures/fire/enemyfire64.png' );
        this.enemyFireTexture1.magFilter = THREE.NearestFilter;
        this.enemyFireTexture1.minFilter = THREE.NearestFilter;

        this.sparkTexture = textureLoader.load( 'assets/textures/sprites/spark1.png' );

        this.galagaTexture = textureLoader.load( 'assets/textures/intro/galgala.png' );
        
        
        // this.fbxLoader.load( 'assets/curves/asciifbx.fbx', function ( object ) {

        //     this.curves = object;
        // }.bind(this));
        var loader = new THREE.OBJLoader(this.downloadManager);
        loader.load( 'assets/curves/nurms.obj', function ( object ) {

            this.nurms = object;
        }.bind(this));
       
        var loader = new THREE.JSONLoader(  this.downloadManager );
        loader.load( 'assets/models/mucha.json', function ( object ) {

            var m = new THREE.Matrix4().makeRotationY(-Math.PI);
            object.applyMatrix(m);
            this.muchaGeometry = object;
        }.bind(this));

        var loader = new THREE.JSONLoader(  this.downloadManager );
        loader.load( 'assets/models/motylek.json', function ( object ) {

            this.motylekGeometry = object;
        }.bind(this));
        
        var loader = new THREE.JSONLoader(  this.downloadManager );
        loader.load('assets/models/ship4.json', function(object) {

           this.shipGeometry = object;
        }.bind(this))

        var loader = new THREE.JSONLoader(  this.downloadManager );
        loader.load('assets/models/sowa.json', function(object) {

            this.sowaGeometry = object;
         }.bind(this))

         var loader = new THREE.JSONLoader(  this.downloadManager );
         loader.load('assets/models/fire.json', function(object) {

            this.fireGeometry = object;
         }.bind(this))

         var loader = new THREE.ObjectLoader(this.downloadManager);
         loader.load('assets/models/order.json', function(object) {

            this.orderGeometry = object;
         }.bind(this))

         var loader = new THREE.FontLoader(this.downloadManager);
         loader.load( 'assets/fonts/oldarcade_Regular.json', function( buffer ) {

            this.font = buffer;
        }.bind(this));      

        var loader = new THREE.AudioLoader(this.downloadManager);
        loader.load( 'assets/sound/begingamefast.ogg', function( buffer ) {

            this.beginGameOgg = buffer;
        }.bind(this));

        var loader = new THREE.AudioLoader(this.downloadManager);
        loader.load( 'assets/sound/shipfire2.ogg', function( buffer ) {

            this.shipFireOgg = buffer;
        }.bind(this));

        var loader = new THREE.AudioLoader(this.downloadManager);
        loader.load( 'assets/sound/motylekexp.ogg', function( buffer ) {

            this.motylekExpOgg = buffer;
        }.bind(this));

        var loader = new THREE.AudioLoader(this.downloadManager);
        loader.load( 'assets/sound/muchaexp.ogg', function( buffer ) {

            this.muchaExpOgg = buffer;
        }.bind(this));

        var loader = new THREE.AudioLoader(this.downloadManager);        
        loader.load( 'assets/sound/sowahit.ogg', function( buffer ) {

            this.sowaHitOgg = buffer;
        }.bind(this));

        var loader = new THREE.AudioLoader(this.downloadManager);
        loader.load( 'assets/sound/sowaexp.ogg', function( buffer ) {

            this.sowaExpOgg = buffer;
        }.bind(this));

        var loader = new THREE.AudioLoader(this.downloadManager);
        loader.load( 'assets/sound/shipexp2.ogg', function( buffer ) {

            this.shipExpOgg = buffer;
        }.bind(this));

        var loader = new THREE.AudioLoader(this.downloadManager);
        loader.load( 'assets/sound/enemyfire.ogg', function( buffer ) {

            this.enemyFireOgg = buffer;
        }.bind(this));


        var r = "assets/textures/nebula_";
        var urls = [
            r + "left.png", r + "right.png",
            r + "up.png", r + "down.png",
            r + "front.png", r + "back.png"
        ];

        // this.textureCubeLoader.load(urls, function(texture) {

        //     this.textureCube = texture;
        // }.bind(this));

        this.skyBoxMaterialArray = [];
        for (var i = 0; i < 6; i++) {
            this.skyBoxMaterialArray.push( new THREE.MeshBasicMaterial({
                map: textureLoader.load(urls[i]),
                side: THREE.BackSide
            }));
        }



          

    }

    initEffectComposer(isBloomEnabled) {

        var bloomRenderTarget = new THREE.WebGLRenderTarget( this.width, this.height );
        var bloomComposer = new THREE.EffectComposer(this.renderer, bloomRenderTarget );

        var clearPass = new THREE.ClearPass( 0x000000, 1 );
        bloomComposer.addPass( clearPass );

        if(isBloomEnabled) {

            var emissivePass = new THREE.RenderPass( this.bloomScene, this.mainCamera );
            bloomComposer.addPass( emissivePass );
    
            var bloomPass= new THREE.UnrealBloomPass( new THREE.Vector2( this.width, this.height ), cfg.bloomStrength, cfg.bloomRadius,  cfg.bloomThreshold );        
            bloomComposer.addPass( bloomPass );
        }

        var composer = new THREE.EffectComposer( this.renderer );

 //       var cubeTexturePass = new THREE.CubeTexturePass( this.mainCamera );
 //       cubeTexturePass.envMap = this.textureCube
 //       composer.addPass( cubeTexturePass );        
        var clearPass = new THREE.ClearPass( 0x000000, 1 );
        composer.addPass( clearPass );

        var renderPass = new THREE.RenderPass( this.mainScene, this.mainCamera );
        renderPass.clear = false;
        composer.addPass( renderPass );

        var outputPass = new THREE.ShaderPass( THREE.BlenderShader, "tMain" );
        outputPass.uniforms[ 'tBloom' ].value = bloomComposer.renderTarget2.texture;
        outputPass.uniforms[ 'tHUD' ].value = this.HUD.renderTarget.texture;
        outputPass.renderToScreen = true;
        composer.addPass(outputPass);

        this.composer = composer;
        this.bloomComposer = bloomComposer;
        this.renderPass = renderPass;
        this.bloomPass = bloomPass;
        this.emissivePass = emissivePass;

// #ifndef RELEASE
        this.gui.__controllers[1].setValue(`${this.width}x${this.height}`);
// #endif
    }

    reorientGame() {

        var oldOrderGeometryTralslateZ = cfg.orderGeometryTralslateZ;
        if(this.orientation == this.LANDSCAPE) {

            cfg.cameraPositionY = cfg.landscapeCameraPositionY;
            cfg.cameraLookAtZ = cfg.landscapeCameraLookAtZ;
            cfg.orderPositionTranslate = cfg.landscapeOrderPositionTranslate;
            cfg.orderPositionTranslateSpeed = cfg.landscapeOrderPositionTranslateSpeed;
            cfg.orderGeometryTralslateZ = cfg.landscapeOrderGeometryTralslateZ;
            cfg.captionsPositionY = cfg.landscapeCaptionsPositionY;
        } else {

            cfg.cameraPositionY = cfg.portraitCameraPositionY;
            cfg.cameraLookAtZ = cfg.portraitCameraLookAtZ;
            cfg.orderPositionTranslate = cfg.portraitOrderPositionTranslate;
            cfg.orderPositionTranslateSpeed = cfg.portraitOrderPositionTranslateSpeed;
            cfg.orderGeometryTralslateZ = cfg.portraitOrderGeometryTralslateZ;
            cfg.captionsPositionY = cfg.portraitCaptionsPositionY;
        }

        // reorient enemies order positions
        for(var i in this.enemies) {

            var enemy = this.enemies[i];
            enemy.basePosition.z = enemy.basePosition.z - oldOrderGeometryTralslateZ + cfg.orderGeometryTralslateZ;
            enemy.position.z = enemy.position.z - oldOrderGeometryTralslateZ + cfg.orderGeometryTralslateZ;
        }

        this.mainCamera.position.set(cfg.cameraPositionX, cfg.cameraPositionY, cfg.cameraPositionZ);
        this.mainCamera.lookAt(cfg.cameraLookAtX, cfg.cameraLookAtY, cfg.cameraLookAtZ);
        this.mainCamera.updateProjectionMatrix();
    }

    onWindowResize() {

        super.onWindowResize();
        this.composer.setSize(this.width, this.height);
        this.HUD.setSize(this.width, this.height);
        this.reorientGame();

// #ifndef RELEASE
        this.gui.__controllers[1].setValue(`${this.width}x${this.height}`);
// #endif        
    }

    onFire() {

        if(this.player.status == this.player.PLAYER_STATUS_READY) {

            this.playerFires.fire(this.player.ship.position);

        } else {

            if(this.action == "intro" || this.action == "scores") {

                this.action = "start";
            }
            
        }
        
    }

    updateScore(object) {


        switch(object.typeName) {

            case "sowa":

                if(object.status == "release") {

                    this.score += 10;
                } else {

                    this.score += 1;
                }
            break;
            case "motylekAdd":
            case "motylek":

                if(object.status == "release") {
                        
                    this.score += 20;        
                } else if(object.status == "attack") { 

                    this.score += 120;                                
                } else {

                    this.score += 2;
                }            
            break;
            case "muchaAdd":
            case "mucha":

                if(object.status == "release") {
                        
                    this.score += 30;      
                                  
                } else if(object.status == "attack") { 

                    this.score += 130;
                } else {

                    this.score += 3;
                }
            break;


        }
        this.HUD.setScore(this.score);
    }
    
    onCollision(collisionResult) {

        var object = collisionResult[0].object;
        
        this.updateScore(object);
        
        if(this.actualExpSound !== undefined && this.actualExpSound.isPlaying) {

            this.actualExpSound.stop();
        }

        var explode = true;
        var explodePosition = object.position.clone();
        switch(object.typeName) {

            case "motylekAdd":

                this.actualExpSound = this.motylekExpSound;
                object.position.set(object.basePosition.x, object.basePosition.y, object.basePosition.z);
                object.path = undefined;
                object.status = "ready"
                object.visible = false;
            break;
            case "muchaAdd":

                this.actualExpSound = this.muchaExpSound;
                object.position.set(object.basePosition.x, object.basePosition.y, object.basePosition.z);
                object.path = undefined;
                object.status = "ready"
                object.visible = false;
            break;
            case "motylek":

                this.actualExpSound = this.motylekExpSound;
                object.visible = false;
            break;
            case "mucha":
                this.actualExpSound = this.muchaExpSound;
                object.visible = false;
            break;
            case "sowa":
                if(object.hitCount == 0) {

                    this.actualExpSound = this.sowaHitSound;
                    object.material = this.sowaHitMat;
                    object.hitCount++;
                    explode = false;
                } else {
                    this.actualExpSound = this.sowaExpSound
                    object.visible = false;
                }
            break;

        }

        if(explode) {

            this.explosions.explode(explodePosition);
            // var index = this.enemies.indexOf(object);
            // this.enemies.splice(index, 1);
            // this.mainScene.remove(object);
        }
        
        if(object.visible == false) {

            var id = this.enemiesCollisionArray.indexOf(object);
            this.enemiesCollisionArray.splice(id, 1);

            var clipAction = object.clipAction;
            clipAction.enabled = false;
          //  var actionID = this.mixer._actions.indexOf(clipAction);
        //    this.mixer._actions.splice(actionID, 1);
            this.mixer.uncacheAction(clipAction);
        }
        this.actualExpSound.play();
    }

    getOrderPosition(baseX, baseZ, timeShift) {

        // var scalePosition = ((Math.sin((this.frameID + timeShift) / 150 ) + 3.5) * 0.3);
        // var translatePosition = (Math.sin((this.frameID + timeShift) / 500)) * 3;


        var scalePosition = ((Math.sin((this.frameID + timeShift) / 100 ) + 3.5) * 0.3);
        var translatePosition = (Math.sin((this.frameID + timeShift) / cfg.orderPositionTranslateSpeed)) * cfg.orderPositionTranslate;      
        //var translatePosition = (Math.sin((this.frameID + timeShift) / 50)) * cfg.orderPositionTranslate;       
        return {
            x: (baseX * scalePosition) + translatePosition,
            z: baseZ * scalePosition
        }
    }

    updateEnemy() {

        for(var i in this.enemies) {

            var enemy = this.enemies[i];
            if(!enemy.update()) {   // if not updated (walk throught path) update order position

                if(enemy.status != "generated" && !enemy.isAdditional) {

                    var position = this.getOrderPosition(enemy.basePosition.x, enemy.basePosition.z, 0);
                    enemy.position.x = position.x;
                    enemy.position.z = position.z;
                }

            }
        }
    }

    updateTimers() {

        if( this.frameID - this.schedulerTimer > 12) {

            this.Scheduler();
            this.schedulerTimer = this.frameID;
        }

        if( cfg.autoFire && this.frameID - this.autoFireTimer > cfg.autoFireInterval) {

            this.onFire();
            this.autoFireTimer = this.frameID;
        }

     //   this.autoFireTimer
    }

    render() {

        requestAnimationFrame(this.render.bind(this));

// #ifndef RELEASE
        this.stats.begin();
// #endif  
        if(this.isReady) {

            
            if(cfg.ebableBloom) {

                this.hemiLight.intensity = 0;
                this.dirLight.intensity = 0;
                this.bloomComposer.render();
    
                this.hemiLight.intensity = 1;
                this.dirLight.intensity = 1;
                this.composer.render();
            } else {

                this.composer.render();
            }

            this.HUD.render();

            this.mixer.update( this.clock.getDelta() );
            this.updateTimers();
            this.player.update();
            this.playerFires.update();
            this.enemyFires.update();
            this.explosions.update();
            this.starfield.update();
            this.skybox.rotation.x += 0.0005;
            this.updateEnemy();
        }
// #ifndef RELEASE
        this.stats.end();    
// #endif          
        this.frameID++;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    var app = new galgala(document.body, location);
    app.run();
  });