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

class Behavior {

    // copy array at the end of dst
    static arrayToArray(dst, array, start = 0) {

        for(var i = start, len = array.length; i < len; i++) {

            dst.push(array[i]);
        }
    }

    static getCurveLength(points) {

        var len = 0;

        var p1 = points[0];
        for(var i = 1; i < points.length; i++) {

            var p2 = points[i];
            len += p1.distanceTo(p2);

            p1 = p2;

        }

        return len;
    }

    // generate path on curve and destination point
    static generateAttackPath(object) { // generate attack path based on curves from resource in last fly etap. Closer to player shi

        var engine = object.engine;
        var attackId;
        var attackPathName;
        switch(object.typeName) {

            case "muchaAdd":

                attackId = Math.floor(Math.random() * (engine.muchaAttackPaths.length));
                attackPathName = engine.muchaAttackPaths[attackId];
            break;
            case "motylekAdd":

                attackId = Math.floor(Math.random() * (engine.mottylekAttackPaths.length));
                attackPathName = engine.mottylekAttackPaths[attackId];
            break;
        }

        var pointsSpeed = (Math.random() * 4 + 8);
        var points = Behavior.getPoinstFromLine(engine.nurms, attackPathName);
        var bufPoints =  new THREE.CatmullRomCurve3(points).getPoints(30);      // smooth line 
        var attackLength = Behavior.getCurveLength(bufPoints);
        var attackPoints =  new THREE.CatmullRomCurve3(bufPoints).getPoints(Math.floor(attackLength * pointsSpeed));  // final smooth points from buffer

        var pathMinMaxX = Behavior.getPathMixMaxX(attackPoints, 0);
        var offset = (pathMinMaxX[1] - pathMinMaxX[0]) / 2;
        Behavior.translatePoints(attackPoints, engine.player.ship.position.x);   
        
        var midlePoint1 = new THREE.Vector3(attackPoints[attackPoints.length-1].x, -0.1, attackPoints[attackPoints.length-1].z + (Math.random() * 3) + 2 );
        var midlePoint2 = new THREE.Vector3(object.position.x, -0.1, object.position.z  + (Math.random() * 3) + 2  );

        var curve = new THREE.CubicBezierCurve3(
            attackPoints[attackPoints.length-1],
            midlePoint1,
            midlePoint2,
            object.position
        );

        var tp = curve.getPoints(Math.floor(curve.getLength() * pointsSpeed * 1.5));  // dolot gorny frahment sciezki
        Behavior.arrayToArray(attackPoints,tp, 1);

        object.status = "attack";
        object.setPath(attackPoints);
    }

    static getCurveByName(name, curves) {

        for(var i in curves.children) {
    
            var curve = curves.children[i];
            if(curve.name == name) {
    
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
        for(var i = 0; i < positions.length; i += 3 ) {

            var newPoint = new THREE.Vector3(positions[i], -0.1, positions[i+2]);
            newPoint.applyMatrix4(m);
            points.push(newPoint);
        }

        return points;
    }    

    static generatePath(curve, dstPoint, pathParams) {

        var points = this.getPoinstFromLine(curve, pathParams.name);
        var bufPoints =  new THREE.CatmullRomCurve3(points).getPoints(20);                           // smooth line 
        var newPoints =  new THREE.CatmullRomCurve3(bufPoints).getPoints(pathParams.curvePoints);  // final smooth points from buffer

        var midlePoint = new THREE.Vector3(newPoints[0].x, -0.1, dstPoint.z );

        var curve = new THREE.QuadraticBezierCurve3(
            dstPoint,
            midlePoint,
            newPoints[0]
        );
        var tp = curve.getPoints(pathParams.finishPoints);
        Behavior.arrayToArray(tp,newPoints, 1);

        return tp;
    }

    // set path to the enemy
    static setPath(path) {

        this.path = path;
        this.pathPos = path.length - 1;
        this.action = "path";
    }

    static setAnimationDuration(enemy) {

        if(enemy.clipAction === undefined) {

            return;
        }
        var animationDuration = 1;
        switch(enemy.typeName) {
    
            case "motylek": animationDuration = Math.random() + 1; break;
            case "mucha": animationDuration = Math.random() + 0.4; break;
            case "sowa": animationDuration = Math.random() + 0.5; break;
            case "motylekAdd": animationDuration = Math.random() + 1; break;
    
        }
        enemy.clipAction.setDuration(animationDuration);
    }

    static updateEnemy() {
    
        if(this.path !== undefined) {

            var engine = this.engine;
            
            var pos = this.path[this.pathPos];
            var look = this.path[this.pathPos - 1];
            this.position.set(pos.x, pos.y, pos.z);
            this.lookAt(look);
            this.pathPos--;

            if(this.position.z > -2.5 && randomBehavior(cfg.fireBehavior,1) ) { //enemy fires

                var targetPosition = engine.player.ship.position.clone();
                if(engine.goLeft) {

                    targetPosition.x += Math.random() * 2.5;
                }
                if(engine.goRight) {

                    targetPosition.x -= Math.random() * 2.5;
                }

                if(engine.player.isReady() && engine.enemyFires.fire(this.position, targetPosition)) {

                    if(engine.enemyFireSound.isPlaying) {

                        engine.enemyFireSound.stop();
                    }
                    engine.enemyFireSound.play();
                    this.fireTime = engine.frameID;
                
                }
            }


            if(this.status == "attack") {   // follow the ship attack

                if(this.position.z > -4) {

                    
                    var pathMinMaxX = Behavior.getPathMixMaxX(this.path, 0);
                    var offset = pathMinMaxX[0];// + ((pathMinMaxX[1] - pathMinMaxX[0]) / 2);
        
                    var distance = engine.player.ship.position.x - this.position.x;
                    var interval = distance * this.followShipVolume;
        
            //      engine.controlBox.position.x = distance;
                    Behavior.translatePoints(this.path, interval );
                }
            }
            
            if(this.pathPos == 1) {

                this.path = undefined;
                if(!this.isAdditional) {

                    this.action = "rotation";
                    Behavior.setAnimationDuration(this);
                } else {

                    if(this.status == "release") {

                        Behavior.generateAttackPath(this);  // generate attack path
                        engine.playerCollisionArray.push(this);
                    } else {

                        this.position.set(this.basePosition.x, this.basePosition.y, this.basePosition.z);
                        var id = engine.playerCollisionArray.indexOf(this);
                        engine.playerCollisionArray.splice(id,1);
                        var id = engine.enemiesCollisionArray.indexOf(this);
                        engine.enemiesCollisionArray.splice(id, 1);
                        this.status = "ready"
                    }
                }

            }
            return true;

        } else if(this.action == "rotation") {

            this.rotation.x *= 0.9;
            this.rotation.y *= 0.9;
            this.rotation.z *= 0.9;
            if((this.rotation.x < 0.01 && this.rotation.x > -0.01) && (this.rotation.y < 0.01 && this.rotation.y > -0.01) && this.rotation.z < 0.01 && this.rotation.z > -0.01) {

                this.rotation.set(0,0,0);
                this.position.set(this.basePosition.x, this.basePosition.y, this.basePosition.z);
                
                this.status = "ready";            
            }

            return false;
        } else {

            return false;
        }
    }


    static getAdditionalMotylek(enemies) {

        for(var i in enemies) {

            var enemy = enemies[i];
            if(enemy.isAdditional && enemy.typeName == "motylekAdd" && enemy.status != "release" ) {

                return enemy;
            }

        }
        return null;
    }

    static getAdditionalMucha(enemies) {

        for(var i in enemies) {

            var enemy = enemies[i];
            if(enemy.isAdditional && enemy.typeName == "muchaAdd" && enemy.status != "release" ) {

                return enemy;
            }

        }
        return null;
    }

    static generateAdditionalPath(curve, pathParams) {

        var points = Behavior.getPoinstFromLine(curve, pathParams.name);
        var bufPoints =  new THREE.CatmullRomCurve3(points).getPoints(20);      // smooth line 
        var newPoints =  new THREE.CatmullRomCurve3(bufPoints).getPoints( pathParams.curvePoints);  // final smooth points from buffer
    
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

        var minX = 0;//path[startId];
        var maxX = 0;//path[startId];
    
        var len = path.length;
        for(var i = startId + 1; i < len;  i++) {
    
            var point = path[i];
    
            if(point.x > maxX) {
    
                maxX = point.x;
            }
            if(point.x < minX) {
    
                minX = point.x;
            }
        }
        return [minX, maxX];
    }    

    static translatePoints(pointsArray, x) {

        for(var i in pointsArray) {
    
            var point = pointsArray[i];
            point.x += x;
        }
    
    }    
}

