class Behavior {
    // copy array at the end of dst
    static arrayToArray(dst, array) {
        for (var i in array) {
            dst.push(array[i]);
        }
    }
    // generate path on curve and destination point
    static generateAttackPath(object) { // denerate attack path based on curves from resource in last fly etap. Closer to player shi
        var engine = object.engine;
        var attackId = Math.floor(Math.random() * (engine.attackPaths.length));
        var attackPath = engine.attackPaths[attackId];
        var points = Behavior.getPoinstFromLine(engine.nurms, attackPath.name);
        var bufPoints = new THREE.CatmullRomCurve3(points).getPoints(30); // smooth line 
        var attackPoints = new THREE.CatmullRomCurve3(bufPoints).getPoints(attackPath.points); // final smooth points from buffer
        var pathMinMaxX = Behavior.getPathMixMaxX(attackPoints, 0);
        var offset = (pathMinMaxX[1] - pathMinMaxX[0]) / 2;
        Behavior.translatePoints(attackPoints, engine.ship.position.x);
        var midlePoint1 = new THREE.Vector3(attackPoints[attackPoints.length - 1].x, -0.1, attackPoints[attackPoints.length - 1].z + (Math.random() * 3) + 2);
        var midlePoint2 = new THREE.Vector3(object.position.x, -0.1, object.position.z + (Math.random() * 3) + 2);
        var curve = new THREE.CubicBezierCurve3(attackPoints[attackPoints.length - 1], midlePoint1, midlePoint2, object.position);
        var tp = curve.getPoints(attackPath.approachPoints);
        Behavior.arrayToArray(attackPoints, tp);
        object.status = "attack";
        object.approachSize = attackPath.approachPoints;
        object.setPath(attackPoints);
    }
    static getCurveByName(name, curves) {
        for (var i in curves.children) {
            var curve = curves.children[i];
            if (curve.name == name) {
                return curve;
            }
        }
        return null;
    }
    // getting points from nurms line - alternativ. i cannot find function getPoints for specified line geometry
    static getPoinstFromLine(line, curveName) {
        var curve = this.getCurveByName(curveName, line)
        var positions = curve.geometry.attributes.position.array;
        var m = new THREE.Matrix4().makeRotationFromQuaternion(line.quaternion);
        m.premultiply(new THREE.Matrix4().makeScale(line.scale.x, line.scale.y, line.scale.z));
        var points = [];
        for (var i = 0; i < positions.length; i += 3) {
            var newPoint = new THREE.Vector3(positions[i], -0.1, positions[i + 2]);
            newPoint.applyMatrix4(m);
            points.push(newPoint);
        }
        return points;
    }
    static generatePath(curve, dstPoint, pathParams) {
        var points = this.getPoinstFromLine(curve, pathParams.name);
        var bufPoints = new THREE.CatmullRomCurve3(points).getPoints(20); // smooth line 
        var newPoints = new THREE.CatmullRomCurve3(bufPoints).getPoints(pathParams.curvePoints); // final smooth points from buffer
        var midlePoint = new THREE.Vector3(newPoints[0].x, -0.1, dstPoint.z);
        var curve = new THREE.QuadraticBezierCurve3(dstPoint, midlePoint, newPoints[0]);
        var tp = curve.getPoints(pathParams.finishPoints);
        Behavior.arrayToArray(tp, newPoints);
        return tp;
    }
    // set path to the enemy
    static setPath(path) {
        this.path = path;
        this.pathPos = path.length - 1;
        this.action = "path";
    }
    static setAnimationDuration(enemy) {
        var animationDuration = 1;
        switch (enemy.typeName) {
            case "motylek":
                animationDuration = Math.random() + 1;
                break;
            case "mucha":
                animationDuration = Math.random() + 0.4;
                break;
            case "sowa":
                animationDuration = Math.random() + 0.5;
                break;
            case "motylekAdd":
                animationDuration = Math.random() + 1;
                break;
        }
        enemy.clipAction.setDuration(animationDuration);
    }
    static updateEnemy() {
        if (this.path !== undefined) {
            var engine = this.engine;
            var pos = this.path[this.pathPos];
            var look = this.path[this.pathPos - 1];
            this.position.set(pos.x, pos.y, pos.z);
            this.lookAt(look);
            this.pathPos--;
            if (this.status == "attack") { // follow the ship
                if (this.position.z > -4) {
                    var pathMinMaxX = Behavior.getPathMixMaxX(this.path, 0);
                    var offset = pathMinMaxX[0]; // + ((pathMinMaxX[1] - pathMinMaxX[0]) / 2);
                    var distance = engine.ship.position.x - this.position.x;
                    var interval = distance * this.followShipVolume;
                    //      engine.controlBox.position.x = distance;
                    Behavior.translatePoints(this.path, interval);
                }
            }
            if (this.pathPos == 1) {
                this.path = undefined;
                if (!this.isAdditional) {
                    this.action = "rotation";
                    Behavior.setAnimationDuration(this);
                } else {
                    if (this.status == "release") {
                        Behavior.generateAttackPath(this);
                    } else {
                        this.position.set(this.basePosition.x, this.basePosition.y, this.basePosition.z);
                        this.status = "ready"
                    }
                }
            }
            return true;
        } else if (this.action == "rotation") {
            this.rotation.x *= 0.9;
            this.rotation.y *= 0.9;
            this.rotation.z *= 0.9;
            if ((this.rotation.x < 0.01 && this.rotation.x > -0.01) && (this.rotation.y < 0.01 && this.rotation.y > -0.01) && this.rotation.z < 0.01 && this.rotation.z > -0.01) {
                this.rotation.set(0, 0, 0);
                this.position.set(this.basePosition.x, this.basePosition.y, this.basePosition.z);
                this.status = "ready";
            }
            return false;
        } else {
            return false;
        }
    }
    static getAdditionalMotylek(enemies) {
        for (var i in enemies) {
            var enemy = enemies[i];
            if (enemy.isAdditional && enemy.typeName == "motylekAdd" && enemy.status != "release") {
                return enemy;
            }
        }
        return null;
    }
    static getAdditionalMucha(enemies) {
        for (var i in enemies) {
            var enemy = enemies[i];
            if (enemy.isAdditional && enemy.typeName == "muchaAdd" && enemy.status != "release") {
                return enemy;
            }
        }
        return null;
    }
    static generateAdditionalPath(curve, pathParams) {
        var points = Behavior.getPoinstFromLine(curve, pathParams.name);
        var bufPoints = new THREE.CatmullRomCurve3(points).getPoints(20); // smooth line 
        var newPoints = new THREE.CatmullRomCurve3(bufPoints).getPoints(pathParams.curvePoints); // final smooth points from buffer
        /*
        var points = getPoinstFromLine(curve, attackPath.name);
        var bufPoints =  new THREE.CatmullRomCurve3(points).getPoints(30);      // smooth line 
        var attackPoints =  new THREE.CatmullRomCurve3(bufPoints).getPoints(attackPath.points);  // final smooth points from buffer
    
        translatePoints(attackPoints, dstPoint );
        
        var midlePoint1 = new THREE.Vector3(attackPoints[attackPoints.length-1].x, -0.1, attackPoints[attackPoints.length-1].z + (Math.random() * 3) + 2 );
        var midlePoint2 = new THREE.Vector3(newPoints[0].x, -0.1, newPoints[0].z  + (Math.random() * 3) + 2  );
    
        var curve = new THREE.CubicBezierCurve3(
            attackPoints[attackPoints.length-1],
            midlePoint1,
            midlePoint2,
            newPoints[0]
        );
        var tp = curve.getPoints(100);
        arrayToArray(attackPoints,tp);
        arrayToArray(attackPoints,newPoints);
    */
        return newPoints;
    }
    static getPathMixMaxX(path, startId) { // return minimum anf maximum coordinates of path in x direction
        var minX = 0; //path[startId];
        var maxX = 0; //path[startId];
        var len = path.length;
        for (var i = startId + 1; i < len; i++) {
            var point = path[i];
            if (point.x > maxX) {
                maxX = point.x;
            }
            if (point.x < minX) {
                minX = point.x;
            }
        }
        return [minX, maxX];
    }
    static translatePoints(pointsArray, x) {
        for (var i in pointsArray) {
            var point = pointsArray[i];
            point.x += x;
        }
    }
}
THREE.AdditiveBlendShader = {
    uniforms: {
        "tDiffuse1": {
            type: "t",
            value: null
        },
        "tDiffuse2": {
            type: "t",
            value: null
        }
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: ["uniform sampler2D tDiffuse1;", "uniform sampler2D tDiffuse2;", "varying vec2 vUv;", "void main() {", "vec4 texel1 = texture2D( tDiffuse1, vUv );", "vec4 texel2 = texture2D( tDiffuse2, vUv );", "gl_FragColor = texel1 + texel2;// mix(texel1, texel2, texel2.r + texel2.g + texel2.b);", "}"].join("\n")
};
class brunosLE {
    constructor(resource) {
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
    }
    get width() { // :)O
        if (!this.customContainer) {
            return window.innerWidth;
        } else {
            return this.container.offsetWidth;
        }
    }
    get height() { // :)O
        if (!this.customContainer) {
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
            var canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
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
        document.addEventListener('keydown', this.onDocumentKeyDown.bind(this), false);
        document.addEventListener('keyup', this.onDocumentKeyUp.bind(this), false);
    }
    onDocumentKeyDown() {
        var keycode = event.keyCode;
        switch (keycode) {
            case 17:
                if (this.goFire) {
                    this.onFire();
                    this.goFire = false;
                }
                break;
            case 37:
                this.goLeft = true;
                break;
            case 39:
                this.goRight = true;
                break;
        }
    }
    onDocumentKeyUp() {
        var keycode = event.keyCode;
        switch (keycode) {
            case 17:
                this.goFire = true;
                break;
            case 37:
                this.goLeft = false;
                break;
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
    }
    onFire() {}
    initRenderer() {
        var width = window.innerWidth || 1;
        var height = window.innerHeight || 1;
        var aspect = width / height;
        var devicePixelRatio = window.devicePixelRatio || 1;
        var renderer = new THREE.WebGLRenderer();
        renderer.physicallyCorrectLights = true;
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.setPixelRatio(devicePixelRatio);
        renderer.setSize(width, height);
        renderer.autoClearColor = false;
        //     document.body.appendChild( renderer.domElement );
        this.container.appendChild(renderer.domElement);
        this.renderer = renderer;
    }
    onCameraChanged(target) {
        // cfg.camPosX = target.position.x;
        //     this.gui.__folders.Camera.__controllers[0].setValue(target.position.x) ;//__controllers[0].camPosX = cfg.camPosX;
        //   }
    }
    initScenes() {
        var mainScene = new THREE.Scene();
        mainScene.background = new THREE.Color(this.backgroundColor);
        var group = new THREE.Group();
        mainScene.add(group);
        //       mainScene.fog = new THREE.Fog( this.backgroundColor, 1.5, 3.5 );
        var bloomScene = new THREE.Scene();
        var bloomGroup = new THREE.Group();
        bloomScene.add(bloomGroup);
        var mainCamera = new THREE.PerspectiveCamera(60, this.pixelRatio, 0.01, 500);
        mainCamera.position.x = 0; //-20;    
        mainCamera.position.y = 8;
        mainCamera.position.z = -2;
        //     mainCamera.lookAt(0, 0, 22);        
        if (this.orbitControls) {
            var camControls = new THREE.OrbitControls(mainCamera, this.renderer.domElement, this.onCameraChanged.bind(this));
            camControls.target.set(0, 0.0, -1.2);
            camControls.update();
        } else {
            mainCamera.lookAt(0, 0.0, -1.2);
        }
        var hemiLight = new THREE.HemisphereLight(0xffffff, 0x333333);
        hemiLight.position.set(0, 20, 0);
        mainScene.add(hemiLight);
        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.name = 'Dir. Light';
        dirLight.position.set(0, 50, 0);
        //     dirLight.castShadow = true;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 5;
        dirLight.shadow.camera.right = 1;
        dirLight.shadow.camera.left = -1;
        dirLight.shadow.camera.top = 1;
        dirLight.shadow.camera.bottom = -1;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.bias = 0.000003;
        //dirLight.layers.set(0);
        mainScene.add(dirLight);
        if (this.planeEnabled) {
            var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(200, 200), new THREE.MeshPhongMaterial({
                color: this.planeColor,
                depthWrite: false
            }));
            mesh.rotation.x = -Math.PI / 2;
            mesh.receiveShadow = true;
            mainScene.add(mesh);
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
        if (v) {
            var gridHelper = new THREE.GridHelper(10, 40, 0x3f3f3f, 0x3f3f3f);
            gridHelper.material.opacity = 0.5;
            gridHelper.material.transparent = true;
            var axesHelper = new THREE.AxesHelper(100)
            var dirLightHeper = new THREE.DirectionalLightHelper(this.dirLight, 10);
            this.dirLight.shadowCameraHelper = new THREE.CameraHelper(this.dirLight.shadow.camera);
            var hemiLightHelper = new THREE.HemisphereLightHelper(this.hemiLight, 10);
            //space chelper
            var spaceSizze = 10;
            var geometry = new THREE.BoxGeometry(spaceSizze, spaceSizze, spaceSizze);
            var material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true
            });
            var spaceHelper = new THREE.Mesh(geometry, material);
            var cameraHelper = new THREE.CameraHelper(this.mainCamera);
            this.mainScene.add(axesHelper);
            this.mainScene.add(gridHelper);
            this.mainScene.add(dirLightHeper);
            this.mainScene.add(this.dirLight.shadowCameraHelper);
            this.mainScene.add(hemiLightHelper);
            this.mainScene.add(spaceHelper);
            this.mainScene.add(cameraHelper);
            this.helpers.push(axesHelper);
            this.helpers.push(gridHelper);
            this.helpers.push(dirLightHeper);
            this.helpers.push(this.dirLight.shadowCameraHelper);
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
        var stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);
        this.stats = stats;
    }
    initObjects() {
        this.isReady = true;
    }
    loadObjectsCallback(msg) {
        console.log(msg.message);
    }
    getResourceData(name) {
        for (var i in this.resourceDecoded) {
            if (this.resourceDecoded[i].name == name) {
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
        } catch (e) {
            return null;
        }
    }
    resourceToImgSrc(name) {
        return `data:image/png;charset=utf-8;base64, ${this.getResourceData(name)}`;
    }
    loadObjects() {
        this.downloadManager = new THREE.LoadingManager();
        this.downloadManager.onProgress = function(item, loaded, total) {
            console.log('Manager:', loaded, total)
        }
        this.downloadManager.onLoad = function() {
            console.log('All items loaded.');
            this.initObjects();
        }.bind(this);
        this.downloadManager.onError = function(url) {
            console.log('Error while loading: ' + url);
        }.bind(this);
        this.textureLoader = new THREE.TextureLoader(this.downloadManager);
        this.fbxLoader = new THREE.FBXLoader(this.downloadManager);
        this.JSONLoader = new THREE.JSONLoader(this.downloadManager);
        this.GLFTLoader = new THREE.GLTFLoader(this.downloadManager);
        this.GLFTLoader.setCrossOrigin('anonymous');
        this.GLFTLoader.setDRACOLoader(new THREE.DRACOLoader());
        this.textureCubeLoader = new THREE.CubeTextureLoader(this.downloadManager);
        this.objectLoader = new THREE.ObjectLoader(this.downloadManager);
        this.objLoader = new THREE.OBJLoader(this.downloadManager);
        this.audioLoader = new THREE.AudioLoader(this.downloadManager);
        if (this.resource === undefined) {
            //          this.initObjects();
            return false;
        }
    }
    run(containerId) {
        if (containerId === undefined) {
            var container = document.createElement('div');
            document.body.appendChild(container);
        } else {
            var container = document.getElementById(containerId);
            if (container) {
                this.customContainer = true;
            } else {
                return false;
            }
        }
        this.container = container;
        if (this.detect()) {
            this.initGUI();
            this.render();
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
var cfg = {
    message: 'Galaga config',
    resolution: '',
    showHelpers: false,
    ebableBloom: false,
    bloomRadius: 0.2,
    bloomStrength: 10,
    bloomThreshold: 0.0,
    explosionParticleSize: 1000,
    explosionsSize: 2, // number of explosions in explosions
    autoFire: false,
    autoFireInterval: 15,
    recalculateSizes: function() {}
}

function initGUI(parent) {
    var gui = new dat.GUI();
    gui.remember(cfg);
    gui.load;
    gui.add(cfg, 'message');
    gui.add(cfg, 'resolution');
    gui.add(cfg, 'showHelpers').onChange(function() {
        parent.showHelpers(cfg.showHelpers);
    });
    gui.add(cfg, 'ebableBloom').onChange(function() {
        parent.initEffectComposer(cfg.ebableBloom);
    });
    var bloomFolder = gui.addFolder('Bloom');
    bloomFolder.add(cfg, 'bloomRadius').min(0, 01).max(1).step(0.01).onChange(function() {
        parent.bloomPass.radius = cfg.bloomRadius;
    });
    bloomFolder.add(cfg, 'bloomStrength').min(0, 1).max(10).step(0.1).onChange(function() {
        parent.bloomPass.strength = cfg.bloomStrength;
    });
    bloomFolder.add(cfg, 'bloomThreshold').min(0, 01).max(1).step(0.01).onChange(function() {
        parent.bloomPass.threshold = cfg.bloomThreshold;
    });
    gui.add(cfg, 'autoFire');
    gui.add(cfg, 'autoFireInterval').min(1).max(20).step(1);
    gui.add(cfg, 'recalculateSizes').onChange(function() {
        parent.onWindowResize();
    })
    gui.close();
    parent.showHelpers(cfg.showHelpers);
    return gui;
}
class Explosion {
    constructor(parent) {
        this.parent = parent;
        this.time = 0;
        this.init();
    }
    init() {
        var size = cfg.explosionParticleSize;
        var positions = new Float32Array(size * 3);
        var colors = new Float32Array(size * 3);
        this.sizes = new Float32Array(size);
        this.velocity = new Float32Array(size);
        var colorArray = [new THREE.Vector3(1.0, 1.0, 1.0), new THREE.Vector3(1.0, 1.0, 1.0), new THREE.Vector3(1.0, 1.0, 1.0), new THREE.Vector3(1.0, 1.0, 1.0), new THREE.Vector3(1.0, 1.0, 0.0), new THREE.Vector3(1.0, 0.0, 0.0), ]
        var colorId = 0;
        var radius = 0.0;
        for (var i = 0; i < size; i++) {
            var u = Math.random();
            var v = Math.random();
            var theta = 2 * Math.PI * u;
            var phi = Math.acos(2 * v - 1);
            positions[i * 3 + 0] = (radius * Math.sin(phi) * Math.cos(theta));
            positions[i * 3 + 1] = (radius * Math.sin(phi) * Math.sin(theta));
            positions[i * 3 + 2] = (radius * Math.cos(phi));
            colors[i * 3 + 0] = colorArray[colorId].x;
            colors[i * 3 + 1] = colorArray[colorId].y;
            colors[i * 3 + 2] = colorArray[colorId].z;
            colorId++
            if (colorId >= colorArray.length) {
                colorId = 0;
            }
            this.sizes[i] = Math.random() * 2.7;
            this.velocity[i] = (Math.random() + 1) / 8;
            radius += 0.0003;
        }
        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        this.sizesAttribute = new THREE.BufferAttribute(this.sizes, 1);
        geometry.addAttribute('size', this.sizesAttribute);
        this.velocityAttributes = new THREE.BufferAttribute(this.velocity, 1);
        geometry.addAttribute('velocity', this.velocityAttributes);
        var material = new THREE.ShaderMaterial({
            uniforms: {
                time: {
                    value: 1.0
                },
                texture: {
                    value: this.parent.sparkTexture
                }
            },
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });
        var particle = new THREE.Points(geometry, material);
        particle.position.x = 200;
        this.parent.mainGroup.add(particle);
        this.particle = particle;
    }
    explode(position) {
        this.particle.position.set(position.x, position.y, position.z);
        this.time = 1;
    }
    vertexShader() {
        var vs = `
        
            uniform float time;
            attribute float size;
            attribute float velocity;
            attribute vec3 customColor;
            varying vec3 vColor;
            void main() {
                vColor = customColor;
                vec4 mvPosition = modelViewMatrix * vec4( position * velocity * time, 1.0 );
                gl_PointSize = size;
                gl_Position = projectionMatrix * mvPosition;
            }        
        `;
        return vs;
    }
    fragmentShader() {
        var fs = `
            uniform float time;
            uniform sampler2D texture;
            varying vec3 vColor;
            void main() {

                gl_FragColor = vec4( vColor, 1.0 ) * texture2D( texture, gl_PointCoord );
                gl_FragColor.a = 5.5 / time;
            }        
        `;
        return fs;
    }
    update() {
        this.particle.material.uniforms.time.value = this.time;
        this.time++;
    }
    recreate() {
        for (var i = 0; i < cfg.explosionParticleSize; i++) {
            this.sizes[i] = Math.random() * 2.7;
            this.velocity[i] = (Math.random() + 1) / 8;
        }
        this.particle.geometry.attributes.size.needsUpdate = true;
    }
}
class Explosions {
    constructor(parent) {
        this.parent = parent;
        this.explosionsArray = [];
        this.exploded = [];
        this.init();
    }
    init() {
        for (var i = 0; i < cfg.explosionsSize; i++) {
            this.explosionsArray.push(new Explosion(this.parent));
        }
    }
    getOldestExplosion() {
        var oldestExplosion;
        var time = 0;
        for (var i in this.exploded) {
            var explosion = this.exploded[i];
            if (explosion.time > time) {
                oldestExplosion = explosion;
                time = explosion.time;
            }
        }
        return oldestExplosion;
    }
    explode(position) {
        if (this.explosionsArray.length > 0) {
            var explosion = this.explosionsArray[0];
            explosion.explode(position);
            var index = this.explosionsArray.indexOf(explosion);
            this.explosionsArray.splice(index, 1);
            this.exploded.push(explosion);
        } else {
            var explosion = this.getOldestExplosion();
            explosion.explode(position);
        }
    }
    update() {
        for (var i in this.exploded) {
            var explosion = this.exploded[i];
            explosion.update();
            if (explosion.time > 200) {
                var explosionToRemove = explosion;
            }
        }
        if (explosionToRemove !== undefined) {
            var index = this.exploded.indexOf(explosionToRemove);
            this.exploded.splice(index, 1);
            this.explosionsArray.push(explosionToRemove);
            explosionToRemove.recreate();
        }
    }
}
class PlayerFires {
    constructor(parent, numberOfFires) {
        this.fireArray = [];
        this.firedFire = [];
        this.parent = parent;
        this.numberOfFires = numberOfFires;
        this.init(numberOfFires);
    }
    init(numberOfFires) {
        var parent = this.parent;
        var fireMat = new THREE.MeshLambertMaterial({
            map: parent.fireTexture1
        });
        for (var i = 0; i < numberOfFires; i++) {
            var fireMesh = new THREE.Mesh(parent.fireGeometry, fireMat);
            fireMesh.scale.set(0.02175, 0.02175, 0.02175);
            fireMesh.position.set(-5 - i / 5, 0, -5);
            fireMesh.basePosition = new THREE.Vector3(-5 - i / 5, 0, -5)
            // fireMesh.rotation.y = Math.PI;
            parent.mainGroup.add(fireMesh);
            this.fireArray.push(fireMesh);
            var bbox = new THREE.Box3().setFromObject(fireMesh);
            var geometry = new THREE.BoxGeometry(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z);
            var material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true
            });
            var cube = new THREE.Mesh(geometry, material);
            cube.visible = false;
            cube.position.set(-5 - i / 5, 0, -5);
            parent.mainGroup.add(cube);
            fireMesh.collisionCube = cube;
        }
    }
    fire(position) {
        var parent = this.parent;
        if (this.fireArray.length > 0) {
            if (parent.fireSound.isPlaying) {
                parent.fireSound.stop();
            }
            parent.fireSound.play();
            var fire = this.fireArray[0];
            var index = this.fireArray.indexOf(fire);
            this.fireArray.splice(index, 1);
            fire.position.set(position.x, position.y - 0.1, position.z + 0.1);
            fire.collisionCube.position.set(position.x, position.y - 0.1, position.z + 0.1);
            this.firedFire.push(fire);
        }
    }
    detectCollision(coolisionCube) {
        var originPoint = coolisionCube.position.clone();
        for (var vertexIndex = 0; vertexIndex < coolisionCube.geometry.vertices.length; vertexIndex++) {
            var localVertex = coolisionCube.geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4(coolisionCube.matrix);
            var directionVector = globalVertex.sub(coolisionCube.position);
            var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
            var collisionResults = ray.intersectObjects(this.parent.enemies);
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                this.parent.onCollision(collisionResults);
                return true;
            };
        };
        return false;
    }
    update() {
        var fireToRemove;
        for (var i in this.firedFire) {
            var fire = this.firedFire[i];
            fire.position.z += 0.2;
            fire.collisionCube.position.z += 0.2;
            if (this.detectCollision(fire.collisionCube)) {
                fireToRemove = fire;
            }
            if (fire.position.z > 5) {
                fireToRemove = fire;
            }
        }
        if (fireToRemove !== undefined) {
            var index = this.firedFire.indexOf(fireToRemove);
            this.firedFire.splice(index, 1);
            this.fireArray.push(fireToRemove);
            fireToRemove.position.set(fireToRemove.basePosition.x, fireToRemove.basePosition.y, fireToRemove.basePosition.z);
            fireToRemove.collisionCube.position.set(fireToRemove.basePosition.x, fireToRemove.basePosition.y, fireToRemove.basePosition.z);
        }
    }
}
class EnemyFires {
    constructor(parent, numberOfFires) {
        this.parent = parent;
        this.numberOfFires = numberOfFires;
        this.fireArray = [];
        this.firedFire = [];
        this.init(numberOfFires);
    }
    init(numberOfFires) {
        var parent = this.parent;
        var fireMat = new THREE.MeshLambertMaterial({
            map: parent.enemyFireTexture1
        });
        for (var i = 0; i < numberOfFires; i++) {
            var fireMesh = new THREE.Mesh(parent.fireGeometry, fireMat);
            fireMesh.scale.set(0.0175, 0.0175, 0.0175);
            fireMesh.position.set(-5 - i / 5, 0, -0.5);
            fireMesh.basePosition = new THREE.Vector3(-5 - i / 5, 0, 0);
            fireMesh.direction = 0.0;
            parent.mainGroup.add(fireMesh);
            this.fireArray.push(fireMesh);
        }
    }
    fire(startPosition, targetPosition) {
        if (this.fireArray.length > 0) {
            var fire = this.fireArray[0];
            var index = this.fireArray.indexOf(fire);
            this.fireArray.splice(index, 1);
            fire.position.set(startPosition.x, startPosition.y - 0.1, startPosition.z);
            this.firedFire.push(fire);
        }
    }
    update() {
        var fireToRemove;
        for (var i in this.firedFire) {
            var fire = this.firedFire[i];
            fire.position.z -= 0.1;
            if (fire.position.z < -5) {
                fireToRemove = fire;
            }
        }
        if (fireToRemove !== undefined) {
            var index = this.firedFire.indexOf(fireToRemove);
            this.firedFire.splice(index, 1);
            this.fireArray.push(fireToRemove);
            fireToRemove.position.set(fireToRemove.basePosition.x, fireToRemove.basePosition.y, fireToRemove.basePosition.z);
        }
    }
}
class Stars {
    constructor(parent) {
        this.parent = parent;
        this.amount = 1000;
        this.time = 1;
        this.init();
    }
    init() {
        var positions = new Float32Array(this.amount * 3);
        var colors = new Float32Array(this.amount * 3);
        var sizes = new Float32Array(this.amount);
        var velocity = new Float32Array(this.amount);
        var colorArray = [new THREE.Vector3(0.10, 0.30, 0.64), new THREE.Vector3(0.15, 0.42, 0.68), new THREE.Vector3(0, 0.16, 0.51)]
        var colorId = 0;
        for (var i = 0; i < this.amount; i++) {
            positions[i * 3 + 0] = (Math.random() * 2 - 1) * 10;
            positions[i * 3 + 1] = (Math.random() * 2 - 1);
            positions[i * 3 + 2] = (Math.random() * 2 - 1) * 5;
            colors[i * 3 + 0] = colorArray[colorId].x;
            colors[i * 3 + 1] = colorArray[colorId].y;
            colors[i * 3 + 2] = colorArray[colorId].z;
            colorId++
            if (colorId >= colorArray.length) {
                colorId = 0;
            }
            sizes[i] = Math.random() * 8;
            velocity[i] = (Math.random() + 1);
        }
        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.addAttribute('velocity', new THREE.BufferAttribute(velocity, 1));
        var material = new THREE.ShaderMaterial({
            uniforms: {
                time: {
                    value: 1.0
                },
                texture: {
                    value: this.parent.sparkTexture
                }
            },
            vertexShader: this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });
        var particle = new THREE.Points(geometry, material);
        this.parent.mainGroup.add(particle);
        this.particle = particle;
    }
    vertexShader() {
        var vs = `
        
            uniform float time;
            attribute float size;
            attribute float velocity;
            attribute vec3 customColor;
            varying vec3 vColor;
            void main() {
                vColor = customColor;
                vec3 p = position;
                p.z -= time / 100.0;
                vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
                gl_PointSize = size;
                gl_Position = projectionMatrix * mvPosition;
            }        
        `;
        return vs;
    }
    fragmentShader() {
        var fs = `
            uniform sampler2D texture;
            varying vec3 vColor;
            void main() {

                gl_FragColor = vec4( vColor, 1.0 ) * texture2D( texture, gl_PointCoord );
            }        
        `;
        return fs;
    }
    update() {
        this.particle.material.uniforms.time.value = this.time;
        this.time += 1;
        if (this.time > 1200) {
            this.time = -800;
        }
    }
}
class StarField {
    constructor(parent) {
        this.parent = parent;
        this.stars1 = new Stars(parent);
        this.stars2 = new Stars(parent);
        this.stars2.time = -1000;
    }
    update() {
        this.stars1.update();
        this.stars2.update();
    };
}
// return enemy without path 
function getNotFlyEnemy(enemies) {
    var noPath = 0;
    for (var i in enemies) {
        var enemy = enemies[i];
        if (enemy.path === undefined) {
            noPath++;
        }
    }
    if (noPath == 0) {
        return;
    }
    do {
        var enemy = enemies[Math.floor(Math.random() * enemies.length)];
    } while (enemy.path !== undefined)
    return enemy;
}
THREE.EmissiveExtractShader = {
    uniforms: {
        "uEmissiveMap": {
            type: "t",
            value: null
        },
    },
    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
    fragmentShader: [`
            uniform sampler2D uEmissiveMap;

            varying vec2 vUv;
            
            void main() { 

                gl_FragColor = texture2D( uEmissiveMap, vUv );
            }`].join("\n")
}
class galaga extends brunosLE {
    constructor(resource) {
        super(resource);
        //        this.SHIP_MAX_ROTATION  = Math.PI
        this.NUMBER_OF_FIRES = 10;
        this.enemies = [];
        this.shipSpeed = 0.05;
        this.orbitControls = false;
        this.shipRotation = 0;
        this.actualExpSound;
        this.volume = 0.1;
        this.dateTime = new Date();
        this.schedulerTimer = 0;
        this.autoFireTimer = 0;
        this.pathId = 2; // release enemies path id
        this.enemyToReleaseId = 0; // enemy id to release form this.enemies array
        this.action = "release"; // scheduler action 1st release enemies
        this.delayTimer = 0; // delay timer between scheduler actions
        this.additionalToRelease = 8; // additional enemies to release
        this.releasedAdditional = 0; // number of aadditional enemies released after ordered enemies
        this.additionalMucha = false; // kind of additional object to be released mucha or motylek
        this.firstSchedulerCall = true; // some artefact with first call scheduler
    }
    initScenes() {
        this.backgroundColor = 0x000000;
        this.planeEnabled = false;
        this.planeColor = 0x121212;
        this.shadowsEnabled = true;
        super.initScenes();
    }
    initGUI() {
        this.gui = initGUI(this);
        super.initGUI();
    }
    initOrder() {
        var muchaMatA = new THREE.MeshPhongMaterial({
            map: this.muchaTexture1,
            skinning: true,
            alphaTest: 0.4,
            side: THREE.DoubleSide
        });
        var motylekMatA = new THREE.MeshPhongMaterial({
            map: this.motylekTexture1,
            skinning: true,
            alphaTest: 0.4,
            side: THREE.DoubleSide
        });
        var sowaMatA = new THREE.MeshPhongMaterial({
            map: this.sowaTexture1,
            skinning: true
        });
        this.sowaHitMat = new THREE.MeshPhongMaterial({
            map: this.sowaTexture2,
            skinning: true
        });
        var m = new THREE.Matrix4().makeRotationY(-Math.PI / 2);
        m.premultiply(new THREE.Matrix4().makeScale(0.3, 0.3, 0.3));
        m.premultiply(new THREE.Matrix4().makeTranslation(0.0, 0.0, 1.0));
        //       this.mainGroup.add(this.orderGeometry);
        var orderedEnemies = 0; // number of enemies in order - not additional enemies
        var additionalMouchaSize = 0;
        var additionalMotylekSize = 0;
        for (var i = 0; i < this.orderGeometry.children.length; i++) {
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
            switch (type) {
                case "motylek":
                    geometry = this.motylekGeometry;
                    material = motylekMatA;
                    animationDuration = Math.random() + 1;
                    typeName = "motylek";
                    orderedEnemies++;
                    break;
                case "mucha":
                    geometry = this.muchaGeometry;
                    material = muchaMatA;
                    animationDuration = Math.random() + 0.4;
                    typeName = "mucha";
                    orderedEnemies++;
                    break;
                case "sowa":
                    geometry = this.sowaGeometry;
                    material = sowaMatA;
                    animationDuration = Math.random() + 0.5;
                    typeName = "sowa";
                    orderedEnemies++;
                    break;
                case "motylekAdd":
                    geometry = this.motylekGeometry;
                    material = motylekMatA;
                    animationDuration = Math.random() + 1;
                    typeName = "motylekAdd";
                    isAdditional = true;
                    additionalMotylekSize++;
                    break;
                case "muchaAdd":
                    geometry = this.muchaGeometry;
                    material = muchaMatA;
                    animationDuration = Math.random() + 1;
                    typeName = "muchaAdd";
                    isAdditional = true;
                    additionalMouchaSize++;
                    break;
                default:
                    geometry = this.motylekGeometry;
                    material = motylekMatA;
                    break;
            }
            var mesh = new THREE.SkinnedMesh(geometry, material);
            mesh.scale.set(0.013, 0.013, 0.013);
            mesh.rotation.y = rotation;
            mesh.position.set(-i - 5, 0, 0);
            if (!isAdditional) {
                mesh.basePosition = new THREE.Vector3(position.x, position.y - 0.1, position.z);
            } else {
                mesh.basePosition = new THREE.Vector3(i - 5, 0, 0);
            }
            mesh.typeName = typeName;
            mesh.update = Behavior.updateEnemy;
            mesh.setPath = Behavior.setPath;
            mesh.status = "generated";
            mesh.isAdditional = isAdditional;
            mesh.engine = this;
            mesh.followShipVolume = 0; // enemy follow the ship increment x volume
            if (mesh.typeName == "sowa") {
                mesh.hitCount = 0;
            }
            this.mainGroup.add(mesh);
            this.enemies.push(mesh);
            var clip = mesh.geometry.animations[0];
            var action = this.mixer.clipAction(clip, mesh); //.setDuration( animationDuration ).play();
            action.setDuration(animationDuration).play()
            mesh.clipAction = action;
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
        this.mainCamera.add(listener);
        var fireSound = new THREE.Audio(listener);
        fireSound.setBuffer(this.shipFireOgg);
        fireSound.setLoop(false);
        fireSound.setVolume(this.volume);
        var muchaExpSound = new THREE.Audio(listener);
        muchaExpSound.setBuffer(this.muchaExpOgg);
        muchaExpSound.setLoop(false);
        muchaExpSound.setVolume(this.volume);
        var motylekExpSound = new THREE.Audio(listener);
        motylekExpSound.setBuffer(this.motylekExpOgg);
        motylekExpSound.setLoop(false);
        motylekExpSound.setVolume(this.volume);
        var sowaHitSound = new THREE.Audio(listener);
        sowaHitSound.setBuffer(this.sowaHitOgg);
        sowaHitSound.setLoop(false);
        sowaHitSound.setVolume(this.volume);
        var sowaExpSound = new THREE.Audio(listener);
        sowaExpSound.setBuffer(this.sowaExpOgg);
        sowaExpSound.setLoop(false);
        sowaExpSound.setVolume(this.volume);
        this.fireSound = fireSound;
        this.muchaExpSound = muchaExpSound;
        this.motylekExpSound = motylekExpSound;
        this.sowaHitSound = sowaHitSound;
        this.sowaExpSound = sowaExpSound;
    }
    initObjects() {
        var scale = 0.01;
        this.mixer = new THREE.AnimationMixer(this.mainScene);
        this.clock = new THREE.Clock();
        //        createMany(this.muchaGeometry, muchaMatA, scale, 100, 10, this.objects,  this.mainGroup, 1, -3, 0);
        //        createMany(this.motylekGeometry, motylekMatA, scale, 100, 10, this.objects,  this.mainGroup, 1,  3, -3);  
        //        createMany(this.sowaGeometry, sowaMatA, scale, 100, 10, this.objects,  this.mainGroup, 1,  0, -3);
        // for(var i in this.objects) {
        //     var object = this.objects[i];
        //     if(object.geometry.animations !== undefined ) {
        //         var clip = object.geometry.animations[ 0 ];
        //         this.mixer.clipAction( clip, object ).setDuration( Math.random() + 1 ).play();
        //     }
        // }
        this.initSound();
        this.initOrder();
        this.initFire();
        var shipMat = new THREE.MeshLambertMaterial({
            map: this.shipTexture1
        });
        var shipMesh = new THREE.Mesh(this.shipGeometry, shipMat);
        shipMesh.scale.set(0.015, 0.015, 0.016);
        shipMesh.rotation.y = Math.PI;
        shipMesh.position.set(0, 0, -5)
        this.mainGroup.add(shipMesh);
        var m = new THREE.Matrix4().makeRotationY(Math.PI / 2);
        m.premultiply(new THREE.Matrix4().makeScale(0.7, 0.7, 0.7));
        this.nurms.applyMatrix(m);
        //        this.explosion = new Explosion(this);
        this.starfield = new StarField(this);
        this.explosions = new Explosions(this);
        var skyGeometry = new THREE.CubeGeometry(100, 100, 100);
        var skyMaterial = new THREE.MeshFaceMaterial(this.skyBoxMaterialArray);
        var skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.mainGroup.add(skybox);
        this.skybox = skybox;
        //    this.mainGroup.add(this.nurms);
        this.paths = [{
            name: "leftCircle",
            curvePoints: 200,
            finishPoints: 50
        }, {
            name: "rightCircle",
            curvePoints: 200,
            finishPoints: 50
        }, {
            name: "upDownLeft",
            curvePoints: 120,
            finishPoints: 40
        }, {
            name: "upDownRight",
            curvePoints: 120,
            finishPoints: 40
        }, {
            name: "upDownLeftDouble",
            curvePoints: 120,
            finishPoints: 40
        }, {
            name: "upDownRightDouble",
            curvePoints: 120,
            finishPoints: 40
        }];
        this.attackPaths = [{
                name: "motylekZigZag",
                points: 110,
                approachPoints: 100
            }, {
                name: "motylekZigZag1",
                points: 110,
                approachPoints: 100
            }, {
                name: "Loop",
                points: 100,
                approachPoints: 100
            }, {
                name: "Loop1",
                points: 100,
                approachPoints: 100
            }
            // {name: "wave", points: 150, approachPoints:50},
            // {name: "wave1", points: 150, approachPoints: 50}
        ];
        // var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
        // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
        // var cube = new THREE.Mesh( geometry, material );
        // cube.position.z = -4;
        // this.controlBox = cube;
        //        this.mainGroup.add(cube);
        //     this.mainGroup.add(pointsMesh);
        //     this.mainScene.add(this.nurms);
        //     this.curves.scale.set(0.5, 0.5, 0.5);
        //     this.curves.layers.set(1);
        //    this.mainScene.add(this.curves);
        // var geometry = new THREE.Geometry().setFromPoints( path );
        // var material = new THREE.PointsMaterial( { size: 0.1 } );        
        // var pointsMesh = new THREE.Points( geometry, material );
        //    
        this.initEffectComposer(cfg.ebableBloom);
        this.ship = shipMesh;
        this.isReady = true;
    }
    setFlyAnimationDuration(enemy) {
        var animationDuration = 1;
        switch (enemy.typeName) {
            case "motylek":
                animationDuration = Math.random() * 0.25 + 0.1;
                break;
            case "mucha":
                animationDuration = Math.random() * 0.1 + 0.1;
                break;
            case "sowa":
                animationDuration = Math.random() * 0.2 + 0.3;
                break;
            case "motylekAdd":
                animationDuration = Math.random() * 0.25 + 0.1;
                break;
        }
        enemy.clipAction.setDuration(animationDuration);
    }
    runScheduler() {
        if (this.firstSchedulerCall) {
            this.firstSchedulerCall = false;
            return;
        }
        switch (this.action) {
            case "release": // release enemies who stay in order 
                var enemy = this.enemies[this.enemyToReleaseId];
                if (enemy !== undefined) {
                    enemy.status = "release";
                    var orderPos = this.getOrderPosition(enemy.basePosition.x, enemy.basePosition.z, this.paths[this.pathId].curvePoints + this.paths[this.pathId].finishPoints)
                    var path = Behavior.generatePath(this.nurms, new THREE.Vector3(orderPos.x, -0.10, orderPos.z), this.paths[this.pathId]);
                    enemy.setPath(path);
                    this.setFlyAnimationDuration(enemy);
                    this.enemyToReleaseId++;
                    if (this.enemyToReleaseId % this.enemiesToRelease == 0) {
                        this.pathId++;
                        if (this.pathId > this.paths.length - 1) {
                            this.pathId = 0;
                        }
                        this.releasedAdditional = 0;
                        this.additionalMucha = !this.additionalMucha;
                        this.action = "releaseadd";
                    }
                }
                break;
            case "releaseadd": // relase additional enemies 
                if (this.releasedAdditional < this.additionalToRelease) {
                    var additional;
                    if (this.additionalMucha) {
                        additional = Behavior.getAdditionalMucha(this.enemies);
                    } else {
                        additional = Behavior.getAdditionalMotylek(this.enemies);
                    }
                    if (additional != null) {
                        additional.status = "release";
                        additional.followShipVolume = Math.random() * 0.04;
                        this.setFlyAnimationDuration(additional);
                        var bufPathId = 0;
                        if (this.pathId != 0) {
                            bufPathId = this.pathId - 1;
                        } else {
                            bufPathId = this.paths.length - 1;
                        }
                        var attackId = Math.floor(Math.random() * (this.attackPaths.length));
                        var path = Behavior.generateAdditionalPath(this.nurms, this.paths[bufPathId]);
                        additional.setPath(path);
                        this.releasedAdditional++;
                    } else {
                        this.action = "delay";
                        this.delayTimer = 0;
                    }
                } else {
                    this.action = "delay";
                    this.delayTimer = 0;
                    if (this.enemyToReleaseId >= this.orderedEnemies) { // end release entirie enemies
                        this.action = "game";
                        break;
                    }
                }
                break;
            case "game":
                break;
            case "delay":
                if (this.delayTimer > 20) {
                    this.action = "release";
                }
                this.delayTimer++;
                break;
        }
    }
    loadObjects() {
        super.loadObjects();
        var textureLoader = new THREE.TextureLoader(this.downloadManager);
        this.muchaTexture1 = textureLoader.load('assets/textures/muchadefault/mucha128A.png');
        this.motylekTexture1 = textureLoader.load('assets/textures/motylek/motylek128.png');
        this.sowaTexture1 = textureLoader.load('assets/textures/sowa/sowa128.png');
        this.sowaTexture2 = textureLoader.load('assets/textures/sowa/sowa128h.png');
        this.shipTexture1 = textureLoader.load('assets/textures/ship/shipc128.png');
        this.fireTexture1 = textureLoader.load('assets/textures/fire/fire64.png');
        this.fireTexture1.magFilter = THREE.NearestFilter;
        this.fireTexture1.minFilter = THREE.NearestFilter;
        this.enemyFireTexture1 = textureLoader.load('assets/textures/fire/enemyfire64.png');
        this.enemyFireTexture1.magFilter = THREE.NearestFilter;
        this.enemyFireTexture1.minFilter = THREE.NearestFilter;
        this.sparkTexture = textureLoader.load('assets/textures/sprites/spark1.png');
        // this.fbxLoader.load( 'assets/curves/asciifbx.fbx', function ( object ) {
        //     this.curves = object;
        // }.bind(this));
        this.objLoader.load('assets/curves/nurms.obj', function(object) {
            this.nurms = object;
        }.bind(this));
        this.JSONLoader.load('assets/models/mucha.json', function(object) {
            var m = new THREE.Matrix4().makeRotationY(-Math.PI);
            object.applyMatrix(m);
            this.muchaGeometry = object;
        }.bind(this));
        this.JSONLoader.load('assets/models/motylek.json', function(object) {
            this.motylekGeometry = object;
        }.bind(this));
        this.JSONLoader.load('assets/models/ship.json', function(object) {
            this.shipGeometry = object;
        }.bind(this))
        this.JSONLoader.load('assets/models/sowa.json', function(object) {
            this.sowaGeometry = object;
        }.bind(this))
        this.JSONLoader.load('assets/models/fire.json', function(object) {
            this.fireGeometry = object;
        }.bind(this))
        this.objectLoader.load('assets/models/order.json', function(object) {
            this.orderGeometry = object;
        }.bind(this))
        this.audioLoader.load('assets/sound/fire.ogg', function(buffer) {
            this.shipFireOgg = buffer;
        }.bind(this));
        this.audioLoader.load('assets/sound/motylekexp.ogg', function(buffer) {
            this.motylekExpOgg = buffer;
        }.bind(this));
        this.audioLoader.load('assets/sound/muchaexp.ogg', function(buffer) {
            this.muchaExpOgg = buffer;
        }.bind(this));
        this.audioLoader.load('assets/sound/sowahit.ogg', function(buffer) {
            this.sowaHitOgg = buffer;
        }.bind(this));
        this.audioLoader.load('assets/sound/sowaexp.ogg', function(buffer) {
            this.sowaExpOgg = buffer;
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
            this.skyBoxMaterialArray.push(new THREE.MeshBasicMaterial({
                map: textureLoader.load(urls[i]),
                side: THREE.BackSide
            }));
        }
    }
    initEffectComposer(isBloomEnabled) {
        var bloomRenderTarget = new THREE.WebGLRenderTarget(this.width, this.height);
        var bloomComposer = new THREE.EffectComposer(this.renderer, bloomRenderTarget);
        var clearPass = new THREE.ClearPass(0x000000, 1);
        bloomComposer.addPass(clearPass);
        if (isBloomEnabled) {
            var emissivePass = new THREE.RenderPass(this.mainScene, this.mainCamera);
            bloomComposer.addPass(emissivePass);
            var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.width, this.height), cfg.bloomStrength, cfg.bloomRadius, cfg.bloomThreshold);
            bloomComposer.addPass(bloomPass);
        }
        var composer = new THREE.EffectComposer(this.renderer);
        //       var cubeTexturePass = new THREE.CubeTexturePass( this.mainCamera );
        //       cubeTexturePass.envMap = this.textureCube
        //       composer.addPass( cubeTexturePass );        
        var clearPass = new THREE.ClearPass(0x000000, 1);
        composer.addPass(clearPass);
        var renderPass = new THREE.RenderPass(this.mainScene, this.mainCamera);
        renderPass.clear = false;
        composer.addPass(renderPass);
        var outputPass = new THREE.ShaderPass(THREE.AdditiveBlendShader, "tDiffuse1");
        outputPass.uniforms['tDiffuse2'].value = bloomComposer.renderTarget2.texture;
        outputPass.renderToScreen = true;
        composer.addPass(outputPass);
        this.composer = composer;
        this.bloomComposer = bloomComposer;
        this.renderPass = renderPass;
        this.bloomPass = bloomPass;
        this.emissivePass = emissivePass;
        this.gui.__controllers[1].setValue(`${this.width}x${this.height}`);
    }
    onWindowResize() {
        super.onWindowResize();
        this.composer.setSize(this.width, this.height);
        this.gui.__controllers[1].setValue(`${this.width}x${this.height}`);
    }
    updateShip() {
        var ship = this.ship;
        if (this.goLeft) {
            ship.position.x += this.shipSpeed;
            this.shipRotation += 0.1;
        }
        if (this.goRight) {
            ship.position.x -= this.shipSpeed;
            this.shipRotation -= 0.1;
        }
        this.shipRotation *= 0.85;
        ship.rotation.z = this.shipRotation;
        //     this.skybox.rotation.z = -this.shipRotation / 5;
    }
    onFire() {
        this.playerFires.fire(this.ship.position);
    }
    onCollision(collisionResult) {
        var object = collisionResult[0].object;
        if (this.actualExpSound !== undefined && this.actualExpSound.isPlaying) {
            this.actualExpSound.stop();
        }
        var explode = true;
        var explodePosition = object.position.clone();
        switch (object.typeName) {
            case "motylekAdd":
                this.actualExpSound = this.motylekExpSound;
                object.position.set(object.basePosition.x, object.basePosition.y, object.basePosition.z);
                object.path = undefined;
                object.status = "ready"
                break;
            case "muchaAdd":
                this.actualExpSound = this.muchaExpSound;
                object.position.set(object.basePosition.x, object.basePosition.y, object.basePosition.z);
                object.path = undefined;
                object.status = "ready"
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
                if (object.hitCount == 0) {
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
        if (explode) {
            this.explosions.explode(explodePosition);
            // var index = this.enemies.indexOf(object);
            // this.enemies.splice(index, 1);
            // this.mainScene.remove(object);
        }
        this.actualExpSound.play();
    }
    getOrderPosition(baseX, baseZ, timeShift) {
        var scalePosition = ((Math.sin((this.frameID + timeShift) / 150) + 3.5) * 0.3);
        var translatePosition = (Math.sin((this.frameID + timeShift) / 500)) * 3;
        return {
            x: (baseX * scalePosition) + translatePosition,
            z: baseZ * scalePosition
        }
    }
    updateEnemy() {
        for (var i in this.enemies) {
            var enemy = this.enemies[i];
            if (!enemy.update()) { // if not updated (walk throught path) update order position
                if (enemy.status != "generated" && !enemy.isAdditional) {
                    var position = this.getOrderPosition(enemy.basePosition.x, enemy.basePosition.z, 0);
                    enemy.position.x = position.x;
                    enemy.position.z = position.z;
                }
            }
        }
    }
    updateTimers() {
        if (this.frameID - this.schedulerTimer > 12) {
            this.runScheduler();
            this.schedulerTimer = this.frameID;
        }
        if (cfg.autoFire && this.frameID - this.autoFireTimer > cfg.autoFireInterval) {
            this.onFire();
            this.autoFireTimer = this.frameID;
        }
        //   this.autoFireTimer
    }
    render() {
        requestAnimationFrame(this.render.bind(this));
        this.stats.begin();
        if (this.isReady) {
            if (cfg.ebableBloom) {
                this.hemiLight.intensity = 0;
                this.dirLight.intensity = 0;
                this.bloomComposer.render();
                this.hemiLight.intensity = 1;
                this.dirLight.intensity = 1;
                this.composer.render();
            } else {
                this.composer.render();
            }
            this.mixer.update(this.clock.getDelta());
            this.updateTimers();
            this.updateShip();
            this.playerFires.update();
            this.explosions.update();
            this.starfield.update();
            this.skybox.rotation.x += 0.0005;
            this.updateEnemy();
        }
        this.stats.end();
        this.frameID++;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    var app = new galaga(document.body, location);
    app.run();
});
