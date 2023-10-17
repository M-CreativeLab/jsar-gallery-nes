import { NES } from './jsnes/nes';
import { Controller } from './jsnes/controller';
import marioBin from './roms/mario.nes.bin';

const { scene } = spatialDocument;

var SCREEN_WIDTH = 256;
var SCREEN_HEIGHT = 240;
var FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;

let targetGameObject: BABYLON.Mesh;
const model = spatialDocument.getNodeById('model');
if (!model) {
  const ground = BABYLON.MeshBuilder.CreateBox('ground', {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    depth: SCREEN_HEIGHT,
  }, scene);
  ground.rotation.x = Math.PI / 3;

  {
    const mat = new BABYLON.StandardMaterial('mat', scene);
    mat.roughness = 1;
    // mat.diffuseColor = new BABYLON.Color3(1, 1, 0);
    mat.sideOrientation = BABYLON.Material.ClockWiseSideOrientation;
    ground.material = mat;
  }
  targetGameObject = ground;
} else {
  const screen = model.getChildMeshes().find(mesh => mesh.name === 'Object_16');
  if (screen) {
    {
      const mat = new BABYLON.StandardMaterial('mat', scene);
      // mat.albedoColor = new BABYLON.Color3(1, 0.3, 0.3);
      mat.roughness = 1;
      mat.diffuseColor = new BABYLON.Color3(1, 1, 0);
      mat.sideOrientation = BABYLON.Material.ClockWiseSideOrientation;
      screen.material = mat;
      screen.rotate(BABYLON.Axis.X, Math.PI, BABYLON.Space.WORLD);
    }
    targetGameObject = screen as BABYLON.Mesh;
  }
}

const groundTex = new BABYLON.DynamicTexture("dynamic texture", {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
}, scene, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, BABYLON.Engine.TEXTUREFORMAT_RGBA, false);
(targetGameObject.material as BABYLON.StandardMaterial).diffuseTexture = groundTex;

const context2d = groundTex.getContext();
context2d.fillStyle = 'red';
context2d.fillRect(0, 0, SCREEN_WIDTH, 20);

var buffer = new ArrayBuffer(FRAMEBUFFER_SIZE * 4);
var framebuffer_u8 = new Uint8ClampedArray(buffer);
var framebuffer_u32 = new Uint32Array(buffer);

var nes = new NES({
  onFrame: function (framebuffer_24) {
    for (var i = 0; i < FRAMEBUFFER_SIZE; i++) {
      framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
    }
    const imageData = new ImageData(framebuffer_u8, SCREEN_WIDTH, SCREEN_HEIGHT);
    context2d.putImageData(imageData, 0, 0);
  },
  onAudioSample: function (left, right) {
    // ... play audio sample
  }
});

const romData = Buffer.from(marioBin).toString('binary');
nes.loadROM(romData);

scene.registerAfterRender(function () {
  nes.frame();
});

function keyboard(callback, code) {
  var player = 1;
  switch (code) {
    case 38: // UP
      callback(player, Controller.BUTTON_UP); break;
    case 40: // Down
      callback(player, Controller.BUTTON_DOWN); break;
    case 37: // Left
      callback(player, Controller.BUTTON_LEFT); break;
    case 39: // Right
      callback(player, Controller.BUTTON_RIGHT); break;
    case 65: // 'a' - qwerty, dvorak
    case 81: // 'q' - azerty
      callback(player, Controller.BUTTON_A); break;
    case 83: // 's' - qwerty, azerty
    case 79: // 'o' - dvorak
      callback(player, Controller.BUTTON_B); break;
    case 9: // Tab
      callback(player, Controller.BUTTON_SELECT); break;
    case 13: // Return
      callback(player, Controller.BUTTON_START); break;
    default: break;
  }
}

spatialDocument.watchInputEvent();
spatialDocument.addEventListener('mouse', (event: any) => {
  const { inputData } = event;
  if (inputData.Action === 'down') {
    keyboard(nes.buttonDown, 13);
  } else if (inputData.Action === 'up') {
    keyboard(nes.buttonUp, 13);
  }
});
