import React, { useEffect, useRef } from 'react';

const InteractiveGrid = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

    useEffect(() => {
        if (isTouchDevice) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const gridSize = 50;
        const points = [];

        const initPoints = () => {
            points.length = 0;
            for (let x = 0; x <= width + gridSize; x += gridSize) {
                for (let y = 0; y <= height + gridSize; y += gridSize) {
                    points.push({
                        x, y,
                        originalX: x,
                        originalY: y,
                        vx: 0,
                        vy: 0
                    });
                }
            }
        };

        initPoints();

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initPoints();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;

            const mouse = mouseRef.current;
            const radius = 180;
            const strength = 0.4;

            points.forEach(p => {
                const dx = mouse.x - p.originalX;
                const dy = mouse.y - p.originalY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let targetX = p.originalX;
                let targetY = p.originalY;

                if (dist < radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (radius - dist) / radius;
                    targetX = p.originalX - Math.cos(angle) * force * radius * strength;
                    targetY = p.originalY - Math.sin(angle) * force * radius * strength;
                }

                // Smooth interpolation for both entering and leaving the "influence zone"
                p.x += (targetX - p.x) * 0.08;
                p.y += (targetY - p.y) * 0.08;
            });

            // Draw horizontal lines
            for (let y = 0; y <= height + gridSize; y += gridSize) {
                ctx.beginPath();
                let first = true;
                for (let x = 0; x <= width + gridSize; x += gridSize) {
                    const p = points.find(p => p.originalX === x && p.originalY === y);
                    if (!p) continue;
                    if (first) {
                        ctx.moveTo(p.x, p.y);
                        first = false;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                }
                ctx.stroke();
            }

            // Draw vertical lines
            for (let x = 0; x <= width + gridSize; x += gridSize) {
                ctx.beginPath();
                let first = true;
                for (let y = 0; y <= height + gridSize; y += gridSize) {
                    const p = points.find(p => p.originalX === x && p.originalY === y);
                    if (!p) continue;
                    if (first) {
                        ctx.moveTo(p.x, p.y);
                        first = false;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                }
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    if (isTouchDevice) {
        return <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-grid" />;
    }

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};

export default InteractiveGrid;
