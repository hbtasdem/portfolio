import { useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Sphere = ({ onSettle }: { onSettle: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(0);
  const hasSettledRef = useRef(false);

  useFrame((_, delta) => {
    if (meshRef.current && !hasSettledRef.current) {
      const gravity = -80;
      const damping = 0.7; // energy loss on bounce (lower = more loss)
      const groundLevel = -5;
      const stopThreshold = 0.3; // when to consider ball "stopped"

      // apply velocity
      velocityRef.current += gravity * delta;

      // update position
      meshRef.current.position.y += velocityRef.current * delta;

      // ground collision
      if (meshRef.current.position.y <= groundLevel) {
        meshRef.current.position.y = groundLevel; // snap to ground
        velocityRef.current = -velocityRef.current * damping; // bounce with energy loss

        // Check if ball has essentially stopped
        if (Math.abs(velocityRef.current) < stopThreshold) {
          velocityRef.current = 0;
          hasSettledRef.current = true;
          
          // Trigger name reveal after short delay
          setTimeout(() => {
            onSettle();
          }, 80);
        }
      }
    }
  });
    // if (hasSettledRef.current) {
    //   const rotate = -10;

    // }


  return (
    <mesh ref={meshRef} position={[0, 10, 0]}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshStandardMaterial color="#FF87B2" metalness={0.5} roughness={0.35} />
    </mesh>
  );
};

const NameReveal = ({ show }: { show: boolean }) => {
  return (
    <div
      className={`
        absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
        text-center pointer-events-none
        transition-opacity duration-500 ease-in
        ${show ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <h1 className="font-orbitron text-6xl font-bold text-[#F72585] m-0 drop-shadow-md">
        Welcome to HilaLand
      </h1>
      {/* <p className="font-work text-4xl text-[#2F0216]-600 mt-4"> */}
      <p className="font-work text-4xl font-semibold text-[#680431] mt-6 ">

        {/* Developer | Designer | Creator */}
        Mayor: Hilal B Tasdemir
      </p>
    </div>
  );
};

// const PlanetRotator = ({rotater}: {rotater: boolean}) => {

// }

const App = () => {
  const [showName, setShowName] = useState(false);


  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>

      <Canvas
        // camera={{ position: [0, 0, 15] }}
        camera={{ position: [5, 0, 15] }}

        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableDamping={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={5}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={2.5}
          color="#ffffff"
        />
        <pointLight position={[-10, 0, -5]} intensity={1.5} color="#FFB7D5" />
        <pointLight position={[0, -10, 0]} intensity={1} color="#FFF8E1" />

        {/* Background */}
        <color attach="background" args={["#FFF3C7"]} />

        <Sphere onSettle={() => setShowName(true)} />

        {/* Ground plane for reference */}
        {/* <mesh position={[0, -50, 0]} rotation={[-Math.PI / 2, 0, 0]}> */}
        <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#FFF3C7" opacity={0} transparent />
        </mesh>
      </Canvas>

      <NameReveal show={showName} />
    </div>
  );
};

export default App;
