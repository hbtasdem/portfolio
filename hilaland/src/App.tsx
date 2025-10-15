import { useRef, useState } from "react";
import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const Planet = ({
  orbitRadius,
  orbitSpeed,
  planetSize,
  planetColor,
  label,
  onClick
}: {
  orbitRadius: number,
  orbitSpeed: number,
  planetSize: number,
  planetColor: string,
  label: string,
  onClick: () => void
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Orbit animation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * orbitSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Orbit path visualization (optional) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[orbitRadius - 0.05, orbitRadius + 0.05, 64]} />
        <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
      </mesh>

      {/* The planet itself */}
      <group position={[orbitRadius, 0, 0]}>
        <mesh
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.2 : 1}
        >
          <sphereGeometry args={[planetSize, 32, 32]} />
          <meshStandardMaterial 
            color={planetColor}
            emissive={hovered ? planetColor : "#000000"}
            emissiveIntensity={hovered ? 0.5 : 0}
            metalness={0.4}
            roughness={0.6}
          />
        </mesh>

        {/* Label */}
        {hovered && (
          <Text
            position={[0, planetSize + 0.5, 0]}
            fontSize={0.3}
            color="#F72585"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        )}
      </group>
    </group>
  );
};

const SolarSystem = ({ show }: { show: boolean }) => {
  const [activePlanet, setActivePlanet] = useState<string | null>(null);

  if (!show) return null;

  const planets = [
    {
      id: "about",
      label: "About Me",
      orbitRadius: 8,
      orbitSpeed: 0.3,
      planetSize: 1,
      planetColor: "#4A90E2"
    },
    {
      id: "projects",
      label: "Projects",
      orbitRadius: 12,
      orbitSpeed: 0.2,
      planetSize: 1.2,
      planetColor: "#E24A90"
    },
    {
      id: "contact",
      label: "Contact",
      orbitRadius: 16,
      orbitSpeed: 0.15,
      planetSize: 0.8,
      planetColor: "#90E24A"
    }
  ];

  return (
    <>
      {planets.map((planet) => (
        <Planet
          key={planet.id}
          orbitRadius={planet.orbitRadius}
          orbitSpeed={planet.orbitSpeed}
          planetSize={planet.planetSize}
          planetColor={planet.planetColor}
          label={planet.label}
          onClick={() => {
            console.log(`Clicked ${planet.label}`);
            setActivePlanet(planet.id);
          }}
        />
      ))}

      {/* Temporary - show what was clicked */}
      {activePlanet && (
        <Text
          position={[0, 8, 0]}
          fontSize={0.5}
          color="#F72585"
        >
          {activePlanet.toUpperCase()}
        </Text>
      )}
    </>
  );
};

const CameraCtrl = ({ shouldZoom }: { shouldZoom: boolean }) => {
  const {camera} = useThree();
  const zoomStart = useRef(false);
  const camStart = useRef(new THREE.Vector3());
  const animProg = useRef(0);

  const camTarget = new THREE.Vector3(0, -2, 7);
  const zoomTimer = 3;

  const lookAtStart = useRef(new THREE.Vector3());
  const lookAtTarget = new THREE.Vector3(0, -1, 0);
 
  useFrame((_, delta) => {
    if(shouldZoom && !zoomStart.current) {
      camStart.current.copy(camera.position);
      lookAtStart.current.set(0, 0, 0); 
      zoomStart.current = true;
    }
    
    if(zoomStart.current && animProg.current < 1) {
      animProg.current += delta/zoomTimer;
      animProg.current = Math.min(animProg.current, 1);

      const eased = animProg.current < 0.5
        ? 2 * animProg.current * animProg.current
        : 1 - Math.pow(-2 * animProg.current + 2, 2) / 2;

      camera.position.lerpVectors(camStart.current, camTarget, eased);

      const currentLookAt = new THREE.Vector3();
      currentLookAt.lerpVectors(lookAtStart.current, lookAtTarget, eased);
      camera.lookAt(currentLookAt);
    }
  });
  
  return null;
};

const Sphere = ({ onSettle }: { onSettle: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(0);
  const hasSettledRef = useRef(false);

  useFrame((_, delta) => {
    if (meshRef.current && !hasSettledRef.current) {
      const gravity = -80;
      const damping = 0.7;
      const groundLevel = -5;
      const stopThreshold = 0.3;

      velocityRef.current += gravity * delta;
      meshRef.current.position.y += velocityRef.current * delta;

      if (meshRef.current.position.y <= groundLevel) {
        meshRef.current.position.y = groundLevel;
        velocityRef.current = -velocityRef.current * damping;

        if (Math.abs(velocityRef.current) < stopThreshold) {
          velocityRef.current = 0;
          hasSettledRef.current = true;
          
          setTimeout(() => {
            onSettle();
          }, 80);
        }
      }
    }
  });

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
      <p className="font-work text-4xl font-semibold text-[#680431] mt-6">
        Mayor: Hilal B Tasdemir
      </p>
    </div>
  );
};

const App = () => {
  const [showName, setShowName] = useState(false);
  const [shouldZoom, setShouldZoom] = useState(false);
  const [shouldRotate, setShouldRotate] = useState(false); 
  const [showPlanets, setShowPlanets] = useState(false);

  const handleSettle = () => {
    setShowName(true);
    setShouldRotate(true);
    setTimeout(() => {
      setShouldZoom(true);
      setShouldRotate(false);
    }, 2000);
    setTimeout(() => {
      setShowPlanets(true); // Show orbiting planets
      setShouldRotate(true);
    }, 5500);
  };
  
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50 }}
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping={true}
          enableRotate={false}
          autoRotate={shouldRotate}
          autoRotateSpeed={3}
          target={[0, -1, 0]}
          enabled={true}
        />

        <CameraCtrl shouldZoom={shouldZoom} />

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

        <Sphere onSettle={handleSettle} />
        
        {/* Ground plane */}
        <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#FFF3C7" opacity={0} transparent />
        </mesh>

        {/* Houses appear after zoom */}
      <SolarSystem show={showPlanets} />
      </Canvas>

      <NameReveal show={showName} />
    </div>
  );
};

export default App;
// import { useRef, useState } from "react";
// import { CameraControls, OrbitControls, Text } from "@react-three/drei";
// import { Canvas, events, useFrame, useThree } from "@react-three/fiber";
// import * as THREE from "three";

// // const Button3D = ({
// //   position, text, url
// // }: {
// //   position: [number, number, number],
// //   text: string,
// //   url: string
// // }) => {
// //   const [hover, setHover] = useState(false);

// //   const handleClick = () => {
// //     window.open(url, '_blank'); // opens project in a new tab
// //   };

// //   return (
// //     <group position={position}>
// //     <mesh
// //       onClick = {handleClick}
// //       onPointerOver = {() => setHover(true)}
// //       onPointerOut = {() => setHover(false)}
// //       scale = {hover ? 1.1 : 1}
// //       > 

// //       <boxGeometry args = {[2, 0.5, 0.2]} />
// //       <meshStandardMaterial
// //         color = {hover ? "#b25e7c" : "#ff87b2"}
// //         metalness = {0.2}
// //         roughness = {0.5}
// //       />
// //     </mesh>

// //     <Text
// //       position={[0, 0, 0.11]}  
// //       fontSize={0.3}
// //       color={"white"}
// //       anchorX={"center"}
// //       anchorY={"middle"}
// //     >
// //       {text}
// //     </Text>
// //     </group>
// //   );
// // };
// const House = ({ 
//   position, 
//   rotation,
//   label,
//   onClick 
// }: { 
//   position: [number, number, number], 
//   rotation: [number, number, number],
//   label: string,
//   onClick: () => void 
// }) => {
//   const [hovered, setHovered] = useState(false);

//   return (
//     <group position={position} rotation={rotation}>
//       {/* Simple house shape */}
//       <mesh
//         onClick={onClick}
//         onPointerOver={() => setHovered(true)}
//         onPointerOut={() => setHovered(false)}
//         scale={hovered ? 1.1 : 1}
//       >
//         {/* House body */}
//         <boxGeometry args={[0.5, 0.5, 0.5]} />
//         <meshStandardMaterial 
//           color={hovered ? "#FFD700" : "#8B4513"} 
//           emissive={hovered ? "#FF6B9D" : "#000000"}
//           emissiveIntensity={hovered ? 0.5 : 0}
//         />
//       </mesh>
      
//       {/* Roof - positioned above the body */}
//       <mesh position={[0, 0.4, 0]}>
//         <coneGeometry args={[0.4, 0.3, 4]} />
//         <meshStandardMaterial color="#DC143C" />
//       </mesh>

//       {/* Label that floats above house */}
//       {hovered && (
//         <Text
//           position={[0, 1, 0]}
//           fontSize={0.15}
//           color="#F72585"
//           anchorX="center"
//           anchorY="middle"
//         >
//           {label}
//         </Text>
//       )}
//     </group>
//   );
// };

// const Houses = ({ show }: { show: boolean }) => {
//   const [activeHouse, setActiveHouse] = useState<string | null>(null);

//   if (!show) return null;

//   // Houses positioned around the planet
//   const houses = [
//     { 
//       label: "About Me", 
//       position: [0, -3.5, 3] as [number, number, number],
//       rotation: [0, 0, 0] as [number, number, number],
//       id: "about"
//     },
//     { 
//       label: "Projects", 
//       position: [3, -3.5, 0] as [number, number, number],
//       rotation: [0, Math.PI / 2, 0] as [number, number, number],
//       id: "projects"
//     },
//     { 
//       label: "Contact", 
//       position: [-3, -3.5, 0] as [number, number, number],
//       rotation: [0, -Math.PI / 2, 0] as [number, number, number],
//       id: "contact"
//     },
//   ];

//   return (
//     <>
//       {houses.map((house) => (
//         <House
//           key={house.id}
//           position={house.position}
//           rotation={house.rotation}
//           label={house.label}
//           onClick={() => setActiveHouse(house.id)}
//         />
//       ))}
      
//       {/* Render house interior based on activeHouse
//       {activeHouse === "about" && <AboutHouseInterior onExit={() => setActiveHouse(null)} />}
//       {activeHouse === "projects" && <ProjectsHouseInterior onExit={() => setActiveHouse(null)} />}
//       {activeHouse === "contact" && <ContactHouseInterior onExit={() => setActiveHouse(null)} />} */}
//     </>
//   );
// };

// // const ButtonContainer = ({ show } : { show: boolean }) => {
// //   if(!show)
// //     return null;

// //   const projects = [
// //     { text: "Project 1", url: "https://github.com/yourproject1", position: [5, -2, 0] as [number, number, number] },
// //     { text: "Project 2", url: "https://github.com/yourproject2", position: [0, 0, 0] as [number, number, number] },
// //     { text: "Project 3", url: "https://github.com/yourproject3", position: [-5, -2, 0] as [number, number, number] },
// //   ];

// //   return (
// //     <>
// //       {projects.map((project, i) => (
// //         <Button3D
// //           key={i}
// //           position={project.position}
// //           text={project.text}
// //           url={project.url}
// //           />
// //       ))}
// //     </>
// //   );
// // };


// const CameraCtrl = ({ shouldZoom }: { shouldZoom: boolean }) => {

//   const {camera} = useThree() // get access to the camera
//   const zoomStart = useRef(false);
//   const camStart = useRef(new THREE.Vector3());
//   const animProg = useRef(0);

//   const camTarget = new THREE.Vector3(0, -2, 7);
//   const zoomTimer = 3;

//   const lookAtStart = useRef(new THREE.Vector3());
//   const lookAtTarget = new THREE.Vector3(0, -1, 0); //change this for the final position
 
//  // animate the frames
//   useFrame((_, delta) => {
//     if(shouldZoom && !zoomStart.current) { // check if we should start zooming
//       camStart.current.copy(camera.position); // save the current camera position to your startPosition ref
//       lookAtStart.current.set(0, 0, 0); 
//       zoomStart.current = true;
//     }
    
//     if(zoomStart.current && animProg.current < 1) { // if zoom has started and progress < 1
//       // zoom animation
//       animProg.current += delta/zoomTimer; // increment progress by (delta / duration)
//       animProg.current = Math.min(animProg.current, 1);

//       // smooth easing (ease-in-out)
//       const eased = animProg.current < 0.5
//         ? 2 * animProg.current * animProg.current
//         : 1 - Math.pow(-2 * animProg.current + 2, 2) / 2;

//       camera.position.lerpVectors(camStart.current, camTarget, eased);


//       const currentLookAt = new THREE.Vector3();
//       currentLookAt.lerpVectors(lookAtStart.current, lookAtTarget, eased);
//       camera.lookAt(currentLookAt);

//     }
    
//   });
  
//   return null; // This component doesn't render anything visible
// };


// const Sphere = ({ onSettle }: { onSettle: () => void }) => {
//   const meshRef = useRef<THREE.Mesh>(null);
//   const velocityRef = useRef(0);
//   const hasSettledRef = useRef(false);

//   useFrame((_, delta) => {
//     if (meshRef.current && !hasSettledRef.current) {
//       const gravity = -80;
//       const damping = 0.7; // energy loss on bounce (lower = more loss)
//       const groundLevel = -5;
//       const stopThreshold = 0.3; // when to consider ball "stopped"

//       // apply velocity
//       velocityRef.current += gravity * delta;

//       // update position
//       meshRef.current.position.y += velocityRef.current * delta;

//       // ground collision
//       if (meshRef.current.position.y <= groundLevel) {
//         meshRef.current.position.y = groundLevel; // snap to ground
//         velocityRef.current = -velocityRef.current * damping; // bounce with energy loss

//         // Check if ball has essentially stopped
//         if (Math.abs(velocityRef.current) < stopThreshold) {
//           velocityRef.current = 0;
//           hasSettledRef.current = true;
          
//           // Trigger name reveal after short delay
//           setTimeout(() => {
//             onSettle();
//           }, 80);
//         }
//       }
//     }
//   });

//   return (
//     <mesh ref={meshRef} position={[0, 10, 0]}>
//       <sphereGeometry args={[4, 32, 32]} />
//       <meshStandardMaterial color="#FF87B2" metalness={0.5} roughness={0.35} />
//     </mesh>
//   );
// };

// const NameReveal = ({ show }: { show: boolean }) => {
//   return (
//     <div
//       className={`
//         absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
//         text-center pointer-events-none
//         transition-opacity duration-500 ease-in
//         ${show ? 'opacity-100' : 'opacity-0'}
//       `}
//     >
//       <h1 className="font-orbitron text-6xl font-bold text-[#F72585] m-0 drop-shadow-md">
//         Welcome to HilaLand
//       </h1>
//       {/* <p className="font-work text-4xl text-[#2F0216]-600 mt-4"> */}
//       <p className="font-work text-4xl font-semibold text-[#680431] mt-6 ">

//         {/* Developer | Designer | Creator */}
//         Mayor: Hilal B Tasdemir
//       </p>
//     </div>
//   );
// };

// const App = () => {
//   const [showName, setShowName] = useState(false);
//   const [shouldZoom, setShouldZoom] = useState(false);
//   const [shouldRotate, setShouldRotate] = useState(false); 
//   const [showButtons, setShowButtons] = useState(false);

//   const handleSettle = () => {
//     setShowName(true);
//     setShouldRotate(true);
//     setTimeout(() => {
//       setShouldZoom(true);
//     }, 2000);
//     setTimeout(() => {
//       setShowButtons(true);
//     }, 3000); // Show 3 seconds after zoom starts
//   };

//   const handleZoomComplete = () => {
//     setTimeout(() => {
//       setShowButtons(true);
//     }, 3000); // Show 3 seconds after zoom starts
//   };
  
//   return (
//     <div style={{ width: "100vw", height: "100vh", position: "relative" }}>

//       <Canvas
//         // camera={{ position: [0, 0, 15] }}
//         camera={{ position: [0, 0, 20], fov: 50 }}

//         style={{
//           height: "100vh",
//           width: "100vw",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <OrbitControls
//           enableZoom={true}
//           enablePan={true}
//           enableDamping={true}
//           enableRotate={true}
//           autoRotate={!shouldZoom}
//           autoRotateSpeed={5}
//           enabled={!shouldZoom}
//           // enabled={true}

//         />

//         <CameraCtrl shouldZoom={shouldZoom} />

//         {/* Lighting */}
//         <ambientLight intensity={0.5} />
//         <directionalLight
//           position={[10, 10, 5]}
//           intensity={2.5}
//           color="#ffffff"
//         />
//         <pointLight position={[-10, 0, -5]} intensity={1.5} color="#FFB7D5" />
//         <pointLight position={[0, -10, 0]} intensity={1} color="#FFF8E1" />



//         {/* Background */}
//         <color attach="background" args={["#FFF3C7"]} />

//         <Sphere onSettle={handleSettle} />
//         {/* <Sphere onSettle={() => setShowName(true)} /> */}
        
//         {/* Ground plane for reference */}
//         {/* <mesh position={[0, -50, 0]} rotation={[-Math.PI / 2, 0, 0]}> */}
//         <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
//           <planeGeometry args={[50, 50]} />
//           <meshStandardMaterial color="#FFF3C7" opacity={0} transparent />
//         </mesh>
//         <ButtonContainer show={showButtons} />
//       </Canvas>

//       <NameReveal show={showName} />
//     </div>
//   );
// };

// export default App;
