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

class Scores {


    constructor(parent) {


        this.parent = parent;
        
        this.init();
    }


    init() {

// #ifdef RELEASE
        var HOST = "wss://galgala.herokuapp.com";
// #else
        var HOST = location.origin.replace(/^http/, 'ws')
// #endif
        var ws = new WebSocket(HOST);

        ws.onmessage = function (event) {
       
            var msg = JSON.parse(event.data);
            if(msg.type == "top10Scores") {

                this.scoresArray = msg.scores;
                this.parent.HUD.setRecord(this.scoresArray[0].score); // update game HUD record
            }
        }.bind(this);        
    }
}