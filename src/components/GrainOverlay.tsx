import React, { useEffect, useRef } from 'react';
import '../styles/GrainOverlay.scss';

const GrainOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Handle resize
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation parameters
    let animationFrameId: number;
    let frameCount = 0;
    
    // Draw grain effect
    const drawGrain = () => {
      if (!ctx || !canvas) return;
      
      // Only update every 30 frames (approx. 0.5 fps at 60fps)
      if (frameCount % 30 === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create grain
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Randomize pixel
          const intensity = Math.floor(Math.random() * 30); // lower number = more subtle
          data[i] = intensity;     // R
          data[i + 1] = intensity; // G
          data[i + 2] = intensity; // B
          data[i + 3] = Math.random() * 20; // A - very transparent
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      frameCount++;
      animationFrameId = requestAnimationFrame(drawGrain);
    };
    
    drawGrain();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="grain-overlay"></canvas>;
};

export default GrainOverlay;