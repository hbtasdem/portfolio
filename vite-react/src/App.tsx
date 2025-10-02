
import React, { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Sphere = () => {
  // const meshRef = useRef();
  const meshRef = useRef(null);
  return (
    // <mesh position={[0, 0, -10]}>
    <mesh ref={meshRef}>
      {/* <sphereBufferGeometry args={[5, 24, 24]} /> */}
      <sphereGeometry args={[5, 24, 24]} />
      <meshStandardMaterial color={"orange"} />
    </mesh>
  );
};

const App = () => {
  return (
    <Canvas 
    camera={{ position: [0, 0, 15] }}
    style = {{ height: "100vh", width: "100vw", display: "flex", justifyContent:"center", alignItems:"center"}}>
        <OrbitControls enableZoom={true} enablePan={true} enableDamping={true} enableRotate={true} />
        <directionalLight position={[1,1,1]} intensity={10} color={0x38c083ff} />
        <color attach="background" args={["#b5dfb2"]} />


        <Sphere />

    </Canvas>
  );
};

export default App;