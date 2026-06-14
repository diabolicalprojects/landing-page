import React, { useEffect, useRef } from 'react';
   import { gsap } from 'gsap';

   const CustomCursor = () => {
       const dotRef = useRef(null);
       const outlineRef = useRef(null);
       // Only activate on devices with a fine pointer (mouse), not touch
       const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

       useEffect(() => {
           if (isTouchDevice) return;

           const moveCursor = (e) => {
               const { clientX, clientY } = e;
               gsap.to(dotRef.current, { x: clientX, y: clientY, duration: 0.1 });
               gsap.to(outlineRef.current, { x: clientX, y: clientY, duration: 0.3 });
           };

           const handleMouseEnter = () => {
               gsap.to(outlineRef.current, { scale: 1.8, borderColor: 'rgba(255,255,255,1)', borderWidth: '2px', duration: 0.3 });
           };

           const handleMouseLeave = () => {
               gsap.to(outlineRef.current, { scale: 1, borderColor: 'rgba(255,255,255,0.5)', borderWidth: '1px', duration: 0.3 });
           };

           window.addEventListener('mousemove', moveCursor);

           const interactiveElements = document.querySelectorAll('button, a, .magnetic-btn');
           interactiveElements.forEach(el => {
               el.addEventListener('mouseenter', handleMouseEnter);
               el.addEventListener('mouseleave', handleMouseLeave);
           });

           return () => {
               window.removeEventListener('mousemove', moveCursor);
               interactiveElements.forEach(el => {
                   el.removeEventListener('mouseenter', handleMouseEnter);
                   el.removeEventListener('mouseleave', handleMouseLeave);
               });
           };
       }, [isTouchDevice]);

       if (isTouchDevice) return null;

       return (
           <>
               <div ref={dotRef} className="cursor-dot !w-2 !h-2" />
               <div ref={outlineRef} className="cursor-outline !w-10 !h-10" />
           </>
       );
   };

   export default CustomCursor;
   
