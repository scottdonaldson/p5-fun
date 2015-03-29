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
    targetR = 0.95 * r,
    numLoops = 10, // number of times to loop around the circle (for a multitude of points)
    closeness = r * 0.75, // how close should the cursor have to be for a point to move toward it
    biasFactor = 0.4; // the smaller, the less attracted to the cursor points are

var timer = 0,
    currentLevel = 0;

function shapeReset() {
    fill(255, 255, 255, 80);
    strokeWeight(0);
}

var levels = [
    {
        shape: function() {
            shapeReset();
            ellipse(cx, cy, 2 * targetR, 2 * targetR);
        },
        test: function(px) {
            return distance(px, [cx, cy] ) < targetR;
        }
    },
    {
        shape: function() {
            shapeReset();
            rect(cx - w / 6, cy - w / 16, w / 3, w / 8);
        },
        test: function(px) {
            return px[0] > cx - w / 6 && px[0] < cx + w / 6 && px[1] > cy - w / 16 && px[1] < cy + w / 16;
        }
    }
];

// map the distance (0 - closeness) to 0-255 for color mapping
function mapCloseness(dist) {
    return (closeness - dist) * 255 / closeness;
}

function normalizeColor(value) {
    if ( value < 80 ) value = 80;
    if ( value > 255 ) value = 255;

    return value;
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

    textFont('Helvetica Neue');

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

function drawLines(bias) {

    clear();
    background(0);

    levels[currentLevel].shape();
    time();

    var pt = 0,
        inc = 2 * Math.PI / jitterz.numPoints,
        dist,
        numberInside = 0;

    var r, g, b, a;
    a = 100;

    for ( var i = 0; i < numLoops * 2 * Math.PI; i += inc ) {

        r = g = b = 255;

        dist = distance(jitterz.points[pt], [mouseX, mouseY]);

        strokeWeight(1.5);

        // if in the target, add to the number inside
        if ( levels[currentLevel].test(jitterz.points[pt]) ) {
            numberInside++;
        // if not, red pixels remain high but others are low
        } else {
            g = b = 60;
        }

        if ( dist < closeness ) {

            r -= mapCloseness(dist);
            g -= mapCloseness(dist);
            b += 0.5 * mapCloseness(dist);
        }

        // make sure they stay within 0-255 range
        r = normalizeColor(r);
        g = normalizeColor(g);
        b = normalizeColor(b);

        stroke(r, g, b, a);

        // point
        ellipse(jitterz.points[pt][0], jitterz.points[pt][1], 1, 1);

        line(
            jitterz.points[pt][0],
            jitterz.points[pt][1],
            jitterz.points[pt + 1][0],
            jitterz.points[pt + 1][1]
        );
        pt++;
    }

    // draw the ratio of success rectangle
    strokeWeight(0);
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
        currentLevel++;
    }
}

function draw() {
    jitter(includeBias);
}
