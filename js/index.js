const container = document.getElementById('container');
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
// var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
camera.position.set(25, 2.5, 25);
var frustumSize = 69;

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
var clock = new THREE.Clock();

var axesColor = 0x5ca4a9;
var color = 0xd69dff;
var y = 10;

var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
var graph = new THREE.Object3D();
scene.add(graph);

init();
render();

function makeLine(geo, color, lineWidth = 10, opacity = 1) {
    var g = new MeshLine();
    g.setGeometry(geo);

    var material = new MeshLineMaterial({
        useMap: false,
        color: color,
        opacity: opacity,
        resolution: resolution,
        sizeAttenuation: false,
        lineWidth: lineWidth
    });
    var mesh = new THREE.Mesh(g.geometry, material);
    graph.add(mesh);
}

function init() {
    createLines();
}

function createLines() {
    // var line = new THREE.Geometry();
    // line.vertices.push(new THREE.Vector3(-30, 0, 0));
    // line.vertices.push(new THREE.Vector3(30, 0, 0));
    // makeLine(line, axesColor);

    // var line = new THREE.Geometry();
    // line.vertices.push(new THREE.Vector3(0, 0, -30));
    // line.vertices.push(new THREE.Vector3(0, 0, 30));
    // makeLine(line, axesColor);

    createMesh();
    drawConnections();
}

function createMesh() {
    //top
    var length = 10;
    for (var i = -length; i <= length; i++) {
        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(i, y, -length));
        line.vertices.push(new THREE.Vector3(i, y, length));
        makeLine(line, axesColor, 5);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(-length, y, i));
        line.vertices.push(new THREE.Vector3(length, y, i));
        makeLine(line, axesColor, 5);
    }
    var length = 25;
    for (var i = -length; i <= length; i++) {
        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(i, -y, -length));
        line.vertices.push(new THREE.Vector3(i, -y, length));
        makeLine(line, axesColor, 5);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(-length, -y, i));
        line.vertices.push(new THREE.Vector3(length, -y, i));
        makeLine(line, axesColor, 5, 0.5);
    }
}

function drawConnections() {
    var scaler = 0.1;
    for (var i = -10; i <= 10; i++) {
        for (var j = -0; j <= 10; j++) {
            // radial gradient
            var angle = Math.atan2(i, j);
            if (angle < 0) angle += 2 * Math.PI;
            angle *= 1.1;

            var complex = new Complex(i, j);
            var squared = complex.pow(2);

            var line = new THREE.Geometry();
            line.vertices.push(new THREE.Vector3(i, y, j));
            line.vertices.push(new THREE.Vector3(squared.re * scaler, -y, squared.im * scaler));

            var sat = Math.sqrt(Math.pow(i - squared.re, 2) + Math.pow(j - squared.im, 2)) / 20;
            console.log(sat);
            var RGB = HSVtoRGB(angle, sig(sat), 1);

            makeLine(line, RGB, 10);
        }
    }
}
onWindowResize();

function onWindowResize() {
    var w = container.clientWidth;
    var h = container.clientHeight;

    var aspect = w / h;

    camera.left = (-frustumSize * aspect) / 2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;

    camera.updateProjectionMatrix();

    renderer.setSize(w, h);

    resolution.set(w, h);
}

window.addEventListener('resize', onWindowResize);

function render() {
    requestAnimationFrame(render);
    controls.update();
    graph.rotation.y += 0.1 * clock.getDelta();

    renderer.render(scene, camera);
}
console.log(HSVtoRGB(60, 1, 1));
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        (s = h.s), (v = h.v), (h = h.h);
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            (r = v), (g = t), (b = p);
            break;
        case 1:
            (r = q), (g = v), (b = p);
            break;
        case 2:
            (r = p), (g = v), (b = t);
            break;
        case 3:
            (r = p), (g = q), (b = v);
            break;
        case 4:
            (r = t), (g = p), (b = v);
            break;
        case 5:
            (r = v), (g = p), (b = q);
            break;
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
    return r * 16 * 16 * 16 * 16 + g * 16 * 16 + b;
}
// sigmoid
function sig(x) {
    return 1 / (1 + Math.pow(Math.E, -x));
}
