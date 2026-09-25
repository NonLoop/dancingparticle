/**
 * Cinematic cosmic field — Light Sleep–style core sculpture.
 * Dark metal icosahedron + cyan edges + rings · floaters · soft dust.
 * Mouse parallax · slow rotation.
 */

import * as THREE from "three";

function preferCounts() {
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return { floaters: 22, dust: 400, far: 500 };
  if (!fine) return { floaters: 40, dust: 700, far: 900 };
  return { floaters: 56, dust: 1100, far: 1600 };
}

function makeDotTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(122,240,255,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createParticleField(canvas) {
  const reduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const counts = preferCounts();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x0b0d12, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0d12, 0.018);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 140);
  camera.position.set(0, 0.2, 14);

  // Cinematic lights — cyan key, soft fill, cool rim
  scene.add(new THREE.AmbientLight(0x1a2834, 1.35));

  const key = new THREE.PointLight(0x2ee6ff, 140, 56, 2);
  key.position.set(-6, 5, 8);
  scene.add(key);

  const fill = new THREE.PointLight(0x1a6a80, 70, 50, 2);
  fill.position.set(7, -3, 4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xc8e0ec, 0.85);
  rim.position.set(2, 9, -6);
  scene.add(rim);

  const spot = new THREE.SpotLight(0x7af0ff, 48, 42, Math.PI / 5, 0.5, 1.4);
  spot.position.set(0, 10, 6);
  spot.target.position.set(0, 0.5, 0);
  scene.add(spot);
  scene.add(spot.target);

  // —— Core sculpture ——
  const coreGroup = new THREE.Group();
  coreGroup.position.set(2.2, 0.35, -0.4);
  scene.add(coreGroup);

  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x152028,
    metalness: 0.9,
    roughness: 0.2,
    flatShading: true,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.35, 1), coreMat);
  coreGroup.add(core);

  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.4, 1)),
    new THREE.LineBasicMaterial({
      color: 0x2ee6ff,
      transparent: true,
      opacity: 0.65,
    })
  );
  coreGroup.add(wire);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x2ee6ff,
    transparent: true,
    opacity: 0.5,
  });
  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(4.2, 0.016, 4, 160),
    ringMat
  );
  ringA.rotation.x = Math.PI * 0.45;
  coreGroup.add(ringA);

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(5.5, 0.012, 4, 160),
    new THREE.MeshBasicMaterial({
      color: 0x7af0ff,
      transparent: true,
      opacity: 0.35,
    })
  );
  ringB.rotation.set(Math.PI * 0.58, 0.35, 0.1);
  coreGroup.add(ringB);

  // —— Floating geometry ——
  const floatGroup = new THREE.Group();
  scene.add(floatGroup);

  const geos = [
    new THREE.OctahedronGeometry(0.22, 0),
    new THREE.TetrahedronGeometry(0.26, 0),
    new THREE.IcosahedronGeometry(0.18, 0),
    new THREE.BoxGeometry(0.28, 0.28, 0.28),
  ];
  const floatMats = [
    new THREE.MeshStandardMaterial({
      color: 0x1a3038,
      metalness: 0.85,
      roughness: 0.25,
      flatShading: true,
      emissive: 0x0a3040,
      emissiveIntensity: 0.35,
    }),
    new THREE.MeshStandardMaterial({
      color: 0x152830,
      metalness: 0.9,
      roughness: 0.2,
      flatShading: true,
      emissive: 0x083040,
      emissiveIntensity: 0.25,
    }),
  ];

  const floaters = [];
  for (let i = 0; i < counts.floaters; i++) {
    const mesh = new THREE.Mesh(
      geos[i % geos.length],
      floatMats[i % floatMats.length]
    );
    const depth = (i % 5) + 1;
    const r = 4.5 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 10;
    mesh.position.set(
      Math.cos(theta) * r + (Math.random() - 0.5) * 2,
      y,
      Math.sin(theta) * r * 0.65 - depth * 1.1
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData = {
      speed: 0.12 + Math.random() * 0.28,
      spin: 0.15 + Math.random() * 0.45,
      amp: 0.12 + Math.random() * 0.32,
      baseY: mesh.position.y,
      depth,
      phase: Math.random() * Math.PI * 2,
    };
    floatGroup.add(mesh);
    floaters.push(mesh);

    if (i % 3 === 0) {
      mesh.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(mesh.geometry),
          new THREE.LineBasicMaterial({
            color: 0x2ee6ff,
            transparent: true,
            opacity: 0.22,
          })
        )
      );
    }
  }

  // —— Soft dust field (near mid) ——
  const COUNT = counts.dust;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const cyan = new THREE.Color(0x2ee6ff);
  const soft = new THREE.Color(0x7af0ff);
  const mist = new THREE.Color(0xa8c8d4);
  const tmp = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    const r = 5 + Math.random() * 16;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.55;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 3;
    const roll = Math.random();
    tmp.copy(roll > 0.7 ? soft : roll > 0.4 ? mist : cyan);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const dustTex = makeDotTexture();
  const points = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      size: 0.12,
      map: dustTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
  );
  scene.add(points);

  // —— Far halo dust (outer rim, denser small sparks) ——
  const FAR = counts.far;
  const farPos = new Float32Array(FAR * 3);
  const farCol = new Float32Array(FAR * 3);
  const farDim = new THREE.Color(0x5a90a8);
  for (let i = 0; i < FAR; i++) {
    // Bias outward — shell around the scene
    const r = 14 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    // Flatten vertically so corners/sides fill the viewport edges
    const ySpread = 0.35 + Math.random() * 0.45;
    const phi = Math.acos((Math.random() * 2 - 1) * ySpread);
    farPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    farPos[i * 3 + 1] = r * Math.cos(phi) * 0.72;
    farPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 6 - Math.random() * 8;
    const roll = Math.random();
    tmp.copy(roll > 0.75 ? soft : roll > 0.45 ? mist : roll > 0.2 ? cyan : farDim);
    // Slightly dimmer for distance
    const dim = 0.55 + Math.random() * 0.45;
    farCol[i * 3] = tmp.r * dim;
    farCol[i * 3 + 1] = tmp.g * dim;
    farCol[i * 3 + 2] = tmp.b * dim;
  }
  const farGeo = new THREE.BufferGeometry();
  farGeo.setAttribute("position", new THREE.BufferAttribute(farPos, 3));
  farGeo.setAttribute("color", new THREE.BufferAttribute(farCol, 3));
  const farPoints = new THREE.Points(
    farGeo,
    new THREE.PointsMaterial({
      size: 0.07,
      map: dustTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
  );
  scene.add(farPoints);

  // Pointer / parallax only
  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    pointer.x = ((e.clientX - rect.left) / w) * 2 - 1;
    pointer.y = -(((e.clientY - rect.top) / h) * 2 - 1);
  }

  window.addEventListener("pointermove", onMove, { passive: true });

  let scrollNorm = 0;
  const readScroll = () => {
    const max =
      document.documentElement.scrollHeight - window.innerHeight;
    scrollNorm =
      max > 0 ? Math.min((window.scrollY || 0) / Math.max(max * 0.45, 1), 1) : 0;
  };
  window.addEventListener("scroll", readScroll, { passive: true });
  readScroll();

  function resize() {
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }
  resize();

  const clock = new THREE.Clock();
  const camTarget = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  let running = true;
  let raf = 0;
  let visible = true;
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
  });

  function tick() {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    if (!visible) return;

    const t = clock.getElapsedTime();
    const k = fine ? 0.045 : 0.02;
    smooth.x += (pointer.x - smooth.x) * k;
    smooth.y += (pointer.y - smooth.y) * k;

    // Core — slow spin + parallax (no spring rebound)
    if (!reduced) {
      coreGroup.rotation.y = t * 0.09 + scrollNorm * 0.35 + smooth.x * 0.35;
      coreGroup.rotation.x =
        Math.sin(t * 0.14) * 0.06 - smooth.y * 0.22 + scrollNorm * 0.12;
      coreGroup.position.x = 2.2 + smooth.x * 0.4;
      coreGroup.position.y = 0.35 - scrollNorm * 1.0 - smooth.y * 0.3;
      wire.rotation.y = -t * 0.14;
      ringA.rotation.z = t * 0.12;
      ringB.rotation.z = -t * 0.09;
    }

    for (let i = 0; i < floaters.length; i++) {
      const m = floaters[i];
      const d = m.userData;
      if (!reduced) {
        m.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * d.amp;
        m.rotation.x += d.spin * 0.004;
        m.rotation.y += d.spin * 0.006;
      }
      m.position.x += smooth.x * 0.0015 * d.depth;
      m.position.z += -smooth.y * 0.0012 * d.depth;
    }

    floatGroup.rotation.y = -smooth.x * 0.06 - t * 0.012;
    points.rotation.y = -t * 0.035 - scrollNorm * 0.2 - smooth.x * 0.04;
    points.rotation.x = smooth.y * 0.05;
    // Far shell rotates a bit slower for depth
    farPoints.rotation.y = -t * 0.018 - scrollNorm * 0.12 - smooth.x * 0.03;
    farPoints.rotation.x = smooth.y * 0.035;

    camTarget.set(
      smooth.x * 1.4,
      0.15 - smooth.y * 0.8 - scrollNorm * 0.6,
      14 - scrollNorm * 2
    );
    camera.position.lerp(camTarget, 0.055);
    lookAt.set(smooth.x * 0.5, scrollNorm * 0.25 + smooth.y * 0.2, 0);
    camera.lookAt(lookAt);

    key.position.x = -7 + smooth.x * 1.8;
    key.position.y = 5.5 - smooth.y * 1.2;

    renderer.render(scene, camera);
  }

  tick();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("pointermove", onMove);
      core.geometry.dispose();
      coreMat.dispose();
      wire.geometry.dispose();
      wire.material.dispose();
      ringA.geometry.dispose();
      ringMat.dispose();
      ringB.geometry.dispose();
      ringB.material.dispose();
      geos.forEach((g) => g.dispose());
      floatMats.forEach((m) => m.dispose());
      pGeo.dispose();
      farGeo.dispose();
      points.material.dispose();
      farPoints.material.dispose();
      dustTex.dispose();
      renderer.dispose();
    },
  };
}
