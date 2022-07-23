import {
  BufferGeometry,
  Color,
  FileLoader,
  Float32BufferAttribute,
  Group,
  Loader,
  LoaderUtils,
  LoadingManager,
  Mesh,
  MeshPhongMaterial,
  Points,
  ShaderMaterial,
  Vector3,
} from "three";

export class BSCLoader extends Loader {
  constructor(manager?: LoadingManager) {
    super(manager);
  }

  load = (
    url: string,
    onLoad: (points: Points) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): void => {
    this.loadAsync(url, onProgress).then(onLoad).catch(onError);
  };

  async loadAsync(
    url: string,
    onProgress?: ((event: ProgressEvent<EventTarget>) => void) | undefined
  ): Promise<Points> {
    const fileLoader = new FileLoader(this.manager);
    fileLoader.setPath(this.path);
    fileLoader.setRequestHeader(this.requestHeader);
    fileLoader.setWithCredentials(this.withCredentials);
    const result = await fileLoader.loadAsync(url, onProgress);

    if (typeof result !== "string") {
      throw "wtf";
    }

    return parseBSC(result);
  }
}

interface Star {
  id: number;
  name: string;
  gLon: number;
  gLat: number;
  mag: number;
  spectralClass: string;
  v: Vector3;
}

type Stars = { [id: number]: Star };

export const parseBSC = (bscData: string): Points => {
  const stars: Stars = {};

  const starData = bscData.split("\n");
  const positions = new Array();
  const colors = new Array();
  const color = new Color();
  const sizes = new Array();

  starData.forEach((row) => {
    let star: Star = {
      id: Number(row.slice(0, 4)),
      name: row.slice(4, 14).trim(),
      gLon: Number(row.slice(90, 96)),
      gLat: Number(row.slice(96, 102)),
      mag: Number(row.slice(102, 107)),
      spectralClass: row.slice(129, 130),
      v: new Vector3(),
    };

    stars[star.id] = star;

    star.v = new Vector3().setFromSphericalCoords(
      100,
      ((90 - star.gLat) / 180) * Math.PI,
      (star.gLon / 180) * Math.PI
    );

    positions.push(star.v.x);
    positions.push(star.v.y);
    positions.push(star.v.z);

    switch (star.spectralClass) {
      case "O":
        color.setHex(0x91b5ff);
        break;
      case "B":
        color.setHex(0xa7c3ff);
        break;
      case "A":
        color.setHex(0xd0ddff);
        break;
      case "F":
        color.setHex(0xf1f1fd);
        break;
      case "G":
        color.setHex(0xfdefe7);
        break;
      case "K":
        color.setHex(0xffddbb);
        break;
      case "M":
        color.setHex(0xffb466);
        break;
      case "L":
        color.setHex(0xff820e);
        break;
      case "T":
        color.setHex(0xff3a00);
        break;
      default:
        color.setHex(0xffffff);
    }

    const s = (star.mag * 26) / 255 + 0.18;
    sizes.push(s);
    colors.push(color.r, color.g, color.b, s);
  });

  const starsGeometry = new BufferGeometry();
  starsGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(positions, 3)
  );
  starsGeometry.setAttribute("color", new Float32BufferAttribute(colors, 4));
  starsGeometry.setAttribute("size", new Float32BufferAttribute(sizes, 1));

  const starsMaterial = new ShaderMaterial({
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
    transparent: true,
  });

  console.log(positions);

  const points = new Points(starsGeometry, starsMaterial);

  return points;
};

function vertexShader() {
  return `
    attribute float size;
    attribute vec4 color;
    varying vec4 vColor;
    void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = size * ( 250.0 / -mvPosition.z );
        gl_Position = projectionMatrix * mvPosition;
    }
  `;
}

function fragmentShader() {
  return `
    varying vec4 vColor;
    void main() {
        gl_FragColor = vec4( vColor );
    }
  `;
}
