var jitterz = {};

jitterz.points = [];

// CONFIG
jitterz.numPoints = 100;

var w = window.innerWidth,
    h = window.innerHeight,
    c = Math.cos,
    s = Math.sin,
    inc = 2 * Math.PI / jitterz.numPoints;

var cx = w / 2,
    cy = h / 2,
    r = w > h ? h * 0.2 : w * 0.2,
    numLoops = 10, // number of times to loop around the circle (for a multitude of points)
    closeness = r * 0.75, // how close should the cursor have to be for a point to move toward it
    biasFactor = 0.4; // the smaller, the less attracted to the cursor points are

var timer = 0;

// map the distance (0 - closeness) to 255-0 for color mapping
function mapCloseness(dist) {
    return 255 - 1.25 * ( (-255 / (closeness / dist)) + 255 );
}

function setup() {

    createCanvas( w, h );

    for ( var i = 0; i < jitterz.numPoints - 1; i += inc ) {
        jitterz.points.push([cx + r * c(i), cy + r * s(i)]);
    }

    drawLines();

    startTimer();
}

function startTimer() {
    setInterval(function(){
        timer++;
    }, 1000);
}

function time() {

    var minutes, seconds, theTime;

    minutes = Math.floor(timer / 60);
    seconds = timer % 60;

    minutes = minutes.toString();
    seconds = seconds.toString();

    theTime = minutes + ':' + ( seconds.length === 2 ? seconds : '0' + seconds );

    textSize(32);
    fill(255);
    text(theTime, 20, 45);

    setTimeout(time, 1000);
}

function drawCircle() {
    fill(200, 200, 200, 127);
    strokeWeight(0);
    ellipse(cx, cy, 2 * r, 2 * r);
}

function drawLines(bias) {

    clear();
    background(0);

    drawCircle();
    time();

    stroke(255, 255, 255, 100);
    strokeWeight(1.5);

    var pt = 0,
        inc = 2 * Math.PI / jitterz.numPoints,
        dist,
        numberInside = 0;

    for ( var i = 0; i < numLoops * 2 * Math.PI; i += inc ) {

        dist = distance(jitterz.points[pt], [mouseX, mouseY]);

        if ( distance(jitterz.points[pt], [cx, cy] ) < r ) {
            numberInside++;
        }

        if ( dist < closeness ) {
            stroke(255, mapCloseness(dist), mapCloseness(dist), 100);
        } else {
            stroke(255, 255, 255, 100);
        }
        line(
            jitterz.points[pt][0],
            jitterz.points[pt][1],
            jitterz.points[pt + 1][0],
            jitterz.points[pt + 1][1]
        );
        pt++;
    }

    fill(255);
    rect(w - 40, ( 1 - numberInside / (jitterz.numPoints * numLoops) ) * h, w, h);
}

function distance(pt, mouse) {

    var dx = mouse[0] - pt[0],
        dy = mouse[1] - pt[1];

    return Math.sqrt( dx * dx + dy * dy );
}

function jitter(bias) {
    if ( jitterz.points.length > 0 ) {

        var jx, jy, determinator, factor;

        determinator = window.innerWidth > window.innerHeight ? 'w' : 'h';
        factor = 1000;

        if ( determinator === 'w' ) {
            jx = window.innerWidth / factor;
            jy = jx;
        } else {
            jy = window.innerHeight / factor;
            jx = jy;
        }

        jitterz.points.forEach(function(pt) {
            pt[0] += ( Math.random() * 2 - 1 ) * jx;
            pt[1] += ( Math.random() * 2 - 1 ) * jy;

            if ( bias && distance(pt, [mouseX, mouseY]) < closeness ) {
                pt[0] += biasFactor * (mouseX - pt[0]) / distance(pt, [mouseX, mouseY]);
                pt[1] += biasFactor * (mouseY - pt[1]) / distance(pt, [mouseX, mouseY]);
            }
        });

        drawLines(bias);
    }
}

// pressing space bar toggles the bias
var includeBias = true;

function keyTyped() {

    if ( key === ' ' ) {
        // includeBias = !includeBias;
    }
}

function draw() {
    jitter(includeBias);
}
