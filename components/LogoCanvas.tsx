'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function LogoCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup - positioned to fit the 36x36px canvas well
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 2.2
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power' // efficient for navbar logos
    })
    renderer.setSize(40, 40) // Slightly larger to avoid edge clipping
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    // Clear and append
    const container = containerRef.current
    container.innerHTML = ''
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Group for mouse interaction tilt
    const group = new THREE.Group()
    scene.add(group)
    groupRef.current = group

    // Object setup - Octahedron for CodeSense's AI feel
    const geometry = new THREE.OctahedronGeometry(1.2, 0)
    const material = new THREE.MeshStandardMaterial({
      color: 0x00e5a0,
      emissive: 0x00e5a0,
      emissiveIntensity: 0.5,
      wireframe: true,
    })
    const mesh = new THREE.Mesh(geometry, material)
    group.add(mesh)
    meshRef.current = mesh

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00e5a0, 5)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    // Mouse move logic - Track global cursor position
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse to -1 to 1 for responsiveness
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      if (mesh && group && material) {
        // 1. Continuous slow rotation on the mesh itself
        mesh.rotation.y += 0.008
        mesh.rotation.z += 0.005

        // 2. Tilt the whole group toward the cursor smoothly
        const targetTiltX = mouseRef.current.y * 0.6
        const targetTiltY = mouseRef.current.x * 0.6
        
        group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetTiltX, 0.05)
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetTiltY, 0.05)

        // 3. Subtle glow pulse effect
        const time = Date.now() * 0.002
        material.emissiveIntensity = 0.5 + Math.sin(time) * 0.2
      }

      renderer.render(scene, camera)
      frameIdRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current)
      
      if (rendererRef.current && containerRef.current) {
        if (containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement)
        }
        rendererRef.current.dispose()
      }
      
      geometry.dispose()
      material.dispose()
      scene.clear()
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="w-[36px] h-[36px] flex items-center justify-center overflow-visible cursor-pointer"
      style={{ filter: 'drop-shadow(0 0 4px rgba(0, 229, 160, 0.3))' }}
    />
  )
}
