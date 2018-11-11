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

class HUD {

    constructor(parent) {

        this.parent = parent;
        this.needUpdate = true;
        this.shipTexttureWidth = 512;
        this.shipTexttureHeight = 512;
        this.shipPhotoSize = 40;
        this.score = 0;
        this.record = 1;
        this.descriptionPlanePosition = -50;  // position of descryprion dynamic texture plane difriend for intro and scores
        this.descriptionMode = "";              // description mode now is intro description and scores description

        this.initScene();
        this.initObjects();
    }

    initScene() {

        var parent = this.parent;
        var scene = new THREE.Scene();

        // if(parent.width > parent.height) {

        //     var width = 1.0;
        //     var height = 1.0 * parent.pixelRatio;

        // } else {

        //     var width = 1.0 * parent.pixelRatio;
        //     var height = 1.0;
        // }

        var camera = new THREE.OrthographicCamera(-parent.width, parent.width, parent.height, -parent.height, -200, 500 );
        var renderTarget = new THREE.WebGLRenderTarget( parent.width, parent.height );


      
        this.scene = scene;
        this.camera = camera;
        this.renderTarget = renderTarget;
        // this.HUDWidth = width;
        // this.HUDHeight = height;
        
    }

    initObjects() {

        var parent = this.parent;

        WebFont.load({
            custom: {
              families: ['oldarcade']
            }
          });

        // score and record top HUD
        var dynamicTexture	= new THREEx.DynamicTexture(512,16);
        dynamicTexture.context.font	= '16px "oldarcade"';

        this.dynamicsTexture = dynamicTexture;

        var geometry	= new THREE.PlaneGeometry( 512, 16);
        var material	= new THREE.MeshBasicMaterial({

            map	: dynamicTexture.texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        })
        var mesh	= new THREE.Mesh( geometry, material );
        mesh.position.set(0, this.parent.height - 16, 0);
        mesh.visible = false;
        this.scene.add(mesh);
        this.topScore = mesh;

  //      this.dynamicsTexture.clear().drawText(" ", 0, 16, 'white'); 
        // document.fonts.onloadingdone = function (fontFaceSetEvent) {

        //     this.updateScore(0);
        //  }.bind(this);
              
//        this.setNumerOfLives(5);
         
        // logo
        var geometry	= new THREE.PlaneGeometry( 800, 800 / 2.5);
        var material	= new THREE.MeshBasicMaterial({map: this.parent.galagaTexture});
        var mesh	= new THREE.Mesh( geometry, material );
        mesh.position.set(0.0, this.parent.height / 2, 0);
        mesh.visible = false;
        this.scene.add(mesh);
        this.galagaLogo = mesh;


        // description
        var descTexture	= new THREEx.DynamicTexture(512,512);
        descTexture.context.font	= '16px "oldarcade"';

        this.descTexture = descTexture;

        var geometry	= new THREE.PlaneGeometry( 512, 512);
        var material	= new THREE.MeshBasicMaterial({

            map	: descTexture.texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        })
        var mesh	= new THREE.Mesh( geometry, material );
        mesh.position.set(0, this.parent.height);
        this.scene.add(mesh);
        this.descriptionPlane = mesh;

        // this.descTexture.clear().drawText(" ", 0, 16, 'white'); 
        // document.fonts.onloadingdone = function (fontFaceSetEvent) {

        //     this.updateDescription();
        //  }.bind(this);
        

         //dynamic text line
         var dynamicTexture	= new THREEx.DynamicTexture(512,32);
         dynamicTexture.context.font	= '32px "oldarcade"';
 
         this.lineTexture = dynamicTexture;
 
         var geometry	= new THREE.PlaneGeometry( 512, 32);
         var material	= new THREE.MeshBasicMaterial({
             map	: dynamicTexture.texture,
             transparent: true,
             opacity: 1,
             side: THREE.DoubleSide
         })
         var mesh	= new THREE.Mesh( geometry, material );
         mesh.visible = false;
         this.scene.add(mesh);
         this.linePlane = mesh;         



        //  this.lineTexture.clear().drawText(" ", 0, 32, 'white'); 
        //  document.fonts.onloadingdone = function (fontFaceSetEvent) {

        //     this.lineTexture.clear().drawText("", 0, 32, 'white'); 
        //  }.bind(this);
    }


    textCenter(text, color) {

        this.linePlane.visible = true;
        var w = this.lineTexture.getTextWidth(text);
        this.linePlane.position.x = (512 / 2) - w / 2;
        this.lineTexture.clear().drawText(text, 0, 30, color); 
        this.needUpdate = true;
    }

    hideTextCenter() {

        this.linePlane.visible = false;
        this.needUpdate = true;
    }

    hideDescryption() {

        if(this.introDescInterval !== undefined) {

            clearInterval(this.introDescInterval);
            this.hideTextCenter();
        }
        this.scene.remove(this.descriptionPlane);
        this.needUpdate = true;

    }

    updateDescription(mode) {

        this.descTexture.clear();
        switch(mode) {

            case "introdesc":

                this.introDescription();
            break;
            case "scoresdesc":
                
                this.scoresDescriptions();
            break;
        

        }


    }

    scoresDescriptions() {

        if(this.introDescInterval !== undefined) {

            clearInterval(this.introDescInterval);
            this.hideTextCenter();
        }
        this.descTexture.clear();
        var y = 16;
        var space = 22;
        this.descTexture.context.font	= '25px "oldarcade"';
        this.descTexture.drawText("TOP 10 PLAYERS:", 0, y += space, '#ffffff');   
        this.descTexture.drawText("---------------------", 0, y += space, '#ffffff');   

        var scoresArray = this.parent.Scores.scoresArray;
        if(scoresArray !== undefined) {

            for(var i = 0; i < 10; i++) {

                this.descTexture.drawText((i+1) + "." +scoresArray[i].name, 0, y += space + space, '#ffffff');   
                var w = this.dynamicsTexture.getTextWidth(scoresArray[i].score);
                this.descTexture.drawText(scoresArray[i].score, 480 - w, y, '#ffffff');   
                
    
            }
        } else {

            this.descTexture.drawText("CONNECTING TO SCORE", 0, y += space + space, '#ffffff');       
            this.descTexture.drawText("       SERVER", 0, y += space + space, '#ffffff');         
        }

    }

    introDescription() {


            this.descTexture.clear();
            var y = 0;
            var space = 22;
            this.descTexture.context.font	= '16px "oldarcade"';
            // this.descTexture.drawText("IF YOU WANT TO SAVE YOUR GAME", 0, y += space, 'grey');  
            // this.descTexture.drawText("SCORE TO GAME'S DATABASE YOU", 0, y += space, 'grey');    
            // this.descTexture.drawText("NEED TO REGISTER YOUR ACCOUNT.", 0, y += space, 'grey');    
            // this.descTexture.context.font	= '25px "oldarcade"';
            // this.descTexture.drawText("REGISTRATION IS FREE!", 0, y += space + space, 'white');   
            this.descTexture.context.font	= '16px "oldarcade"'; 
            this.descTexture.drawText("HOW TO PLAY:", 0, y += space, 'grey');    
            this.descTexture.drawText("KEYBOARD SHORTCUTS:", 0, y += space, 'grey'); 
            this.descTexture.drawText("LEFT ARROW or Z: MOVE LEFT", 0, y += space, 'grey');  
            this.descTexture.drawText("RIGHT ARROW or C: MOVE RIGHT", 0, y += space, 'grey');  
            this.descTexture.drawText("CTRL: FIRE", 0, y += space, 'grey'); 
            
            this.descTexture.drawText("ON TABLETS OR SMARTPHONES PLEASE", 0, y += space + space, 'grey'); 
            this.descTexture.drawText("USE TOUCH SCREEN OR CONTROLLER", 0, y += space, 'grey'); 
    
     //       this.descTexture.context.font	= '14px "oldarcade"'; 
            this.descTexture.drawText("COPYRIGHT©2018 BRUNO SZYMKOWIAK", 0, y += space + space, 'grey'); 
            this.descTexture.drawText("ALL RIGHTS RESERVED.", 0, y += space, 'grey');  
            this.descTexture.drawText("CONTACT: CYBERBRUN@OUTLOOK.COM", 0, y += space, 'grey');  

            this.descriptionHeight = y - 2 * space;

       var blink = true;
       this.introDescInterval = setInterval(function() {            

            this.textCenter("FIRE TO START", "#00ff00");
            if(blink) {

                this.hideTextCenter();
            } else {
                this.textCenter("FIRE TO START", "#33ff00");
            }
            blink = !blink;
            this.needUpdate = true;

        }.bind(this), 500);        
    }

    setNumerOfLives(numerOfLives) {

        var parent = this.parent;
         // photo scene
        //  if(this.photoRenderTarget === undefined) {

        //     var photoScene = new THREE.Scene();
        //     var photoCamera = new THREE.PerspectiveCamera(45, parent.pixelRatio , 0.01, 500);
        //     photoCamera.position.set(0, 1.5, 0);
        //     photoCamera.lookAt(0, 0,0 );
        //     var hemiLight = new THREE.HemisphereLight(0xffffff, 0x333333);
        //     hemiLight.position.set( 0, 20, 0 );
        //     photoScene.add( hemiLight );
    
        //     var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        //     dirLight.position.set( 20, 50, 0 );
        //     photoScene.add( dirLight );
    
        //     var shipMat = new THREE.MeshPhongMaterial({map:parent.shipTexture1});
        //     var shipMesh = new THREE.Mesh(parent.shipGeometry, shipMat);
        //     shipMesh.scale.set(0.064215, 0.064215, 0.064216 / 2);
        //     photoScene.add(shipMesh);
    
        //     var photoRenderTarget = new THREE.WebGLRenderTarget( 64 , 64);
        //     this.parent.renderer.render(photoScene, photoCamera, photoRenderTarget);

        //     this.photoRenderTarget = photoRenderTarget;
        //  } else {



        //  }
         for(var i in this.numerOfLivecArray) {

            var liveShipMesh = this.numerOfLivecArray[i];
            this.scene.remove(liveShipMesh);
        }
        // ship photo
        var geometry	= new THREE.PlaneGeometry( this.shipPhotoSize, this.shipPhotoSize);
        var material	= new THREE.MeshBasicMaterial({

            map: this.parent.miniShipTexture,
        })

        var numerOfLivecArray = [];
        for(var i = 0; i < numerOfLives; i++) {

        var mesh	= new THREE.Mesh( geometry, material );
        mesh.position.set(-parent.width + (this.shipPhotoSize / 2) + i * this.shipPhotoSize, -parent.height + (this.shipPhotoSize/2),0);
        this.scene.add(mesh);
 //       mesh.visible = false;

        numerOfLivecArray.push(mesh);
        }

        this.numerOfLivecArray = numerOfLivecArray;
        
        this.needUpdate = true;
        return;        
       
    }

    setSize(width, height) {


        var parent = this.parent;
        this.camera.left = -width;
        this.camera.right = width;
        this.camera.top = height;
        this.camera.bottom = -height;
        this.camera.updateProjectionMatrix();

        this.topScore.position.set(0, height - 16, 0);
        this.galagaLogo.position.set(0.0, this.parent.height / 2, 0);
        if(this.descriptionPlanePosition != 0) {

            this.setDescriptionPlanePosition(-this.parent.height + 20);
        }
       
        for(var i = 0; i < this.numerOfLivecArray.length ; i++ ) {

            var liveShipMesh = this.numerOfLivecArray[i];
            liveShipMesh.position.set(-parent.width + (this.shipPhotoSize/2) + i * this.shipPhotoSize, -parent.height + (this.shipPhotoSize/2),0);
        }
        //this.numberOfLives.position.set(-this.parent.width + 40, -this.parent.height + 40,0);
        this.renderTarget.setSize(width, height);
        this.needUpdate = true;
    }

    setScore(val) {

        this.score = val;
        if(this.score > this.record) {

            this.record = this.score;
        }
        this.updateScore();
    }

    setRecord(val) {

        this.record = val;
        this.updateScore();
    }

    updateScore() {

        this.dynamicsTexture.clear().drawText(this.score, 80, 14, 'white');   
        this.dynamicsTexture.drawText("1Up:", 0, 15, 'red');   
        this.dynamicsTexture.drawText("RECORD:", 250, 15, 'red');   
        this.dynamicsTexture.drawText(this.record , 380, 15, 'white');   
        this.needUpdate = true;

    }

    showTopScore(v) {

        this.topScore.visible = v;
        this.needUpdate = true;
        this.updateScore(0);
    }

    showLogo(v) {


        if(v) {

            this.scene.add(this.galagaLogo );   
            this.galagaLogo.visible = true;
        } else {

            this.scene.remove(this.galagaLogo );        
        }
        this.needUpdate = true;
    }

    showNumberOfLives(v) {

        for(var i = 0; i < this.numerOfLivecArray.length ; i++ ) {

            var liveShipMesh = this.numerOfLivecArray[i];
            liveShipMesh.visible = v;
        }
        this.needUpdate = true;
    }

    setDescriptionPlanePosition(y) {

        this.descriptionPlanePosition = y;
        this.descriptionPlane.position.set(0, this.descriptionPlanePosition, 0);  
        this.needUpdate = true;
    }

    render() {

        if( this.needUpdate ) {

            this.parent.renderer.render(this.scene, this.camera, this.renderTarget);
            this.needUpdate = false;
        }
        
    }
}