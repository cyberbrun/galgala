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
class Explosion {

    constructor(parent, colorProfile = 1, sizes = 2.7, velocity = 0.125) {

        this.parent = parent;
        this.time = 0;
        this.colorProfile = colorProfile;
        this.sizes = sizes;
        this.velocity = velocity;

        this.init(colorProfile, sizes, velocity);
    }

    init(colorProfile, sizes, velocity) {

        var size = cfg.explosionParticleSize;
        var positions = new Float32Array( size * 3 );
        var colors = new Float32Array( size * 3 );
        this.sizesArray = new Float32Array( size );
        this.velocityArray = new Float32Array( size );

        switch(colorProfile) {

            case 1:

                var colorArray = [new THREE.Vector3(1.0,1.0,1.0), new THREE.Vector3(1.0,1.0,1.0), new THREE.Vector3(1.0,1.0,1.0), new THREE.Vector3(1.0,1.0,1.0), new THREE.Vector3(1.0,1.0,0.0), new THREE.Vector3(1.0,0.0,0.0), ]
            break;
            case 2:

                var colorArray = [new THREE.Vector3(1.0,1.0,1.0), new THREE.Vector3(0.0,0.0,1.0), new THREE.Vector3(1.0,1.0,1.0), new THREE.Vector3(1.0,1.0,1.0), new THREE.Vector3(0.0,0.0,1.0), new THREE.Vector3(0.0,0.0,1.0), ]
            break;
        }
        

        var colorId = 0;
        var radius = 0.0;
        for ( var i = 0; i < size; i++ ) {

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
            if(colorId >= colorArray.length) {

                colorId = 0;
            }

            this.sizesArray[i] = Math.random() * 100;
            this.velocityArray[i] = (Math.random() + 1) * 1;
            
            radius += 0.0003;
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
        this.sizesAttribute = new THREE.BufferAttribute( this.sizesArray, 1 );
        geometry.addAttribute( 'size', this.sizesAttribute );
        this.velocityAttributes = new THREE.BufferAttribute( this.velocityArray, 1 );
        geometry.addAttribute( 'velocity', this.velocityAttributes );

		var material = new THREE.ShaderMaterial( {
            uniforms: {
                time: { value: 1.0 },
                texture:   { value: this.parent.sparkTexture }
            },
            vertexShader:   this.vertexShader(),
            fragmentShader: this.fragmentShader(),
            blending:       THREE.AdditiveBlending,
            depthTest:      false,
            transparent:    true
        });        

        var particle = new THREE.Points( geometry, material );
        particle.position.x = 200;
        this.parent.mainGroup.add(particle);
 //       this.parent.bloomScene.add(particle)

        this.particle = particle;
    }

    clear() {

        this.parent.bloomScene.remove(this.particle);
        this.parent.mainGroup.remove(this.particle);
    }

    explode(position) {

        this.recreate();
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
                // vec3 pos = position * velocity * time;
                // float v = 0.9;
                // pos.z += velocity * time * v;
                // vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
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

        for(var i = 0; i < cfg.explosionParticleSize; i++ ) {

            this.sizesArray[i] = Math.random() * this.sizes;
            this.velocityArray[i] = (Math.random() + 1) * this.velocity;

        }
        this.particle.geometry.attributes.size.needsUpdate = true;
        this.particle.geometry.attributes.velocity.needsUpdate = true;
    }
}


class Explosions {


    constructor(parent) {

        this.parent = parent;
        this.explosionsArray = [];
        this.exploded = [];
        this.shipExplosion;
        this.init();
    }

    init() {

        for(var i = 0; i < cfg.explosionsSize; i++ ) {

            this.explosionsArray.push( new Explosion(this.parent,1, cfg.enemyExplosionSize, cfg.enemyExplosionVelocity));
        }
    }

    getOldestExplosion() {

        var oldestExplosion;
        var time = 0;
        for(var i in this.exploded) {

            var explosion = this.exploded[i];
            if(explosion.time > time) {

                oldestExplosion = explosion;
                time = explosion.time;
            }
        }

        return oldestExplosion;
    }

    explode(position) {

        if(this.explosionsArray.length > 0) {

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

    removeBig() {

        this.shipExplosion.clear();
        this.shipExplosion = undefined;
    }

    explodeBig(position) {

        var shipExplosion = new Explosion(this.parent, 2, 6, 0.08);
//        shipExplosion.recreate( 100, 0.5);
        shipExplosion.explode(position);
        this.shipExplosion = shipExplosion;


        // var explodedToRemove = [];
        // for(var i in this.exploded) {
            
        //     explodedToRemove.push(this.exploded[0])
        // }
        // for(var i in explodedToRemove) {

        //     var explosion = explodedToRemove[0];
        //     var index = this.exploded.indexOf(explosion);
        //     this.exploded.splice(index, 1);
        //     this.explosionsArray.push(explosion);
        // }



        // var explosion = this.explosionsArray[0];
        // explosion.recreate( 3, Math.random() * 0.1);
        // explosion.explode(position);

        // var index = this.explosionsArray.indexOf(explosion);
        // this.explosionsArray.splice(index, 1);
        // this.exploded.push(explosion); 

        // var explosion = this.explosionsArray[0];
        // explosion.recreate(5, 0.05);
        // explosion.explode(position);

        // var index = this.explosionsArray.indexOf(explosion);
        // this.explosionsArray.splice(index, 1);
        // this.exploded.push(explosion);             

    }

    update() {

        if(this.shipExplosion !== undefined) {

            this.shipExplosion.update();
        }
        for(var i in this.exploded) {

            var explosion = this.exploded[i];
            explosion.update();

            if(explosion.time > 400) {

                var explosionToRemove = explosion;
            }
        }
        if(explosionToRemove !== undefined) {

            var index = this.exploded.indexOf(explosionToRemove);
            this.exploded.splice(index, 1);

            this.explosionsArray.push(explosionToRemove);
            explosionToRemove.recreate();
        }
    }

    set(sizes, velocity) {

        for(var i in this.explosionsArray) {

            var explosion = this.explosionsArray[i];
            explosion.sizes = sizes;
            explosion.velocity = velocity;
        }

        for(var i in this.exploded) {

            var explosion = this.exploded[i];
            explosion.sizes = sizes;
            explosion.velocity = velocity;
        }
    }
}