import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Hotspot {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  status: 'optimal' | 'attention' | 'good';
  health: number;
}

export default function InteractiveCar3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const hotspots: Hotspot[] = [
    {
      id: 'engine',
      name: 'Engine Diagnostic',
      description: 'Full Synthetic Oil, Filters, and Spark Plugs verification. Peak performance.',
      position: [0, 0.4, 1.4],
      status: 'optimal',
      health: 98,
    },
    {
      id: 'brakes',
      name: 'Braking System',
      description: 'Ceramic brake pads and fluid pressure analysis. Responsive and safe.',
      position: [0.8, -0.2, 1.0],
      status: 'good',
      health: 85,
    },
    {
      id: 'ac',
      name: 'AC & Climate Control',
      description: 'Refrigerant pressure, cabin filter state, and blower health.',
      status: 'attention',
      position: [0, 0.5, 0.3],
      health: 65,
    },
    {
      id: 'transmission',
      name: 'Gearbox & Transmission',
      description: 'Torque distribution, fluid viscosity, and gear shifting analysis.',
      position: [0, 0.1, -0.6],
      status: 'optimal',
      health: 95,
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 400;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#090d16', 0.15);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 2.5, 5);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    setLoading(false);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#1d2436', 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight('#3b82f6', 3.0);
    dirLight1.position.set(5, 10, 3);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight('#ffffff', 1.5);
    dirLight2.position.set(-5, 2, -3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight('#3b82f6', 2.5, 8);
    pointLight.position.set(0, 1.2, 0.5);
    scene.add(pointLight);

    // 5. Build Procedural Futuristic Car Group
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // Materials
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: '#0e1726',
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: '#0088ff',
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });

    const glowingGlassMat = new THREE.MeshPhysicalMaterial({
      color: '#00f0ff',
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5,
    });

    const wheelMat = new THREE.MeshStandardMaterial({
      color: '#111317',
      roughness: 0.8,
      metalness: 0.2,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: '#8b9bb4',
      metalness: 0.9,
      roughness: 0.2,
    });

    // 5.1 Car main body
    const bodyGeom = new THREE.BoxGeometry(1.4, 0.4, 3.4);
    const mainBody = new THREE.Mesh(bodyGeom, bodyMat);
    mainBody.position.y = 0.25;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    carGroup.add(mainBody);

    const mainBodyWire = new THREE.Mesh(bodyGeom, wireMat);
    mainBodyWire.position.copy(mainBody.position);
    carGroup.add(mainBodyWire);

    // 5.2 Cabin / Windshield area
    const cabinGeom = new THREE.BoxGeometry(1.2, 0.35, 1.5);
    const cabin = new THREE.Mesh(cabinGeom, glowingGlassMat);
    cabin.position.set(0, 0.6, -0.2);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Sleek spoiler
    const spoilerGeom = new THREE.BoxGeometry(1.5, 0.05, 0.3);
    const spoiler = new THREE.Mesh(spoilerGeom, bodyMat);
    spoiler.position.set(0, 0.55, -1.6);
    const spoilerWingL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.2), bodyMat);
    spoilerWingL.position.set(-0.7, 0.4, -1.6);
    const spoilerWingR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.2), bodyMat);
    spoilerWingR.position.set(0.7, 0.4, -1.6);
    carGroup.add(spoiler, spoilerWingL, spoilerWingR);

    // 5.3 Wheels
    const wheels: THREE.Mesh[] = [];
    const wheelPositions = [
      [-0.8, 0, 1.1],  // Front Left
      [0.8, 0, 1.1],   // Front Right
      [-0.8, 0, -1.1], // Back Left
      [0.8, 0, -1.1],  // Back Right
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheelContainer = new THREE.Group();
      wheelContainer.position.set(x, y, z);

      const wheelGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 24);
      wheelGeom.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(wheelGeom, wheelMat);
      tire.castShadow = true;
      wheelContainer.add(tire);

      // Rim details
      const rimGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.36, 12);
      rimGeom.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeom, rimMat);
      wheelContainer.add(rim);

      // Glowing spoke accents
      const spokeGeom = new THREE.BoxGeometry(0.05, 0.5, 0.05);
      for (let i = 0; i < 4; i++) {
        const spoke = new THREE.Mesh(spokeGeom, glowingGlassMat);
        spoke.rotation.x = (i * Math.PI) / 4;
        wheelContainer.add(spoke);
      }

      carGroup.add(wheelContainer);
      wheels.push(tire);
    });

    // 5.4 Underglow & Ground Grid
    const gridHelper = new THREE.GridHelper(20, 40, '#006ce4', '#151c2e');
    gridHelper.position.y = -0.42;
    scene.add(gridHelper);

    // 5.5 Particle System (AI Diagnostics Sparks)
    const particleCount = 60;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Spawn particles near engine, traveling backwards
      positions[i * 3] = (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4 + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      speeds.push(0.02 + Math.random() * 0.03);
    }

    particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: '#00f3ff',
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particlesGeom, particlesMat);
    carGroup.add(particleSystem);

    // 6. Interactive Hotspots (Visually representation in 3D scene)
    const hotspotSpheres: { [id: string]: THREE.Mesh } = {};
    const hotspotGroup = new THREE.Group();
    carGroup.add(hotspotGroup);

    hotspots.forEach((hs) => {
      const parentNode = new THREE.Group();
      parentNode.position.set(...hs.position);

      // Core pulsing sphere
      const hsGeom = new THREE.SphereGeometry(0.12, 16, 16);
      const hsMat = new THREE.MeshBasicMaterial({
        color: '#00f3ff',
        transparent: true,
        opacity: 0.8,
      });
      const sphere = new THREE.Mesh(hsGeom, hsMat);
      parentNode.add(sphere);

      // Glowing outer aura
      const ringGeom = new THREE.RingGeometry(0.16, 0.22, 16);
      ringGeom.lookAt(new THREE.Vector3(0, 1, 0));
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#00f3ff',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.name = 'ring';
      parentNode.add(ring);

      sphere.name = hs.id;
      hotspotGroup.add(parentNode);
      hotspotSpheres[hs.id] = sphere;
    });

    // Raycasting for interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Rotate camera slightly based on mouse coordinates for dynamic feel
      targetRotationY = mouse.x * 0.4;
      targetRotationX = mouse.y * 0.2 + 0.3; // base elevation
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const meshes = Object.values(hotspotSpheres);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const clickedId = intersects[0].object.name;
        const matched = hotspots.find((h) => h.id === clickedId);
        if (matched) {
          setActiveHotspot(matched);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // 7. Animation loop variables
    let targetRotationX = 0.3;
    let targetRotationY = 0;
    let currentRotationX = 0.3;
    let currentRotationY = 0;
    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Smooth camera orientation transition (orbit look)
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      const radius = 6.2;
      camera.position.x = radius * Math.sin(currentRotationY) * Math.cos(currentRotationX);
      camera.position.z = radius * Math.cos(currentRotationY) * Math.cos(currentRotationX);
      camera.position.y = radius * Math.sin(currentRotationX) + 0.5;
      camera.lookAt(0, 0.2, 0);

      // Spin the wheels
      wheels.forEach((w) => {
        w.rotation.x += 0.08;
      });

      // Animate particles
      const positionsAttr = particlesGeom.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let z = positionsAttr.getZ(i);
        z -= speeds[i];
        if (z < -1.8) {
          z = 1.8;
          positionsAttr.setX(i, (Math.random() - 0.5) * 1.2);
          positionsAttr.setY(i, (Math.random() - 0.5) * 0.4 + 0.2);
        }
        positionsAttr.setZ(i, z);
      }
      positionsAttr.needsUpdate = true;

      // Pulse the hotspots
      hotspotGroup.children.forEach((node) => {
        const ring = node.getObjectByName('ring');
        if (ring) {
          const scale = 1 + Math.sin(time * 5) * 0.15;
          ring.scale.set(scale, scale, scale);
        }
      });

      // Simple automatic slow float when user goes idle
      if (Math.abs(mouse.x) < 0.02 && Math.abs(mouse.y) < 0.02) {
        carGroup.rotation.y = Math.sin(time * 0.3) * 0.15;
      } else {
        carGroup.rotation.y += (0 - carGroup.rotation.y) * 0.05;
      }

      // Check hovered hotspot
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(hotspotSpheres));
      if (intersects.length > 0) {
        setHoveredHotspot(intersects[0].object.name);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredHotspot(null);
        document.body.style.cursor = 'default';
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement && containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center rounded-3xl overflow-hidden bg-gradient-to-b from-[#090d16] to-[#04060b] border border-slate-800 shadow-2xl">
      
      {/* 3D Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Futuristic Grid HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl pointer-events-auto max-w-[240px]">
            <p className="text-[10px] font-black tracking-widest text-[#00f3ff] uppercase mb-1">
              SYSTEM ENGINE
            </p>
            <h4 className="text-sm font-bold text-white leading-tight">Diagnostic Model X-1</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Hover & click points to run AI diagnostic scanner.
            </p>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full px-4 py-2 flex items-center gap-2 shadow-xl">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-200 tracking-wider uppercase">Active Scan Node</span>
          </div>
        </div>

        {/* Hotspot details banner */}
        <div className="w-full flex justify-center">
          {activeHotspot ? (
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-blue-500/30 rounded-2xl p-5 shadow-2xl pointer-events-auto max-w-md w-full animate-pop-in relative">
              <button 
                onClick={() => setActiveHotspot(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs font-bold bg-white/5 h-6 w-6 rounded-full flex items-center justify-center transition-all"
              >
                ✕
              </button>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#00f3ff]">
                  {activeHotspot.name}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Health: {activeHotspot.health}%
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{activeHotspot.description}</p>
            </div>
          ) : hoveredHotspot ? (
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-700/40 rounded-xl px-4 py-2 shadow-lg text-center text-xs text-[#00f3ff] uppercase tracking-wider font-bold">
              Click to scan: {hoveredHotspot}
            </div>
          ) : (
            <div className="text-center text-[11px] text-slate-500 font-medium tracking-wide uppercase bg-slate-900/30 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-800/30">
              Interactive 3D Simulation. Drag mouse to rotate.
            </div>
          )}
        </div>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-[#00f3ff] border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initializing 3D Space...</p>
          </div>
        </div>
      )}
    </div>
  );
}
