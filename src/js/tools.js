
// return enemy without path 
function getNotFlyEnemy(enemies) {

    var noPath = 0;
    for(var i in enemies) {

        var enemy = enemies[i];
        if(enemy.path === undefined) {
 
            noPath++;
        }
    }
    if(noPath == 0) {

        return;
    }

    do {
        var enemy = enemies[Math.floor(Math.random() * enemies.length)];
    } while(enemy.path !== undefined)
    
    return enemy;
}

function Round(n, k)
{
    var factor = Math.pow(10, k);
    return Math.round(n*factor)/factor;
}

function randomBehavior(amount, target) {

    var val = Math.floor( Math.random() * amount);
    if(val == target){
    
        return true;
    }

    return false;
}