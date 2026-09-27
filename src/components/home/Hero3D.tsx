'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import * as THREE from 'three';

export const Hero3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Warm atmospheric lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.8);
    scene.add(ambientLight);

    const goldPointLight = new THREE.PointLight(0xc5a059, 3, 20);
    goldPointLight.position.set(4, 3, 3);
    scene.add(goldPointLight);

    const warmFillLight = new THREE.PointLight(0xe8dac6, 2, 20);
    warmFillLight.position.set(-4, -2, 2);
    scene.add(warmFillLight);

    // Group for all floating objects
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // 1. Faceted Crystalline Resin Gem (Icosahedron)
    const gemGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0xc5a059,
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.85,
      ior: 1.5,
      reflectivity: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.position.set(2.8, 0.4, 0);
    objectsGroup.add(gemMesh);

    // 2. Sculptural Artisan Ring (Torus)
    const torusGeo = new THREE.TorusGeometry(1.0, 0.2, 16, 60);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x8c583e,
      roughness: 0.4,
      metalness: 0.3,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(-2.9, -0.6, -1);
    torusMesh.rotation.x = Math.PI / 4;
    objectsGroup.add(torusMesh);

    // 3. Subtle floating particles
    const particlesCount = 35;
    const particlePositions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particlesMat = new THREE.PointsMaterial({
      color: 0xc5a059,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotX = y * 0.3;
      targetRotY = x * 0.3;
      setMousePos({ x: x * 15, y: y * 15 });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating rotational movement
      gemMesh.rotation.x = elapsedTime * 0.25;
      gemMesh.rotation.y = elapsedTime * 0.35;
      gemMesh.position.y = 0.4 + Math.sin(elapsedTime * 1.2) * 0.15;

      torusMesh.rotation.y = elapsedTime * 0.2;
      torusMesh.rotation.z = elapsedTime * 0.15;
      torusMesh.position.y = -0.6 + Math.cos(elapsedTime * 1.0) * 0.15;

      particleSystem.rotation.y = elapsedTime * 0.03;

      // Mouse follow dampening
      objectsGroup.rotation.x += (targetRotX - objectsGroup.rotation.x) * 0.05;
      objectsGroup.rotation.y += (targetRotY - objectsGroup.rotation.y) * 0.05;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      gemGeo.dispose();
      gemMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-craft-100/60 via-craft-50 to-craft-50 pt-6 pb-16"
    >
      {/* 3D Three.js Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      />

      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-craft-200/50 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Col (7 cols) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sand/80 border border-craft-300 text-craft-800 shadow-xs backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                Authentic Artisan Handcrafts
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-craft-950 tracking-tight leading-[1.12]">
              Handmade. <br />
              <span className="italic font-normal text-craft-700">
                Beautifully
              </span>{' '}
              Yours.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover thoughtfully crafted pieces made to bring creativity,
              warmth, and character into your world. Designed with love, sculpted
              with organic materials, and created to matter.
            </p>

            {/* Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-craft-900 hover:bg-craft-800 text-cream text-xs uppercase tracking-[0.18em] font-semibold shadow-card hover:shadow-floating transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/collections"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cream/90 hover:bg-white text-craft-900 border border-craft-300 text-xs uppercase tracking-[0.18em] font-semibold shadow-xs hover:shadow-card transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-craft-600" />
                <span>EXPLORE CRAFTS</span>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="pt-8 border-t border-craft-200/80 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="font-serif text-2xl font-bold text-craft-900">5,000+</p>
                <p className="text-[11px] text-stone-500 uppercase tracking-wider font-medium">
                  Pieces Created
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-craft-900">4.9 / 5</p>
                <p className="text-[11px] text-stone-500 uppercase tracking-wider font-medium">
                  Artisan Rating
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-craft-900">100%</p>
                <p className="text-[11px] text-stone-500 uppercase tracking-wider font-medium">
                  Handmade Quality
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual Image & Interactive Card (5 cols) */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div
              className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-floating border border-craft-200 bg-sand/40 transition-transform duration-300"
              style={{
                transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
                alt="Crafty Glora Artisan Handmade Botanical Display"
                fill
                priority
                className="object-cover scale-105 transition-transform duration-1000"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-craft-950/80 via-transparent to-transparent" />

              {/* Floating Featured Card */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel border border-white/40 shadow-card backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-dark">
                      Featured Piece
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-craft-950">
                      Handmade Resin Wildflower Block
                    </h4>
                    <p className="text-xs text-stone-600">Preserved in optical UV epoxy</p>
                  </div>
                  <Link
                    href="/product/handmade-resin-flower"
                    className="p-2.5 rounded-xl bg-craft-900 text-white hover:bg-gold-dark transition-colors shadow-xs"
                    title="View piece"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
