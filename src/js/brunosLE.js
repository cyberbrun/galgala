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

class brunosLE {

    constructor(resource) {

        this.KEYBOARD_INPUT = 1;
        this.TOUCH_INPUT = 2;
        this.LANDSCAPE = 1;
        this.PORTRAIT = 2;
        
        this.resource = resource;
        this.isReady = false;
        this.frameID = 0;

        this.orbitControls = true;
        this.backgroundColor = 0x000000;
        this.planeEnabled = true;
        this.planeColor = 0x000000;
        this.shadowsEnabled = true;
        this.objects = [];
        this.helpers = [];
        this.goLeft = false;
        this.goRight = false;
        this.goFire = true;
        this.lastTouch = 0.0;   // last touch screen position x 
        this.inputMethod = this.KEYBOARD_INPUT;   // input method 1 keyboard, 2 touch screen
        
        if(this.width > this.height) {

            this.orientation = this.LANDSCAPE;
            this.touchMagnetFactor = 9.7;
        } else {

            this.orientation = this.PORTRAIT;
            this.touchMagnetFactor = 15;
        }
    }

    get width() { // :)O

        if(!this.customContainer) {

            return window.innerWidth;
        } else {

            return this.container.offsetWidth;
        }
        
    }

    get height() {  // :)O

        if(!this.customContainer) {

            return window.innerHeight;
        } else {

            return this.container.offsetHeight;
        }
    }

    get pixelRatio() {

        return this.width / this.height;
    }

    detect() {

		try {

			var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

		} catch ( e ) {

			return false;

		}
    }
    
    detectorError() {

        var container = this.container;

        container.style.fontSize = '18px';
        container.style.width = '400px';
        container.style.margin = '14em auto';
        container.style.background = '#aa0000';
        container.style.textAlign = 'center';
        container.style.color = '#fff';

        container.innerHTML = "Error. unable to create 3D rendering.";
    }    

    initEvents() {

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        document.addEventListener('keydown',this.onDocumentKeyDown.bind(this),false);
        document.addEventListener('keyup',this.onDocumentKeyUp.bind(this),false);
        document.addEventListener('touchstart',this.onTouchStart.bind(this),false);
        document.addEventListener('touchmove',this.onTouchMove.bind(this),false);
        document.addEventListener('touchend', this.onTouchEnd.bind(this), false);
    }

    onTouchMove(e) {

        this.lastTouch = ((e.touches[0].pageX / this.width * 1) - 0.5) * this.touchMagnetFactor * this.pixelRatio;

    }

    onTouchStart(e) {

        this.lastTouch = ((e.touches[0].pageX / this.width * 1) - 0.5) * this.touchMagnetFactor * this.pixelRatio;
        this.inputMethod = this.TOUCH_INPUT;

        this.touchStartMillis =  new Date().getTime();
    }

    onTouchEnd(e) {

        var touchTime = new Date().getTime() - this.touchStartMillis;
        if( touchTime < 100) {

            // "click" om touch screen
            this.onFire();
        }
    }

    onDocumentKeyDown(event) {

        var keycode = event.keyCode;
        switch(keycode) {

            case 17:

                if(this.goFire) {

                    this.onFire();
                    this.goFire = false;
                }
            break;
            case 90:
            case 37:

                this.goLeft = true;
            break;
            case 67:
            case 39:

                this.goRight = true;
            break;
        }
        this.inputMethod = this.KEYBOARD_INPUT;
    }

    onDocumentKeyUp(event) {

        var keycode = event.keyCode;
        switch(keycode) {

            case 17:

                this.goFire = true;
            break;
            case 90:
            case 37:

                this.goLeft = false;
            break;
            case 67:
            case 39:

                this.goRight = false;
            break;

        }
        
    }    
    
    onWindowResize() {

        this.mainCamera.aspect = this.pixelRatio;
        this.mainCamera.updateProjectionMatrix();


        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.setSize(this.width, this.height);  

        if(this.width > this.height) {

            this.orientation = this.LANDSCAPE;
            this.touchMagnetFactor = 9.7;
        } else {

            this.orientation = this.PORTRAIT;
            this.touchMagnetFactor = 15;
        }
    }

    onFire() {



    }

    initRenderer() {

        var width = window.innerWidth || 1;
        var height = window.innerHeight || 1;
        var aspect = width / height;
        var devicePixelRatio = window.devicePixelRatio || 1;

        var renderer = new THREE.WebGLRenderer();
        renderer.physicallyCorrectLights = true;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.setPixelRatio( devicePixelRatio );
        renderer.setSize( width, height );
   //     renderer.autoClearColor = false;
   //     document.body.appendChild( renderer.domElement );
        
        this.container.appendChild(renderer.domElement); 
        this.renderer = renderer;
    }

    onCameraChanged(target) {

// #ifndef RELEASE
   //     this.gui.__controllers[2].setValue(Round(target.position.x, 3) + ', ' + Round(target.position.y, 3) + ', ' + Round(target.position.z, 3));
   //     this.gui.__controllers[3].setValue(Round(target.quaternion.x, 3) + ', ' + Round(target.quaternion.y, 3) + ', ' + Round(target.quaternion.z, 3) + ', ' + Round(target.quaternion.w, 3));
// #endif
    }

    initScenes() {

        var mainScene = new THREE.Scene();
        mainScene.background = new THREE.Color( this.backgroundColor );
 
        var group = new THREE.Group();
        mainScene.add( group );

 //       mainScene.fog = new THREE.Fog( this.backgroundColor, 1.5, 3.5 );
        var bloomScene = new THREE.Scene();
        var bloomGroup = new THREE.Group();
        bloomScene.add( bloomGroup );

        var mainCamera = new THREE.PerspectiveCamera(45, this.pixelRatio , 0.01, 500);
        mainCamera.position.set(cfg.cameraPositionX, cfg.cameraPositionY, cfg.cameraPositionZ);
        
    
        if(this.orbitControls) {

            var camControls = new THREE.OrbitControls(mainCamera, this.renderer.domElement, this.onCameraChanged.bind(this));
            camControls.target.set(-1.587, 0, -3.14);

           camControls.update(); 
        } else {
            
            mainCamera.lookAt(cfg.cameraLookAtX, cfg.cameraLookAtY, cfg.cameraLookAtZ);
        }
        mainCamera.updateProjectionMatrix();
        
        var hemiLight = new THREE.HemisphereLight(0xffffff, 0x333333);
        hemiLight.position.set( 0, 20, 0 );
        mainScene.add( hemiLight );



        var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.name = 'Dir. Light';
        dirLight.position.set( 0, 50, 0 );
   //     dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 5;
        dirLight.shadow.camera.right = 1;
        dirLight.shadow.camera.left = - 1;
        dirLight.shadow.camera.top	= 1;
        dirLight.shadow.camera.bottom = - 1;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.bias = 0.000003;
        //dirLight.layers.set(0);
        mainScene.add( dirLight );

        if(this.planeEnabled) {

            var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 200 ), new THREE.MeshPhongMaterial( { color: this.planeColor, depthWrite: false } ) );
            mesh.rotation.x = - Math.PI / 2;
            mesh.receiveShadow = true;
            mainScene.add( mesh );

        }

        
        // // bloom scene light
        // var pointLight = new THREE.PointLight( 0xffffff, 2.5, 60, 2.0 );
        // pointLight.position.set(0, 50, 0);
        // bloomScene.add( pointLight );
        // this.bloomPointlight = pointLight;


        this.showHelpers(cfg.showHelpers);



        this.mainScene = mainScene;
        this.mainCamera = mainCamera;
        this.bloomScene = bloomScene;
        this.hemiLight = hemiLight;
        this.dirLight = dirLight;
        this.mainGroup = group;
        this.bloomGroup = bloomGroup;
    }

    showHelpers(v) {

        if(v) {

            var gridHelper = new THREE.GridHelper(10, 40, 0x3f3f3f, 0x3f3f3f);
            gridHelper.material.opacity = 0.5;
            gridHelper.material.transparent = true;
            
            var axesHelper = new THREE.AxesHelper( 100 )
            
            var dirLightHeper = new THREE.DirectionalLightHelper( this.dirLight, 10 );
           
            this.dirLight.shadowCameraHelper = new THREE.CameraHelper( this.dirLight.shadow.camera );
            
            var hemiLightHelper = new THREE.HemisphereLightHelper( this.hemiLight, 10 );

            //space chelper
            var spaceSizze = 10;
            var geometry = new THREE.BoxGeometry( spaceSizze, spaceSizze, spaceSizze );
            var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
            var spaceHelper = new THREE.Mesh( geometry, material );
           
            var cameraHelper = new THREE.CameraHelper( this.mainCamera );
                 
            this.mainScene.add( axesHelper );
            this.mainScene.add( gridHelper);
            this.mainScene.add( dirLightHeper );
            this.mainScene.add( this.dirLight.shadowCameraHelper );
            this.mainScene.add( hemiLightHelper );   
            this.mainScene.add( spaceHelper );
            this.mainScene.add( cameraHelper );
            this.helpers.push(axesHelper);    
            this.helpers.push(gridHelper);
            this.helpers.push(dirLightHeper);
            this.helpers.push( this.dirLight.shadowCameraHelper);
            this.helpers.push(hemiLightHelper);   
            this.helpers.push(spaceHelper);   
            this.helpers.push(cameraHelper);   

        } else {

            this.helpers.forEach(function(helper) {

                this.mainScene.remove(helper);
            }.bind(this))
        }
     
        
    }

    initGUI() {


    }


    initObjects() {

        this.isReady = true;
    }

    loadObjectsCallback(msg) {

        console.log(msg.message);
    }

    getResourceData(name) {

        for(var i in this.resourceDecoded) {
    
            if(this.resourceDecoded[i].name == name) {
    
                return this.resourceDecoded[i].data;
            }
        }
        return null;
    }
    

    resourcceToGeometry(name) {

        var loader = new THREE.JSONLoader(); 
        var data = this.getResourceData(name);

        try {

            return loader.readFromJSON(JSON.parse(data)).geometry;
        } catch(e) {

            return null;
        }
    }

    resourceToImgSrc(name) {

        return `data:image/png;charset=utf-8;base64, ${this.getResourceData(name)}`;
    }

    checkItemsLoaded() {

        return true;

    }

    loadObjects() {



        this.downloadManager = new THREE.LoadingManager();     
        this.downloadManager.onProgress = function(item, loaded, total) {
// #ifndef RELEASE
           console.log('Manager:', loaded, total, item)
// #endif           
        }       
        this.downloadManager.onLoad = function () {
// #ifndef RELEASE
            console.log('All items loaded.');
// #endif   

            var checkInterval = setInterval(function(){

                if(this.checkItemsLoaded()) {

                    this.initObjects();
                    clearInterval(checkInterval);
                };

            }.bind(this), 1000);


           
        }.bind(this);
        this.downloadManager.onError = function (url) {

            console.log('Error while loading: ' + url);
        }.bind(this);
        

        this.textureLoader = new THREE.TextureLoader( this.downloadManager);   
        this.fbxLoader = new THREE.FBXLoader(this.downloadManager);
        this.JSONLoader = new THREE.JSONLoader(  this.downloadManager );
        this.GLFTLoader = new THREE.GLTFLoader(this.downloadManager);
        this.GLFTLoader.setCrossOrigin('anonymous');
        this.GLFTLoader.setDRACOLoader( new THREE.DRACOLoader() );
        this.textureCubeLoader = new THREE.CubeTextureLoader(this.downloadManager);
        this.objectLoader = new THREE.ObjectLoader(this.downloadManager);
        this.objLoader = new THREE.OBJLoader(this.downloadManager);
        this.audioLoader = new THREE.AudioLoader(this.downloadManager);
        this.fontLoader = new THREE.FontLoader(this.downloadManager);

        if( this.resource === undefined) {
            
  //          this.initObjects();
            return false;
        }
    }

    run(containerId) {

        if(containerId === undefined) {

            var container = document.createElement('div');
            document.body.appendChild(container);          
        } else {

            var container = document.getElementById(containerId);
            if(container) {

                this.customContainer = true;
            } else {

                return false;
            }
            
        }

        this.container = container;

        if(this.detect()) {

            this.initGUI();
  //       
            this.initRenderer();
            this.initScenes();
            
            this.initEvents();
            
            this.loadObjects();
            
            
           
            return true;
        } else {

            this.detectorError();
            return false;
        }
    }

    render() {

        requestAnimationFrame(this.render.bind(this));

 //       this.renderer.render(this.bloomScene, this.mainCamera);
//        this.bloomComposer.render();
        //this.mainComposer.render();
        
   //     this.stats.update();
        this.frameID++;
    }
}