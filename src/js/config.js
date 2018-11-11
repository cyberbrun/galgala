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

var cfg = {
    message: 'Galaga config',
    resolution: '',
    playerImmortal: true,
    cameraPositionX: 0.0,
    cameraPositionY: 12,
    cameraPositionZ: -3.34,
    cameraLookAtX: 0,
    cameraLookAtY: -5.94,
    cameraLookAtZ: 0,
    showHelpers: false,
    ebableBloom: false,
    bloomRadius: 0.14,
    bloomStrength: 3.4,
    bloomThreshold: 0.1,
    explosionParticleSize: 1000,
    explosionsSize: 2,       // number of explosions in explosions
    autoFire: false,
    autoFireInterval: 10,
    fireBehavior: 500,      // propability of release fire by enemy
    fireSpeed: 0.11,
    orderPositionTranslate: 4,    // orgrt position translate - order osilation 
    orderPositionTranslateSpeed: 200,
    orderGeometryTralslateZ: 1,   // translate z of box model order geometry
    playerFireToRemoveZ: 10.0,       // z position of player fire when is going to remove from fired fire
    enemyFireToRemoveZ: -7,          // z position of enemy fire when removed from fired fire
    enemyExplosionSize: 2.7,
    enemyExplosionVelocity: 0.08,
    captionsPositionY: -1,
    soundVolume: 0.1,
    // defaults  portrait
    portraitCameraPositionY:  19    ,
    portraitCameraLookAtZ: 2.23,
    portraitOrderPositionTranslate: 0.4,
    portraitOrderPositionTranslateSpeed: 50,
    portraitOrderGeometryTralslateZ: 5.0,
    portraitplayerFireToRemoveZ: 10,
    portraitenemyFireToRemoveZ: -7,
    portraitCaptionsPositionY: 1,
    // defaults landscape
    landscapeCameraPositionY:  12    ,
    landscapeCameraLookAtZ: 0,
    landscapeOrderPositionTranslate: 4,
    landscapeOrderPositionTranslateSpeed: 200,
    landscapeOrderGeometryTralslateZ: 1,
    landscapeCaptionsPositionY: -1,    
    recalculateSizes: function() {}
}


function initGUI(parent) {


    var gui = new dat.GUI();
    gui.remember(cfg);
    gui.load;
    gui.add(cfg, 'message');
    gui.add(cfg, 'resolution');
    gui.add(cfg, 'playerImmortal');
    
    
    gui.add(cfg, 'showHelpers').onChange(function() {

        parent.showHelpers(cfg.showHelpers);
    });

    gui.add(cfg, 'soundVolume').min(0.0).max(1).step(0.01).onChange(function(){

        parent.setSoundVolume(cfg.soundVolume)
    });
    

    var cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(cfg, 'cameraPositionX').min(-5).max(5).step(0.01).onChange(function(){

        parent.mainCamera.position.set(cfg.cameraPositionX, cfg.cameraPositionY, cfg.cameraPositionZ);
        parent.mainCamera.updateProjectionMatrix();
    });
    cameraFolder.add(cfg, 'cameraPositionY').min(0).max(20).step(0.01).onChange(function(){

        parent.mainCamera.position.set(cfg.cameraPositionX, cfg.cameraPositionY, cfg.cameraPositionZ);
        parent.mainCamera.updateProjectionMatrix();
    });
    cameraFolder.add(cfg, 'cameraPositionZ').min(-10).max(0).step(0.01).onChange(function(){

        parent.mainCamera.lookAt(cfg.cameraLookAtX, cfg.cameraLookAtY, cfg.cameraLookAtZ);
        parent.mainCamera.position.set(cfg.cameraPositionX, cfg.cameraPositionY, cfg.cameraPositionZ);
        parent.mainCamera.updateProjectionMatrix();
    });
    cameraFolder.add(cfg, 'cameraLookAtX').min(-5).max(5).step(0.01).onChange(function(){

        parent.mainCamera.lookAt(cfg.cameraLookAtX, cfg.cameraLookAtY, cfg.cameraLookAtZ);
        parent.mainCamera.updateProjectionMatrix();
    });        
    cameraFolder.add(cfg, 'cameraLookAtY').min(-10).max(10).step(0.01).onChange(function(){

        parent.mainCamera.lookAt(cfg.cameraLookAtX, cfg.cameraLookAtY, cfg.cameraLookAtZ);
        parent.mainCamera.updateProjectionMatrix();
    });    
    cameraFolder.add(cfg, 'cameraLookAtZ').min(-5).max(5).step(0.01).onChange(function(){

        parent.mainCamera.lookAt(cfg.cameraLookAtX, cfg.cameraLookAtY, cfg.cameraLookAtZ);
        parent.mainCamera.updateProjectionMatrix();
    });    
        
    var bloomFolder = gui.addFolder('Bloom');
    bloomFolder.add(cfg, 'ebableBloom').onChange(function() {

        parent.initEffectComposer(cfg.ebableBloom);
    });
    
    bloomFolder.add(cfg, 'bloomRadius').min(0.01).max(1).step(0.01).onChange(function(){

        parent.bloomPass.radius = cfg.bloomRadius;
    });

    bloomFolder.add(cfg, 'bloomStrength').min(0.1).max(10).step(0.1).onChange(function(){

        parent.bloomPass.strength = cfg.bloomStrength;
    });

    bloomFolder.add(cfg, 'bloomThreshold').min(0.01).max(1).step(0.01).onChange(function(){

        parent.bloomPass.threshold = cfg.bloomThreshold;
    });
    var fireFolder = gui.addFolder('Fire');
    fireFolder.add(cfg, 'autoFire');
    fireFolder.add(cfg, 'autoFireInterval').min(1).max(20).step(1);
    fireFolder.add(cfg, 'fireBehavior').min(2).max(500).step(1);
    fireFolder.add(cfg, 'fireSpeed').min(0.01).max(0.2).step(0.001);

    var explosionFolder = gui.addFolder('Explosion');
    explosionFolder.add(cfg, 'enemyExplosionSize').min(0.01).max(10).step(0.01).onChange(function(){

        parent.explosions.set(cfg.enemyExplosionSize, cfg.enemyExplosionVelocity);
    });
    
    explosionFolder.add(cfg, 'enemyExplosionVelocity').min(0.01).max(1).step(0.01).onChange(function(){

        parent.explosions.set(cfg.enemyExplosionSize, cfg.enemyExplosionVelocity);
    });    


    gui.add(cfg, 'recalculateSizes').onChange(function(){

        parent.onWindowResize();
    })
    
    gui.close();


    parent.showHelpers(cfg.showHelpers);

    return gui;
}