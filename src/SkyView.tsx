import * as THREE from "three";
import React, { Suspense } from "react";
import { useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { BSCLoader } from "./BSCLoader";
import {
  Environment,
  ContactShadows,
  PointerLockControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { BackSide, TextureLoader } from "three";

import jwstUrl from "./images/comparison-99-jwst.webp";

function TextureThing() {
  const jwstColor = useLoader(TextureLoader, jwstUrl);
  return (
    <>
      <ambientLight intensity={1.0} />
      <mesh>
        <planeBufferGeometry args={[100, 100]} />
        <meshStandardMaterial map={jwstColor} />
      </mesh>
    </>
  );
}

function Box(props: JSX.IntrinsicElements["mesh"]) {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh>(null!);
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Rotate mesh every frame, this is outside of React without overhead
  useFrame((state, delta) => (ref.current.rotation.x += 0.01));

  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

export default function App() {
  const stars = useLoader(BSCLoader, process.env.PUBLIC_URL + "/data/bsc5.dat");

  return (
    <>
      <Canvas>
        <color attach="background" args={["black"]} />
        {/* <ambientLight intensity={0.5} /> */}
        {/* <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} /> */}
        {/* <pointLight position={[-10, -10, -10]} /> */}
        {/* <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} /> */}

        <Suspense fallback={null}>
          <primitive object={stars} />
          <group position={[0, 0, -100]}>
            <TextureThing />
          </group>
        </Suspense>
        <PointerLockControls />
      </Canvas>
    </>
  );
}
