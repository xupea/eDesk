import React, { useEffect, useRef } from 'react';
import './index.module.css';

interface Props {
  progress: number;
}

const CircleLoading: React.FC<Props> = (props) => {
  const ref = useRef<SVGCircleElement>(null);
  const { progress } = props;

  useEffect(() => {
    const circle = ref.current;

    if (circle) {
      const percent = progress / 100;
      const perimeter = Math.PI * 2 * 170;
      circle.setAttribute('stroke-dasharray', `${perimeter * percent} 1069`);
    }
  });

  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      <circle
        cx="56"
        cy="56"
        r="50"
        strokeWidth="12"
        stroke="#3D3D3D"
        fill="none"
      />
      <circle
        cx="56"
        cy="56"
        r="50"
        strokeWidth="12"
        stroke="#007FFF"
        fill="none"
        transform="matrix(0,-1,1,0,0,112)"
        strokeDasharray="0 1069"
        strokeLinecap="round"
        ref={ref}
      />
    </svg>
  );
};

export default CircleLoading;
