import { useRef, useEffect } from 'react'

const useCanvas = draw => {
  const canvasRef = useRef(null);

  function resizeCanvasToDisplaySize(canvas) {
    const { width, height } = canvas.getBoundingClientRect();

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }

    return false;
  }
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;
    
    const render = () => {
      frameCount++;
      resizeCanvasToDisplaySize(canvas);
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    }
    render();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [draw]);
  
  return canvasRef;
}

export default useCanvas;