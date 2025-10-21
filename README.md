# portfolio



import React, { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Sphere = () => {
  // const meshRef = useRef();
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(0); // Track falling speed


useFrame((_, delta) => {
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
      {/* <meshStandardMaterial color={'blue'} /> */}
      <meshStandardMaterial color="#FF006E" metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

const App = () => {
  return (
    <Canvas 
    camera={{ position: [0, 0, 15] }}
    style = {{ height: "100vh", width: "100vw", display: "flex", justifyContent:"center", alignItems:"center"}}>
        <OrbitControls enableZoom={true} enablePan={true} enableDamping={true} enableRotate={true} />
        {/* <directionalLight position={[1,1,1]} intensity={10} color={0x9cdba1} /> */}
        <directionalLight position={[5, 5, 5]} intensity={2} color="#00F5FF" />
        <ambientLight intensity={0.3} />
        {/* <color attach="background" args={["#b5dfb2"]} /> */}
        {/* <color attach="background" args={["#ff9898"]} /> */}
        <color attach="background" args={["#0A0E27"]} />

        <Sphere />

    </Canvas>
  );
};

export default App;







import React, { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Sphere = () => {
  // const meshRef = useRef();
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(0); // Track falling speed


useFrame((_, delta) => {
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
      {/* <meshStandardMaterial color={'blue'} /> */}
{/* <meshStandardMaterial color="#FF6B35" metalness={0.6} roughness={0.3} /> */}
<meshStandardMaterial color="#F08787" metalness={0.4} roughness={0.4} />

    </mesh>
  );
};

const App = () => {
  return (
    <Canvas 
    camera={{ position: [0, 0, 15] }}
    style = {{ height: "100vh", width: "100vw", display: "flex", justifyContent:"center", alignItems:"center"}}>
        <OrbitControls enableZoom={true} enablePan={true} enableDamping={true} enableRotate={true} />
   <ambientLight intensity={0.5} />
<directionalLight position={[5, 5, 5]} intensity={2} color="#d9f7fd" />
<pointLight position={[-5, 0, -5]} intensity={1} color="#8AA624" />
<color attach="background" args={["#d9f7fd"]} />
        <Sphere />

    </Canvas>
  );
};

export default App;