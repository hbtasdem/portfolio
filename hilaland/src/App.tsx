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
        <meshBasicMaterial color="#00d9ff" opacity={0.3} transparent />
      </mesh>

      {/* The planet itself */}
      <group position={[orbitRadius, 0, 0]}>
        <mesh
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.2 : 1}
        >
          <sphereGeometry args={[planetSize, 24, 24]} />
          <meshStandardMaterial 
            color={planetColor}
            emissive={hovered ? planetColor : "#000000"}
            emissiveIntensity={hovered ? 0.8 : 0.2}
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>

        {/* Label */}
        {hovered && (
          <Text
            position={[0, planetSize + 0.5, 0]}
            fontSize={0.3}
            color="#00d9ff"
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

const SolarSystem = ({ show, onPlanetClick }: { show: boolean, onPlanetClick: (planetId: string) => void }) => {
  const [activePlanet, setActivePlanet] = useState<string | null>(null);

  if (!show) return null;

  const planets = [
    {
      id: "about",
      label: "About Me",
      orbitRadius: 8,
      orbitSpeed: -1.3,
      planetSize: 1,
      planetColor: "#8e3ec2"
    },
    {
      id: "projects",
      label: "Projects",
      orbitRadius: 12,
      orbitSpeed: -1.2,
      planetSize: 1.2,
      planetColor: "#00d9ff"
    },
    {
      id: "contact",
      label: "Contact",
      orbitRadius: 16,
      orbitSpeed: -1,
      planetSize: 0.8,
      planetColor: "#f72585"
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
            onPlanetClick(planet.id);
          }}
        />
      ))}

      {/* Temporary - show what was clicked */}
      {activePlanet && (
        <Text
          position={[0, 8, 0]}
          fontSize={0.5}
          color="#00d9ff"
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
      <sphereGeometry args={[4, 24, 24]} />
      <meshStandardMaterial 
        color="#5b6cd5" 
        metalness={0.8} 
        roughness={0.2} 
        emissive="#5b6cd5" 
        emissiveIntensity={0.3} 
      />
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
      <h1 className="font-orbitron text-6xl font-bold text-[#00d9ff] m-0 drop-shadow-[0_0_20px_rgba(0,217,255,0.8)]">
        Welcome to HilaLand
      </h1>
      <p className="font-work text-4xl font-semibold text-[#9d4edd] mt-6 drop-shadow-[0_0_15px_rgba(157,78,221,0.6)]">
        {/* Mayor: Hilal B Tasdemir */}
      </p>
    </div>
  );
};

const App = () => {
  const [showName, setShowName] = useState(false);
  const [shouldZoom, setShouldZoom] = useState(false);
  const [shouldRotate, setShouldRotate] = useState(false); 
  const [showPlanets, setShowPlanets] = useState(false);
  const [currentView, setCurrentView] = useState<'solar' | 'about' | 'projects' | 'contact'>('solar');

  const handleSettle = () => {
    setShowName(true);
    setShouldRotate(true);
    setTimeout(() => {
      setShouldZoom(true);
      setShouldRotate(false);
    }, 2000);
    setTimeout(() => {
      setShowPlanets(true);
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
          dampingFactor={0.05}
          enableRotate={false}
          autoRotate={shouldRotate}
          autoRotateSpeed={3}
          target={[0, -1, 0]}
          enabled={currentView === 'solar'}
        />

        <CameraCtrl shouldZoom={shouldZoom} />

        {/* Lighting - cyberpunk vibes */}
        <ambientLight intensity={0.3} color="#0a0e27" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          color="#00d9ff"
        />
        <pointLight position={[-10, 0, -5]} intensity={2} color="#9d4edd" />
        <pointLight position={[10, -5, 5]} intensity={1.5} color="#f72585" />
        <pointLight position={[0, -10, 0]} intensity={1} color="#7209b7" />

        {/* Dark cyberpunk background */}
        <color attach="background" args={["#0a0e27"]} />

        {currentView === 'solar' && <Sphere onSettle={handleSettle} />}
        
        {/* Ground plane */}
        <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#0a0e27" opacity={0} transparent />
        </mesh>

        <SolarSystem show={showPlanets && currentView === 'solar'} onPlanetClick={(planetId) => {
          setCurrentView(planetId as 'about' | 'projects' | 'contact');
        }} />
      </Canvas>

      <NameReveal show={showName && currentView === 'solar'} />

      {/* About Me Page */}
      {currentView === 'about' && (
        <div className="absolute inset-0 bg-[#0a0e27]/95 backdrop-blur-sm flex items-center justify-center p-8 animate-fadeIn">
          <div className="max-w-4xl w-full bg-gradient-to-br from-[#7209b7]/20 to-[#0a0e27]/40 backdrop-blur-md rounded-2xl p-12 border border-[#7209b7]/30 shadow-[0_0_50px_rgba(114,9,183,0.3)]">
            {/* Back button */}
            <button
              onClick={() => setCurrentView('solar')}
              className="mb-8 px-6 py-3 bg-[#7209b7] text-white rounded-lg hover:bg-[#9d4edd] transition-all duration-300 hover:shadow-[0_0_20px_rgba(114,9,183,0.6)] font-work"
            >
              ← Back to Solar System
            </button>

            {/* Content */}
            <h2 className="font-orbitron text-5xl font-bold text-[#00d9ff] mb-6 drop-shadow-[0_0_20px_rgba(0,217,255,0.8)]">
              About Me
            </h2>
            
            <div className="space-y-6 text-white/90 font-work text-lg leading-relaxed">
              <p>
                Welcome to my corner of the digital universe! I'm Hilal B Tasdemir, 
                a passionate developer and creator who loves building immersive experiences.
              </p>
              
              <p>
                I specialize in web development, 3D graphics, and interactive design. 
                My mission is to blend creativity with technology to craft experiences 
                that are both beautiful and functional.
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#7209b7]/20 p-6 rounded-lg border border-[#7209b7]/30">
                  <h3 className="text-[#9d4edd] font-bold text-xl mb-3 font-orbitron">Skills</h3>
                  <ul className="space-y-2 text-white/80">
                    <li>• React & Three.js</li>
                    <li>• TypeScript</li>
                    <li>• 3D Web Graphics</li>
                    <li>• UI/UX Design</li>
                  </ul>
                </div>

                <div className="bg-[#7209b7]/20 p-6 rounded-lg border border-[#7209b7]/30">
                  <h3 className="text-[#9d4edd] font-bold text-xl mb-3 font-orbitron">Interests</h3>
                  <ul className="space-y-2 text-white/80">
                    <li>• Creative Coding</li>
                    <li>• Space & Astronomy</li>
                    <li>• Generative Art</li>
                    <li>• Game Development</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

// import { useRef, useState } from "react";
// import { OrbitControls, Text } from "@react-three/drei";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import * as THREE from "three";

// const Planet = ({
//   orbitRadius,
//   orbitSpeed,
//   planetSize,
//   planetColor,
//   label,
//   onClick
// }: {
//   orbitRadius: number,
//   orbitSpeed: number,
//   planetSize: number,
//   planetColor: string,
//   label: string,
//   onClick: () => void
// }) => {
//   const groupRef = useRef<THREE.Group>(null);
//   const [hovered, setHovered] = useState(false);

//   // Orbit animation
//   useFrame((_, delta) => {
//     if (groupRef.current) {
//       groupRef.current.rotation.y += delta * orbitSpeed;
//     }
//   });

//   return (
//     <group ref={groupRef}>
//       {/* Orbit path visualization (optional) */}
//       <mesh rotation={[-Math.PI / 2, 0, 0]}>
//         <ringGeometry args={[orbitRadius - 0.05, orbitRadius + 0.05, 64]} />
//         <meshBasicMaterial color="#00d9ff" opacity={0.3} transparent />
//       </mesh>

//       {/* The planet itself */}
//       <group position={[orbitRadius, 0, 0]}>
//         <mesh
//           onClick={onClick}
//           onPointerOver={() => setHovered(true)}
//           onPointerOut={() => setHovered(false)}
//           scale={hovered ? 1.2 : 1}
//         >
//           <sphereGeometry args={[planetSize, 32, 32]} />
//           <meshStandardMaterial 
//             color={planetColor}
//             emissive={hovered ? planetColor : "#000000"}
//             emissiveIntensity={hovered ? 0.8 : 0.2}
//             metalness={0.6}
//             roughness={0.2}
//           />
//         </mesh>

//         {/* Label */}
//         {hovered && (
//           <Text
//             position={[0, planetSize + 0.5, 0]}
//             fontSize={0.3}
//             color="#00d9ff"
//             anchorX="center"
//             anchorY="middle"
//           >
//             {label}
//           </Text>
//         )}
//       </group>
//     </group>
//   );
// };

// const SolarSystem = ({ show }: { show: boolean }) => {
//   const [activePlanet, setActivePlanet] = useState<string | null>(null);

//   if (!show) return null;

//   const planets = [
//     {
//       id: "about",
//       label: "About Me",
//       orbitRadius: 8,
//       orbitSpeed: -0.8,
//       planetSize: 1,
//       planetColor: "#8e3ec2"
//     },
//     {
//       id: "projects",
//       label: "Projects",
//       orbitRadius: 12,
//       orbitSpeed: -0.7,
//       planetSize: 1.2,
//       planetColor: "#00d9ff"
//     },
//     {
//       id: "contact",
//       label: "Contact",
//       orbitRadius: 16,
//       orbitSpeed: -0.5,
//       planetSize: 0.8,
//       planetColor: "#f72585"
//     }
//   ];

//   return (
//     <>
//       {planets.map((planet) => (
//         <Planet
//           key={planet.id}
//           orbitRadius={planet.orbitRadius}
//           orbitSpeed={planet.orbitSpeed}
//           planetSize={planet.planetSize}
//           planetColor={planet.planetColor}
//           label={planet.label}
//           onClick={() => {
//             console.log(`Clicked ${planet.label}`);
//             setActivePlanet(planet.id);
//             onPlanetClick(planet.id);
//           }}
//         />
//       ))}

//       {/* Temporary - show what was clicked */}
//       {activePlanet && (
//         <Text
//           position={[0, 8, 0]}
//           fontSize={0.5}
//           color="#00d9ff"
//         >
//           {activePlanet.toUpperCase()}
//         </Text>
//       )}
//     </>
//   );
// };

// const CameraCtrl = ({ shouldZoom }: { shouldZoom: boolean }) => {
//   const {camera} = useThree();
//   const zoomStart = useRef(false);
//   const camStart = useRef(new THREE.Vector3());
//   const animProg = useRef(0);

//   const camTarget = new THREE.Vector3(0, -2, 7);
//   const zoomTimer = 3;

//   const lookAtStart = useRef(new THREE.Vector3());
//   const lookAtTarget = new THREE.Vector3(0, -1, 0);
 
//   useFrame((_, delta) => {
//     if(shouldZoom && !zoomStart.current) {
//       camStart.current.copy(camera.position);
//       lookAtStart.current.set(0, 0, 0); 
//       zoomStart.current = true;
//     }
    
//     if(zoomStart.current && animProg.current < 1) {
//       animProg.current += delta/zoomTimer;
//       animProg.current = Math.min(animProg.current, 1);

//       const eased = animProg.current < 0.5
//         ? 2 * animProg.current * animProg.current
//         : 1 - Math.pow(-2 * animProg.current + 2, 2) / 2;

//       camera.position.lerpVectors(camStart.current, camTarget, eased);

//       const currentLookAt = new THREE.Vector3();
//       currentLookAt.lerpVectors(lookAtStart.current, lookAtTarget, eased);
//       camera.lookAt(currentLookAt);
//     }
//   });
  
//   return null;
// };

// const Sphere = ({ onSettle }: { onSettle: () => void }) => {
//   const meshRef = useRef<THREE.Mesh>(null);
//   const velocityRef = useRef(0);
//   const hasSettledRef = useRef(false);

//   useFrame((_, delta) => {
//     if (meshRef.current && !hasSettledRef.current) {
//       const gravity = -80;
//       const damping = 0.7;
//       const groundLevel = -5;
//       const stopThreshold = 0.3;

//       velocityRef.current += gravity * delta;
//       meshRef.current.position.y += velocityRef.current * delta;

//       if (meshRef.current.position.y <= groundLevel) {
//         meshRef.current.position.y = groundLevel;
//         velocityRef.current = -velocityRef.current * damping;

//         if (Math.abs(velocityRef.current) < stopThreshold) {
//           velocityRef.current = 0;
//           hasSettledRef.current = true;
          
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
//       <meshStandardMaterial 
//         color="#5b6cd5" 
//         metalness={0.8} 
//         roughness={0.2} 
//         emissive="#5b6cd5" 
//         emissiveIntensity={0.3} 
//       />
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
//       <h1 className="font-orbitron text-6xl font-bold text-[#00d9ff] m-0 drop-shadow-[0_0_20px_rgba(0,217,255,0.8)]">
//         Welcome to HilaLand
//       </h1>
//       <p className="font-work text-4xl font-semibold text-[#9d4edd] mt-6 drop-shadow-[0_0_15px_rgba(157,78,221,0.6)]">
//         {/* Mayor: Hilal B Tasdemir */}
//       </p>
//     </div>
//   );
// };

// const App = () => {
//   const [showName, setShowName] = useState(false);
//   const [shouldZoom, setShouldZoom] = useState(false);
//   const [shouldRotate, setShouldRotate] = useState(false); 
//   const [showPlanets, setShowPlanets] = useState(false);
//   const [currentView, setCurrentView] = useState<'solar' | 'about' | 'projects' | 'contact'>('solar');

//   const handleSettle = () => {
//     setShowName(true);
//     setShouldRotate(true);
//     setTimeout(() => {
//       setShouldZoom(true);
//       setShouldRotate(false);
//     }, 2000);
//     setTimeout(() => {
//       setShowPlanets(true);
//       setShouldRotate(true);
//     }, 5500);
//   };
  
//   return (
//     <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
//       <Canvas
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
//           enableZoom={false}
//           enablePan={false}
//           enableDamping={true}
//           enableRotate={false}
//           autoRotate={shouldRotate}
//           autoRotateSpeed={3}
//           target={[0, -1, 0]}
//           enabled={true}
//         />

//         <CameraCtrl shouldZoom={shouldZoom} />

//         {/* Lighting - cyberpunk vibes */}
//         <ambientLight intensity={0.3} color="#0a0e27" />
//         <directionalLight
//           position={[10, 10, 5]}
//           intensity={1.5}
//           color="#00d9ff"
//         />
//         <pointLight position={[-10, 0, -5]} intensity={2} color="#9d4edd" />
//         <pointLight position={[10, -5, 5]} intensity={1.5} color="#f72585" />
//         <pointLight position={[0, -10, 0]} intensity={1} color="#7209b7" />

//         {/* Dark cyberpunk background */}
//         <color attach="background" args={["#0a0e27"]} />

//         <Sphere onSettle={handleSettle} />
        
//         {/* Ground plane */}
//         <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
//           <planeGeometry args={[50, 50]} />
//           <meshStandardMaterial color="#0a0e27" opacity={0} transparent />
//         </mesh>

//         <SolarSystem show={showPlanets} onPlanetClick={(planetID) =>
//           { setCurrentView(planetID as 'about' | 'projects' | 'contact')
//         }}/>
//       </Canvas>

//       <NameReveal show={showName} />
        
//     {currentView === 'about' && (
//     <div className="absolute inset-0 bg-[#0a0e27]/95 backdrop-blur-sm flex items-center justify-center p-8">
//       <div className="max-w-4xl w-full bg-gradient-to-br from-[#7209b7]/20 to-[#0a0e27]/40 backdrop-blur-md rounded-2xl p-12 border border-[#7209b7]/30">
        
//         {/* Back button */}
//         <button onClick={() => setCurrentView('solar')}>
//           ← Back to Solar System
//         </button>

//         {/* Your content here */}
//         <h2>About Me</h2>
//         <p>Your bio...</p>
//       </div>
//     </div>
//   )}
      
//     </div>
//   );
// };

// export default App;