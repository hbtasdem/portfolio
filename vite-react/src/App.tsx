
import React, { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Sphere = () => {
  // const meshRef = useRef();
  const meshRef = useRef<THREE.mesh>(null);
  const velocityRef = useRef(0); // Track falling speed

useFrame( (state, delta) => {
  if(meshRef.current) {

      velocityRef.current += -15* delta;

      meshRef.current.position.y += velocityRef.current * delta;

      if(meshRef.current.position.y <= -5) {
        velocityRef.current = 20;
        meshRef.current.position.y += velocityRef.current * delta;

      }
  }
});

  return (
    // <mesh position={[0, 0, -10]}>
    <mesh ref={meshRef}>
      {/* <sphereBufferGeometry args={[5, 24, 24]} /> */}
      <sphereGeometry args={[5, 24, 24]} />
      {/* <cylinderGeometry args={[1,1,1]} /> */}
      <meshPhongMaterial color={"orange"} emissive={"orange"} />
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