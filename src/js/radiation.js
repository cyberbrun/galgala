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

class Radiation {


    constructor(parent) {

        this.parent = parent;
        this.colorId = 0;
        this.colorIndex = [];
        this.init();
        this.opacityLine = 0;
        this.isStart = false;
        this.isEnd = false;
        this.isActive = false;
        this.isFullSize = false;    // radiation is full size
        this.updateInterval = 4;
    }

 
    init() {

        this.numberOfLines = 11;
        this.segments = REDIATION_RING_SEGMENTS;
        this.iSegments = 1; // segments increment value
        var zInterval = 1.8;
        var rInterval = 0.6;
        var r = 1;
        var rv = 0.0;
        var z = 26.5;
        var size = 0.25;
        var vertexId = 0;
        var positions = [];
        var colors = [];
        this.radiationColors = [];
        var vertices = [];
        this.verticesColor = [];
        var indices = [];
        var opacity = 1.0;

        this.radiationColors.push(new THREE.Vector3(0.0, 40.0 / 256.0, 187.0 /256.0));
        this.radiationColors.push(new THREE.Vector3(0.0, 70.0 / 256.0, 187.0 / 256.0));
        this.radiationColors.push(new THREE.Vector3(0.0, 100.0 / 256.0,187.0 / 256.0));
        this.radiationColors.push(new THREE.Vector3(0.0, 130.0 / 256.0, 187.0 / 256.0));
   //     this.radiationColors.push(new THREE.Vector3(0.0, 160.0 / 256.0, 187.0 / 256.0));


        // this.radiationColors.push(new THREE.Vector3(1.0, 0.0, 0.0));
        // this.radiationColors.push(new THREE.Vector3(0.0, 1.0, 0.0));
        // this.radiationColors.push(new THREE.Vector3(0.0, 0.0, 1.0));      
        // this.radiationColors.push(new THREE.Vector3(1.0, 1.0, 1.0));         
        for(var i in this.radiationColors) {

            this.colorIndex.push(i);
        }        
        
        var actualRadiationColorId = 0;
        var actualColor = this.radiationColors[actualRadiationColorId++];        
        for(var j = 0; j < this.numberOfLines; j++ ) {
            
            var interval = 2.0 * Math.PI / this.segments;
            for ( var i = 0; i < this.segments; i ++ ) {

                // particle
 //               if(i % 4 == 0) {
                    var xp = Math.sin(interval * i) * (r + rv);
                    var yp = Math.cos(interval * i) * (r + rv);
                   
                    positions.push(xp, yp, z + (size / 2.0));
                    colors.push(actualColor.x, actualColor.y, actualColor.z);
 //               };
                // waves
                var ax = Math.sin(interval * i) *r;
                var ay = Math.cos(interval * i) *r;
                var ax2 = Math.sin(interval * (i + 1)) * r;
                var ay2 = Math.cos(interval * (i + 1)) * r;

                var bx = Math.sin(interval * i) * (r);
                var by = Math.cos(interval * i) * (r);          
                var bx2 = Math.sin(interval * i) * (r - size);
                var by2 = Math.cos(interval * i) * (r - size);      
                var bx3 = Math.sin(interval * (i + 1)) * (r);
                var by3 = Math.cos(interval * (i + 1)) * (r);      
                var bx4 = Math.sin(interval * (i + 1)) * (r - size);
                var by4 = Math.cos(interval * (i + 1)) * (r - size);                                     

                vertices.push(ax, ay, z);
                vertices.push(ax, ay, z + size);
                vertices.push(ax2, ay2, z + size );
                vertices.push(ax2, ay2, z);

                vertices.push(bx, by, z);
                vertices.push(bx2, by2, z);
                vertices.push(bx3, by3, z);
                vertices.push(bx4, by4, z);
                
                vertices.push(bx, by, z + size);
                vertices.push(bx2, by2, z + size);
                vertices.push(bx3, by3, z + size);
                vertices.push(bx4, by4, z + size);

                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);                
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);
                this.verticesColor.push(actualColor.x, actualColor.y, actualColor.z, opacity);                

                indices.push(vertexId, vertexId + 1, vertexId + 2);
                indices.push(vertexId, vertexId + 2, vertexId + 3);
                indices.push(vertexId + 4, vertexId + 5, vertexId + 6);
                indices.push(vertexId + 5, vertexId + 6, vertexId + 7);
                indices.push(vertexId + 8, vertexId + 9, vertexId + 10);
                indices.push(vertexId + 9, vertexId + 10, vertexId + 11);
                
                vertexId+=12;

            }

            z += zInterval;
            r += rInterval;
            this.segments += this.iSegments;
            if(actualRadiationColorId >= this.radiationColors.length) {
                actualRadiationColorId = 0;
            }
            actualColor = this.radiationColors[actualRadiationColorId];
            actualRadiationColorId++;            
        };

        this.radiationR = r;
        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).setDynamic( true ) );

        var material = new THREE.RawShaderMaterial( {
            uniforms: {
                Time: {value: 1.0 },
            },
			vertexShader: this.particleShader().vertexShader,
			fragmentShader: this.particleShader().fragmentShader,
            transparent: true
        } );    

        var particle = new THREE.Points( geometry, material );
        this.particle = particle;
       // this.parent.scene.add(particle);
       // this.parent.glowScene.add(particle);

        var geometryWaves = new THREE.BufferGeometry();
        geometryWaves.setIndex( indices );
        geometryWaves.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometryWaves.addAttribute( 'color', new THREE.Float32BufferAttribute( this.verticesColor, 4 ).setDynamic( true ) );        
       

        var materialWaves = new THREE.RawShaderMaterial( {
            uniforms: {
                Time: {value: 1.0 },
            },
			vertexShader: this.wavesShader().vertexShader,
            fragmentShader: this.wavesShader().fragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0
        } );   

        var meshWaves = new THREE.Mesh( geometryWaves, materialWaves );
        meshWaves.visible = false;
        this.waves = meshWaves;
    //    this.waves.position.x = 500.0;
    //    this.particle.position.x = 500.0;
        this.parent.renderer.add(meshWaves, 1);  // RENDER_TO_BLOOM
 //      this.parent.renderer.add(particle, 1);
 //       this.parent.glowScene.add(meshWaves);




    }

    setRadiationSound(sound) {

        this.radiationSound = sound;
    }

    setSowa(sowa) {

        this.sowa = sowa;
        this.waves.position.x = sowa.mesh.position.x;
        this.particle.position.x = sowa.mesh.position.x;
    }

    particleShader() {

        var shader = {

            vertexShader: [

                "precision highp float;",
                "uniform mat4 modelViewMatrix;",
                "uniform mat4 projectionMatrix;",
                "attribute vec3 position;",
                "attribute vec3 color;",
                "uniform float Time;",
                "varying vec3 vColor;",


                "void main() {",
                "vColor = color;",
                "gl_PointSize = 3.0;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );",
                "}"

            ].join("\n"),

            fragmentShader: [

                "precision highp float;",
                "varying vec3 vColor;",
                "void main() {",


                    "gl_FragColor = vec4(vColor, 1.0);",
                "}"

            ].join("\n")
        }
        return shader;
    }

    wavesShader() {

        var shader = {

            vertexShader: [

                "precision highp float;",
                "uniform mat4 modelViewMatrix;",
                "uniform mat4 projectionMatrix;",
                "attribute vec3 position;",
                "attribute vec4 color;",
                "uniform float Time;",
                "varying vec4 vColor;",


                "void main() {",
                "vColor = color;",
               
                "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );",
                "}"

            ].join("\n"),

            fragmentShader: [

                "precision highp float;",
                "varying vec4 vColor;",
                "void main() {",


                    "gl_FragColor = vColor;",
                "}"

            ].join("\n")
        }
        return shader;
    }

    changeColorIndex(colorIndexArray) {

        var first = colorIndexArray[0];
        for(var i = 0; i < colorIndexArray.length - 1; i++ ) {

            colorIndexArray[i] = colorIndexArray[i+1];
        }
        colorIndexArray[colorIndexArray.length - 1] = first;

    }

    changeColors() {

        var colors = this.waves.geometry.attributes.color.array;
        var pcolors = this.particle.geometry.attributes.color.array;
        this.segments = REDIATION_RING_SEGMENTS;
        var oldRingSize = 0;
        var colorIndexId = 0;
        for(var j = 0; j < this.numberOfLines; j++ ) {
            var ringSize = (this.segments * 4 * 12) + oldRingSize;
            var actualColor = this.radiationColors[this.colorIndex[colorIndexId]];
            var opacity= 1.0;
            if( this.opacityLine <= j) {

                opacity = 0.0;
            }

            for ( var i = oldRingSize; i < ringSize; i += 4 ) {
        

                colors[i] = actualColor.x;
                colors[i+1] = actualColor.y;
                colors[i+2] = actualColor.z;      
                colors[i+3] = opacity;        
            
            }
            this.segments += this.iSegments;
            oldRingSize = ringSize;
            colorIndexId++;
            if(colorIndexId >= this.colorIndex.length) {

                colorIndexId = 0;
            }
        }                            

        for(var j = 0; j < this.numberOfLines; j++ ) {

            
        };

        this.waves.geometry.attributes.color.needsUpdate = true;
        this.particle.geometry.attributes.color.needsUpdate = true;
        this.changeColorIndex(this.colorIndex);

    }

    updateOpacity() {
        
        if( this.isStart ) {

            this.opacityLine++;
            if(this.opacityLine > this.numberOfLines) {
    
                this.isStart = false;
                this.isFullSize = true;
            }   
        } else if(this.isStop) {

            this.opacityLine--;
            if(this.opacityLine<=0) {

                this.abort();         
            }

        }
    }

    start() {

        this.waves.visible = true;
        this.isStart = true;
        this.isStop = false;
        this.isActive = true;
        this.isFullSize = false;
        this.updateInterval = 4;
        this.radiationSound.play();
    }

    stop() {

        this.isStop = true;
        this.isStart = false;
    }

    abort() {

//        this.waves.position.x = 500.0;
        this.isStart = false;
        this.isEnd = false;
        this.opacityLine = 0;
        this.isActive = false;
        this.sowa.radiation = null;
        this.waves.visible = true;
        this.radiationSound.stop();


       
    }

    update() {

        this.particle.rotation.z += 0.1;
        this.waves.rotation.z -= 0.1;
        if(this.parent.frameID % 4 == 0) {

            this.changeColors();
        }
        if(this.parent.frameID % this.updateInterval == 0) {
           
            this.updateOpacity();
        }

    }
}