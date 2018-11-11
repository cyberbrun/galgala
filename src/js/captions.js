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

class TextCenter {

    constructor(parent) {

        this.parent = parent;
        this.text = "";
    }

    print(text, frontColor, sideColor) {

        if(this.text != text) {

            this.text = text;
            this.frontColor = frontColor;
            this.sideColor = sideColor;
            this.initText(text, undefined, cfg.captionsPositionY, frontColor, sideColor);
        }
    }

    update() {

        if(this.text != "") {

            this.parent.mainGroup.remove(this.textMesh);
            this.initText(this.text, undefined, cfg.captionsPositionY, this.frontColor, this.sideColor);
    
        }
    }

    clear() {

        this.parent.mainGroup.remove(this.textMesh);
        this.text = "";
    }

    initText(text, x, y, frontColor, sideColor) {

        parent = this.parent;

        var params = {
            font: parent.font,
        }        

        var textGeometry = new THREE.TextGeometry(text, params);

        var textMaterial = [];
        textMaterial[0] =  new THREE.MeshPhongMaterial({color: frontColor}), // front
        textMaterial[1] =  new THREE.MeshBasicMaterial({color: sideColor}) // side
 

        var textMesh = new THREE.Mesh(textGeometry, textMaterial); 
        textMesh.geometry.scale(0.002, 0.002, 0.002);    
        textMesh.rotation.set(Math.PI / 1.6, Math.PI, 0.0);

        if(x===undefined) {

            var bb = new THREE.Box3().setFromObject(textMesh);
            var sizes = new THREE.Vector3();
            sizes.subVectors(bb.max, bb.min);       
            textMesh.position.x = sizes.x - sizes.x / 2// / 2;
        }
        textMesh.position.z = y;
        
        this.textMesh = textMesh;
        this.parent.mainGroup.add(textMesh);
    }

};

class CTextLine3D {


    constructor(parent, text, x, y, frontColor, sideColor) {

        this.parent = parent;

        var params = {
            font: parent.font,
        }        

        var textGeometry = new THREE.TextGeometry(text, params);

        var textMaterial = [];
        textMaterial[0] =  new THREE.MeshPhongMaterial({color: frontColor}), // front
        textMaterial[1] =  new THREE.MeshBasicMaterial({color: sideColor}) // side
 

        var textMesh = new THREE.Mesh(textGeometry, textMaterial); 
        textMesh.geometry.scale(0.005, 0.005, 0.005);    
        textMesh.rotation.set(Math.PI / 2.2, Math.PI, 0.0);

        if(x===undefined) {

            var bb = new THREE.Box3().setFromObject(textMesh);
            var sizes = new THREE.Vector3();
            sizes.subVectors(bb.max, bb.min);       
            textMesh.position.x = sizes.x - sizes.x / 2// / 2;
        }
        textMesh.position.z = y;
        
        this.mesh = textMesh;
        this.parent.mainGroup.add(textMesh);
    }
}


class CTextShapes {


    constructor(font, text, x, y, color) {

        this.parent = parent;
        var font = font;


        var matLite = new THREE.MeshBasicMaterial( {
            color: color,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        } );

        var shapes = font.generateShapes(text, 100);
        var geometry = new THREE.ShapeGeometry( shapes );
        var textShape = new THREE.BufferGeometry();
        textShape.fromGeometry( geometry );
        var textMesh = new THREE.Mesh( textShape, matLite );
        textMesh.geometry.scale(0.017, 0.017, 0.017);  
        textMesh.rotation.x = -Math.PI / 2.1;
        textMesh.position.set(x, 0, y);


        return textMesh;
    }

}