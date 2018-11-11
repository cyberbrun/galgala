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
class Player {


    constructor(parent) {

        this.PLAYER_STATUS_READY    = 1;
        this.PLAYER_STATUS_HIT      = 2;
        this.PLAYER_STATUS_HIDDEN   = 3;

        this.parent = parent;
        this.shipSpeed = 0.05;
        this.shipRotation = 0;
        this.status = this.PLAYER_STATUS_HIDDEN;
        this.init();
    }

    init() {

        var parent = this.parent;

        var shipMat = new THREE.MeshPhongMaterial({map:parent.shipTexture1});
        var shipMesh = new THREE.Mesh(parent.shipGeometry, shipMat);
        shipMesh.scale.set(0.015, 0.015, 0.016);
        shipMesh.rotation.y = Math.PI;
        shipMesh.position.set(0, 0, -5)
        shipMesh.visible = false;
        parent.mainGroup.add(shipMesh);

        var bbox = new THREE.Box3().setFromObject(shipMesh);
        var geometry = new THREE.BoxGeometry( bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z );
        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
        var cube = new THREE.Mesh( geometry, material );
        cube.visible = false;
      //  cube.rotation.y = Math.PI;
        shipMesh.collisionCube = cube;
        cube.position.set(0, 0.030, -4.95)
        parent.mainGroup.add(cube);
        this.ship = shipMesh;
        this.cube = cube;
    }

    thisHit() {

        this.status = this.PLAYER_STATUS_HIT;
        this.ship.visible = false;
        this.parent.shipExpSound.play();
        this.parent.explosions.explodeBig(this.ship.position);
    }

    Respawn() {

        this.status = this.PLAYER_STATUS_READY;
        this.ship.position.set(0, 0, -5);
        this.cube.position.set(0, 0.030, -4.95);
        this.ship.visible = true;
        this.parent.explosions.removeBig();

    }

    detectCollision() {

        if(this.parent.playerCollisionArray.length > 0) {

            var collisionCube = this.ship.collisionCube;

            var originPoint = collisionCube.position.clone();
            for (var vertexIndex = 0; vertexIndex < collisionCube.geometry.vertices.length; vertexIndex++) {
    
                var localVertex =collisionCube.geometry.vertices[vertexIndex].clone();
                var globalVertex = localVertex.applyMatrix4( collisionCube.matrix );
                var directionVector = globalVertex.sub( collisionCube.position );    
    
                var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
                var collisionResults = ray.intersectObjects( this.parent.playerCollisionArray );   
                if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )  {
    
                    //this.parent.onCollision(collisionResults);
                    if(!cfg.playerImmortal && this.status != this.PLAYER_STATUS_HIT) {

                        this.thisHit();
                        return true;
                    }

                };
    
            };            

        }

        return false;
    }

    hide() {

        this.ship.visible = false;
        this.status = this.PLAYER_STATUS_HIDDEN;
    }

    show() {

        this.ship.visible = true;
        this.status = this.PLAYER_STATUS_READY;  
    }

    isReady() {

        if(this.status == this.PLAYER_STATUS_READY) {

            return true;
        }

        return false;
    }

    update() {

        var ship = this.ship;
        var parent = this.parent;

        switch(parent.inputMethod) {

            case parent.KEYBOARD_INPUT:

                if(parent.goLeft) {

                    ship.position.x += this.shipSpeed;
                    ship.collisionCube.position.x += this.shipSpeed;
                    this.shipRotation += 0.1;
                }
                if(parent.goRight) {
        
                    ship.position.x -= this.shipSpeed;
                    ship.collisionCube.position.x -= this.shipSpeed;
                    this.shipRotation -= 0.1;
                }
                this.shipRotation *= 0.85;
                ship.rotation.z = this.shipRotation;
                ship.collisionCube.rotation.z = this.shipRotation;
            break;
            case parent.TOUCH_INPUT:

                var distance =  -parent.lastTouch - this.ship.position.x;
                ship.position.x += distance * 0.05;
                ship.collisionCube.position.x += distance * 0.05;
                this.shipRotation = distance * 0.4;;
                ship.rotation.z = this.shipRotation;
                ship.collisionCube.rotation.z = this.shipRotation;
            break;
        };

        this.detectCollision();

    }

}