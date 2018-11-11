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


class Stars {

    constructor(parent) {

        this.parent = parent;
        this.amount = 1000;
        this.time = 1;        

        this.init();
    }

    init() {


        var positions = new Float32Array( this.amount * 3 );
        var colors = new Float32Array( this.amount * 3 );
        var sizes = new Float32Array( this.amount );
        var velocity = new Float32Array( this.amount );

        var colorArray = [new THREE.Vector3(0.10, 0.30, 0.64), new THREE.Vector3(0.15, 0.42, 0.68), new THREE.Vector3(0, 0.16, 0.51)]


        var colorId = 0;
        for ( var i = 0; i < this.amount; i++ ) {


            positions[i * 3 + 0] = (Math.random() * 2 - 1) * 10;
            positions[i * 3 + 1] = (Math.random() * 2 - 1);
            positions[i * 3 + 2] = (Math.random() * 2 - 1) * 5;

            colors[i * 3 + 0] = colorArray[colorId].x;
            colors[i * 3 + 1] = colorArray[colorId].y;
            colors[i * 3 + 2] = colorArray[colorId].z;
            colorId++
            if(colorId >= colorArray.length) {

                colorId = 0;
            }

            sizes[i] = Math.random() * 8;
            velocity[i] = (Math.random() + 1);
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
        geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
        geometry.addAttribute( 'velocity', new THREE.BufferAttribute( velocity, 1 ) );

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
        this.time+=1;        
        if(this.time > 1200) {

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