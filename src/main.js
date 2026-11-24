import './style.css'

import { Engine, FreeCamera, HemisphericLight, Scene, Vector3, LoadAssetContainerAsync, HavokPlugin, PhysicsAggregate, PhysicsShapeType, PhysicsViewer  } from '@babylonjs/core';
import "@babylonjs/loaders/glTF";
import HavokPhysics from "@babylonjs/havok";

const canvas = document.getElementById("renderCanvas");
const engine = new Engine(canvas, true);

async function loadModel(scene, modelName){
  const container = await LoadAssetContainerAsync(`/assets/models/${modelName}`, scene); 

  return container;
}

const havokInstance = await HavokPhysics();
const havokPlugin = new HavokPlugin(true, havokInstance);

class MapCreatorScene extends Scene {
  constructor(...params){
    super(...params);
  }

  async create(){
    this.camera = new FreeCamera("camera1", new Vector3(0, 3, -5), this);
    this.camera.setTarget(Vector3.Zero());
    this.light = new HemisphericLight("light", new Vector3(0, 1, 0), this);
    this.light.intensity = 0.7;

    this.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);

    const physicsViewer = new PhysicsViewer(this);

    const start = await loadModel(this, "start.glb");
    console.log(start)
    start.addAllToScene();
    const boxAggregate = new PhysicsAggregate(
      start.meshes[1],
      PhysicsShapeType.BOX,
      { mass: 0 },
      this
    );
    console.log(physicsViewer.showBody(boxAggregate.body));

    const straight = await loadModel(this, "straight.glb");
    //straight.addAllToScene();

    const blueBall = await loadModel(this, "ball-blue.glb");
    blueBall.addAllToScene();
    console.log(blueBall)
    blueBall.meshes[1].position.y = 1;
    const ballAggregate = new PhysicsAggregate(
      blueBall.meshes[1],
      PhysicsShapeType.SPHERE,
      { mass: 1, restitution: 0.75, friction: 0.2 },
      this
    );
  }
}

const scene = new MapCreatorScene(engine);
await scene.create();
await scene.whenReadyAsync();
engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
