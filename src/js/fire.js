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
        var fireMat = new THREE.MeshLambertMaterial({map:parent.fireTexture1});
        for(var i = 0; i < numberOfFires; i++ ) {

            var fireMesh = new THREE.Mesh(parent.fireGeometry, fireMat);
            fireMesh.scale.set(0.022, 0.022, 0.022);
            fireMesh.position.set(i/5,0,-10);
            fireMesh.basePosition = new THREE.Vector3(i/5,0,-10)
           // fireMesh.rotation.y = Math.PI;
            parent.mainGroup.add(fireMesh);
            this.fireArray.push(fireMesh);

            var bbox = new THREE.Box3().setFromObject(fireMesh);
            var geometry = new THREE.BoxGeometry( bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z );
            var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
            var cube = new THREE.Mesh( geometry, material );
            cube.visible = false;
            cube.position.set(-5 -i/5,0,-10);
            parent.mainGroup.add(cube);
            
            fireMesh.collisionCube = cube;
        }
    }

    fire(position) {

        var parent = this.parent;
        if(this.fireArray.length > 0 ) {

            if(parent.fireSound.isPlaying) {

                parent.fireSound.stop();
            }

            parent.fireSound.play();
            var fire = this.fireArray[0];
            var index = this.fireArray.indexOf(fire);
            this.fireArray.splice(index, 1);

            fire.position.set(position.x, position.y - 0.1, position.z+ 0.1);
            fire.collisionCube.position.set(position.x, position.y - 0.1, position.z+ 0.1);
            this.firedFire.push(fire);
        }

    }

    detectCollision(coolisionCube) {

        if( this.parent.player.status == this.parent.player.PLAYER_STATUS_HIT) {

            return false;
        }

        var originPoint = coolisionCube.position.clone();
        for (var vertexIndex = 0; vertexIndex < coolisionCube.geometry.vertices.length; vertexIndex++) {

            var localVertex =coolisionCube.geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4( coolisionCube.matrix );
            var directionVector = globalVertex.sub( coolisionCube.position );    

            var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
            var collisionResults = ray.intersectObjects( this.parent.enemiesCollisionArray );   
            if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )  {

                this.parent.onCollision(collisionResults);
                return true;
            };

        };
        return false;
    }

    update() {

        var fireToRemove;
        for(var i in this.firedFire) {

            var fire =  this.firedFire[i];
            fire.position.z += 0.2;
            fire.collisionCube.position.z += 0.2;
            if(this.detectCollision(fire.collisionCube)) {

                fireToRemove = fire;
            }
            if(fire.position.z > cfg.playerFireToRemoveZ) {

                fireToRemove = fire;
            }
        }
        if(fireToRemove !== undefined) {

            var index = this.firedFire.indexOf(fireToRemove);
            this.firedFire.splice(index, 1);
            this.fireArray.push(fireToRemove);
            fireToRemove.position.set(fireToRemove.basePosition.x,fireToRemove.basePosition.y,fireToRemove.basePosition.z);
            fireToRemove.collisionCube.position.set(fireToRemove.basePosition.x,fireToRemove.basePosition.y,fireToRemove.basePosition.z);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////#endregion


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
        var fireMat = new THREE.MeshLambertMaterial({map:parent.enemyFireTexture1});
        for(var i = 0; i < numberOfFires; i++ ) {

            var fireMesh = new THREE.Mesh(parent.fireGeometry, fireMat);
            fireMesh.scale.set(0.022, 0.022, 0.022);
            fireMesh.rotation.y = Math.PI;
            fireMesh.position.set( 5-i/5,0,10);
            fireMesh.basePosition = new THREE.Vector3(5-i/5,0,10);
            fireMesh.direction = 0.0;   
           
            parent.mainGroup.add(fireMesh);
            this.fireArray.push(fireMesh);
        }
    }

    fire(startPosition, targetPosition) {

        if( this.fireArray.length > 0  ) {

            var fire = this.fireArray[0];
            var index = this.fireArray.indexOf(fire);
            this.fireArray.splice(index, 1);
    
            var dir = startPosition.clone().sub(targetPosition).normalize();;
            
            fire.position.set(startPosition.x, 0, startPosition.z);
            fire.direction = dir;
            this.firedFire.push(fire);
            this.parent.playerCollisionArray.push(fire);    // stre fire in playerCollisionArray
            return true;
        }

        return false;
    }

    update() {

        var fireToRemove;
        for(var i in this.firedFire) {

            var fire =  this.firedFire[i];
    
            fire.position.x -= cfg.fireSpeed * fire.direction.x;
     //       fire.position.y -= cfg.fireSpeed * fire.direction.y;
            fire.position.z -= cfg.fireSpeed * fire.direction.z;
            

            if(fire.position.z < cfg.enemyFireToRemoveZ) {

                fireToRemove = fire;
            }
        }
        if(fireToRemove !== undefined) {

            var index = this.firedFire.indexOf(fireToRemove);
            this.firedFire.splice(index, 1);
            this.fireArray.push(fireToRemove);
            fireToRemove.position.set(fireToRemove.basePosition.x,fireToRemove.basePosition.y,fireToRemove.basePosition.z);

            var id = this.parent.playerCollisionArray.indexOf(fireToRemove);
            this.parent.playerCollisionArray.splice(id,1);
        }        
    }
}