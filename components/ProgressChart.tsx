
import React, { useMemo, useState, useRef } from 'react';

interface ChartDataPoint {
    date: Date;
    weight: number;
}

interface ProgressChartProps {
    data: ChartDataPoint[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; weight: number } | null>(null);

    const { points, path, yAxisLabels, xAxisLabels, gridLines } = useMemo(() => {
        if (data.length < 2) return { points: [], path: '', yAxisLabels: [], xAxisLabels: [], gridLines: [] };

        const PADDING = { top: 20, right: 20, bottom: 40, left: 45 };
        const WIDTH = 600;
        const HEIGHT = 400;

        const minWeight = Math.min(...data.map(d => d.weight));
        const maxWeight = Math.max(...data.map(d => d.weight));
        const minDate = data[0].date.getTime();
        const maxDate = data[data.length - 1].date.getTime();
        
        const yRange = maxWeight - minWeight;
        const yMin = Math.max(0, minWeight - yRange * 0.1);
        const yMax = maxWeight + yRange * 0.1;
        
        const dateRange = maxDate - minDate;
        
        const xScale = (date: number) => PADDING.left + ((date - minDate) / dateRange) * (WIDTH - PADDING.left - PADDING.right);
        const yScale = (weight: number) => HEIGHT - PADDING.bottom - ((weight - yMin) / (yMax - yMin)) * (HEIGHT - PADDING.top - PADDING.bottom);

        const points = data.map(d => ({
            x: xScale(d.date.getTime()),
            y: yScale(d.weight),
            date: d.date,
            weight: d.weight,
        }));

        const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
        
        const numYLabels = 5;
        const yAxisLabels = Array.from({ length: numYLabels }).map((_, i) => {
            const weight = yMin + (i * (yMax - yMin)) / (numYLabels - 1);
            return {
                y: yScale(weight),
                label: `${Math.round(weight)}`,
            };
        });

        const numXLabels = Math.min(data.length, 5);
        const xAxisLabels = Array.from({ length: numXLabels }).map((_, i) => {
            const index = Math.floor(i * (data.length - 1) / (numXLabels - 1));
            const date = data[index].date;
            return {
                x: xScale(date.getTime()),
                label: date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', calendar: 'gregory' }),
            };
        });
        
        const gridLines = yAxisLabels.map(label => `M ${PADDING.left} ${label.y} H ${WIDTH - PADDING.right}`);

        return { points, path, yAxisLabels, xAxisLabels, gridLines };

    }, [data]);

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || points.length === 0) return;
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = event.clientX;
        svgPoint.y = event.clientY;
        
        const { x } = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        
        let closestPoint = points[0];
        let minDistance = Math.abs(closestPoint.x - x);

        for (let i = 1; i < points.length; i++) {
            const distance = Math.abs(points[i].x - x);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = points[i];
            }
        }

        setTooltip({
            x: closestPoint.x,
            y: closestPoint.y,
            date: closestPoint.date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' }),
            weight: closestPoint.weight,
        });
    };
    
    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <div className="w-full h-full relative">
            <svg
                ref={svgRef}
                viewBox={`0 0 600 400`}
                className="w-full h-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <style>
                  {`.axis-text { font-size: 14px; fill: #9ca3af; }`}
                </style>
                {/* Grid Lines */}
                {gridLines.map((d, i) => (
                    <path key={i} d={d} stroke="#4b5563" strokeWidth="1" strokeDasharray="3,3" />
                ))}

                {/* Y Axis Labels */}
                {yAxisLabels.map(({ y, label }) => (
                    <text key={y} x={35} y={y + 5} textAnchor="end" className="axis-text">{label} كجم</text>
                ))}
                
                {/* X Axis Labels */}
                {xAxisLabels.map(({ x, label }) => (
                    <text key={x} x={x} y={380} textAnchor="middle" className="axis-text">{label}</text>
                ))}

                {/* Main line */}
                <path d={path} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Data points */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="5" fill="#38bdf8" stroke="#1f2937" strokeWidth="2" />
                ))}

                {/* Tooltip */}
                {tooltip && (
                    <g transform={`translate(${tooltip.x}, ${tooltip.y})`}>
                        <circle r="8" fill="#38bdf8" stroke="#111827" strokeWidth="2" opacity="0.5" />
                        <line y2={360 - tooltip.y} stroke="#60a5fa" strokeWidth="1" strokeDasharray="4,4" />
                        <g transform={`translate(0, -15)`}>
                             <rect x={-50} y={-35} width={100} height={30} rx="5" fill="#1f2937" stroke="#38bdf8" strokeWidth="1.5"/>
                             <text x="0" y="-18" textAnchor="middle" fill="#e5e7eb" fontSize="14" fontWeight="bold">
                                 {tooltip.weight} كجم
                             </text>
                        </g>
                    </g>
                )}
            </svg>
             {tooltip && (
                <div 
                    className="absolute bg-gray-900/80 text-white text-xs rounded-md p-2 pointer-events-none transition-opacity duration-200" 
                    style={{ 
                        left: `${(tooltip.x / 600) * 100}%`, 
                        bottom: `5px`, 
                        transform: 'translateX(-50%)',
                        opacity: 1,
                        backdropFilter: 'blur(2px)',
                    }}>
                    {tooltip.date}
                </div>
            )}
        </div>
    );
};
