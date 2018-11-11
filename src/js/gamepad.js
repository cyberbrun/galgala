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

// based on:
// http://luser.github.io/gamepadtest/gamepadtest.js


const GAMEPAD_FIRE_BUTTON_INDEX     = 2
const GAMEPAD_LEFTRIGHT_AXES_INDEX  = 0

class Gamepad {

    constructor(parent) {

        this.parent = parent;
        this.gamePads = {};
        this.oldPressed = false;
        this.oldAxes = 0;

        var haveEvents = 'GamepadEvent' in window;
        
        if(haveEvents) {

            window.addEventListener("gamepadconnected", this.connected.bind(this));
            window.addEventListener("gamepaddisconnected", this.disconnected.bind(this));
        }
    }

    connected(e) {

        this.gamePads[e.gamepad.index] = e.gamepad;
    }

    disconnected(e) {

        delete this.gamePads[e.gamepad.index];
    }

    scan() {

        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (var i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                if (!(gamepads[i].index in this.gamePads)) {

                    addgamepad(gamepads[i]);
                } else {

                    this.gamePads[gamepads[i].index] = gamepads[i];
                }
            } 
        }       
    }

    update() {

        this.scan();
        for(var i in this.gamePads) {

            var gamepad = this.gamePads[i];
            var pressed = gamepad.buttons[GAMEPAD_FIRE_BUTTON_INDEX].pressed;

            if(pressed) {
                if(!this.oldPressed) {
                    this.onFireDown();
                }
            } else {
                if(this.oldPressed) {
                    this.onFireUp();
                }
            }
            this.oldPressed = pressed;

            var axes =  gamepad.axes[GAMEPAD_LEFTRIGHT_AXES_INDEX];
            if(axes == -1) {

                this.onLeftDown();
            } else {
                
                if(this.oldAxes == -1) {

                    this.onLeftUp();
                }
            }
            
            if(axes == 1) {

                this.onRightDown();
            } else {

                if(this.oldAxes == 1) {

                    this.onRightUp();
                }
            }

            this.oldAxes = axes;
        }

    }

    onLeftDown() {

        this.parent.goLeft = true;
    }

    onLeftUp() {

        this.parent.goLeft = false;
    }

    onRightDown() {

        this.parent.goRight = true;
    }

    onRightUp() {

        this.parent.goRight = false;
    }

    onFireDown() {

        if(!this.parent.needUpFire) {
            this.parent.goFire = true;
            this.parent.needUpFire = true;
        }
    }

    onFireUp() {

        this.parent.goFire = false;
        this.parent.needUpFire = false;
    }
}