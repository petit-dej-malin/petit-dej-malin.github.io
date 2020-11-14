// TODO: Rajouter des bruits de miettes, du sucre qui colle, et un CD de démo pour la playstation dans le paquet

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

engine.loadingUIBackgroundColor = "#5ca3fa";

// Meshes
var mesh_camRig;
var camera_main;

const maxRotationX = 4.75;
const rotationOffsetX = -0.7;

const maxRotationY = 3.6;
const rotationOffsetY = 0;

const camPositionNormal = -8;
const camPositionZoomed = -4.75;

var zoomed = false;
var zoomTween = 0;

var mobile = false;

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.createDefaultEnvironment({
        createSkybox: false,
        createGround: false
    });
    var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(1,5,-10), scene, true);

    BABYLON.SceneLoader.Append("", "nestreats.babylon", scene, function () {
        var light = scene.lights[0];
        light.intensity = 1.8;

        mesh_camRig = scene.getMeshByName("Cam Rig");
        camera_main = scene.getCameraByName("Main Camera");
        camera_main.position =  new BABYLON.Vector3(0, 0, camPositionNormal);

        scene.materials.forEach(mat => {
            if(mat.ambientColor !== undefined) {
                mat.ambientColor = new BABYLON.Color3(1,1,1);
                mat.albedoTexture = new BABYLON.Texture("texture.png");
            }
        });

        scene.ambientColor = new BABYLON.Color3(1,1,1);
    
        mesh_camRig.rotation = new BABYLON.Vector3(0, 0, 0);

        updateRotation(0.5, 0.5);

        scene.onPointerMove = function (evt) {
            updateRotation(evt.pageX / window.innerWidth, evt.pageY / window.innerHeight);
        }

        scene.onPointerDown = function (evt) {
            if(!mobile) zoomed = true;
        }

        scene.onPointerUp = function (evt) {
            zoomed = false;
        }


        scene.clearColor = (1, 1, 1, 0.0);
        scene.setActiveCameraByName("Main Camera");
    });

    return scene;
};

var scene = createScene();

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    mobile = true;
}

engine.runRenderLoop(function () {
    scene.render();
    var deltaTime = engine.getDeltaTime();

    if(zoomed && zoomTween < 1) {
        zoomTween += deltaTime * 0.005;
        if(zoomTween > 1) zoomTween = 1;
        camera_main.position = new BABYLON.Vector3(0, 0, lerp(camPositionNormal, camPositionZoomed, easeInOutQuad(zoomTween)));
    } else if(!zoomed && zoomTween > 0) {
        zoomTween -= deltaTime * 0.01;
        if(zoomTween < 0) zoomTween = 0;
        camera_main.position = new BABYLON.Vector3(0, 0, lerp(camPositionNormal, camPositionZoomed, easeInOutQuad(zoomTween)));
    }
});

window.addEventListener("resize", function () {
    engine.resize();
});

function updateRotation(mouseX, mouseY) {
    let horizontalRotation = mouseX * maxRotationX - (maxRotationX / 2) + rotationOffsetX;
    let verticalRotation = easeOutEnds(mouseY) * maxRotationY - (maxRotationY / 2) + rotationOffsetY;
    mesh_camRig.rotation = new BABYLON.Vector3(verticalRotation, horizontalRotation, 0);
}


function lerp(a, b, t) {
    return a + (b - a) * t;
}

function min(a, b) {
    return a < b ? a : b;
}

function max(a, b) {
    return a > b ? a : b;
}

function clamp(value, minVal, maxVal) {
    if(minVal < maxVal) {
        return min(max(value, minVal), maxVal);
    } else {
        return max(min(value, minVal), maxVal);
    }
}

function easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
}

function easeInQuad(x) {
    return x * x;
}

function easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function easeOutEnds(x) {
    var result = x;
    if(x < 0.5) {
        result = easeOutQuad(x * 2) * 0.5;
    } else {
        result = easeInQuad(x * 2 - 1) * 0.5 + 0.5;
    }
    return lerp(result, x, 0.65);
}