const auth = require('basic-auth');

const admins = { '1111111111': { password: '1111111111' }, };

const protectedFiles = ["/galaga.html", "/js/shaders.js", "/js/config.js", "/js/behavior.js", "/js/brunosLE.js", "/js/explosion.js", "/js/fire.js",
						"/js/player.js", "/js/starfield.js", "/js/captions.js", "/js/HUD.js", "/js/tools.js", "/js/scores.js", "/js/galaga.js"];

module.exports = function (request, response, next) {


  for(var i in protectedFiles) {

    if(request.url.includes(protectedFiles[i])) {

        var user = auth(request);
        if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
          response.set('WWW-Authenticate', 'Basic realm="example"');
          return response.status(401).send();
        }

    }


  }

  return next();
};