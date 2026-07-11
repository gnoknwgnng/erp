import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
}

export const LineChart: React.FC<ChartProps> = ({
  data,
  height = 200,
  color = 'var(--primary-color)'
}) => {
  if (data.length === 0) return null;

  const width = 500;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1) * 1.1; // Add 10% ceiling
  const minValue = 0;

  const points = data.map((d, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minValue) / (maxValue - minValue)) * chartHeight;
    return { x, y, ...d };
  });

  // Create path command
  let dPath = '';
  points.forEach((p, idx) => {
    if (idx === 0) {
      dPath += `M ${p.x} ${p.y}`;
    } else {
      // Draw standard line or bezier curves
      const prev = points[idx - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (2 * (p.x - prev.x)) / 3;
      const cpY2 = p.y;
      dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }
  });

  // Fill path beneath line
  const dFillPath = `${dPath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Draw gridlines (Y-axis segments)
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        
        {/* Y Axis Gridlines & Labels */}
        {gridLines.map((gl, idx) => {
          const y = paddingTop + chartHeight - gl * chartHeight;
          const val = Math.round(minValue + gl * (maxValue - minValue));
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="var(--border-color)" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 4} 
                fill="var(--text-tertiary)" 
                fontSize="10" 
                textAnchor="end"
                fontFamily="inherit"
              >
                {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, idx) => {
          if (data.length > 8 && idx % 2 !== 0) return null; // Space out labels
          const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
          return (
            <text
              key={idx}
              x={x}
              y={height - 8}
              fill="var(--text-tertiary)"
              fontSize="10"
              textAnchor="middle"
              fontFamily="inherit"
            >
              {d.label}
            </text>
          );
        })}

        {/* Filled Path */}
        <path d={dFillPath} fill="url(#chartGradient)" />

        {/* Stroke Line */}
        <path d={dPath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

        {/* Interactive Dots */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--bg-primary)"
              stroke={color}
              strokeWidth="2"
            />
            {/* Tooltip trigger or simple hover text */}
            <title>{`${p.label}: ${p.value}`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const BarChart: React.FC<ChartProps> = ({
  data,
  height = 200,
  color = 'var(--primary-color)'
}) => {
  if (data.length === 0) return null;

  const width = 500;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1) * 1.1;
  const minValue = 0;

  const barWidth = (chartWidth / data.length) * 0.65;
  const barSpacing = (chartWidth / data.length) * 0.35;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Y Axis Gridlines & Labels */}
        {gridLines.map((gl, idx) => {
          const y = paddingTop + chartHeight - gl * chartHeight;
          const val = Math.round(minValue + gl * (maxValue - minValue));
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="var(--border-color)" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 4} 
                fill="var(--text-tertiary)" 
                fontSize="10" 
                textAnchor="end"
                fontFamily="inherit"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels & Columns */}
        {data.map((d, idx) => {
          const x = paddingLeft + idx * (barWidth + barSpacing) + barSpacing / 2;
          const barHeight = ((d.value - minValue) / (maxValue - minValue)) * chartHeight;
          const y = paddingTop + chartHeight - barHeight;

          return (
            <g key={idx}>
              {/* Rounded top rect for clean modern visual */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="3"
                opacity="0.85"
                style={{ transition: 'opacity var(--transition-fast)' }}
                onMouseOver={(e) => ((e.target as any).style.opacity = '1')}
                onMouseOut={(e) => ((e.target as any).style.opacity = '0.85')}
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={height - 8}
                fill="var(--text-tertiary)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="inherit"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
