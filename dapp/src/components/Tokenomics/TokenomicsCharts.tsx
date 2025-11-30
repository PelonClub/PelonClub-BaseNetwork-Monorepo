'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TOKENOMICS_DATA, CHART_COLORS } from '@/data/tokenomics';

const RADIAN = Math.PI / 180;

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: CustomLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background-secondary border-neobrutal shadow-neobrutal p-3 rounded-none">
        <p className="text-foreground font-bold text-sm mb-1">{data.name}</p>
        <p className="text-primary text-sm font-medium">
          {data.percentage}% ({data.tokens}B PELON)
        </p>
      </div>
    );
  }
  return null;
};

const getPieData = () => {
  return TOKENOMICS_DATA.map((category) => ({
    name: category.name,
    value: category.percentage,
    percentage: category.percentage,
    tokens: category.tokens,
  }));
};

const getBarData = () => {
  return TOKENOMICS_DATA.flatMap((category) =>
    category.subcategories.map((sub) => ({
      category: category.name,
      name: sub.name,
      percentage: sub.percentage,
      tokens: sub.tokens,
    }))
  );
};

export function TokenomicsPieChart() {
  const t = useTranslations('tokenomics');
  const pieData = getPieData();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={cn(
        'bg-background-secondary',
        'border-neobrutal',
        'shadow-neobrutal-md',
        'p-6',
        'rounded-none',
        'h-full'
      )}
    >
      <h3
        className={cn(
          'text-2xl sm:text-3xl',
          'font-bold',
          'text-foreground',
          'mb-6',
          'flex items-center gap-3'
        )}
      >
        <span>📊</span>
        <span>{t('charts.distribution')}</span>
      </h3>
      <div className="w-full h-[400px] lg:h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={isMobile ? 120 : 180}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-foreground text-sm font-medium">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TokenomicsBarChart() {
  const t = useTranslations('tokenomics');
  const barData = getBarData();

  return (
    <div
      className={cn(
        'bg-background-secondary',
        'border-neobrutal',
        'shadow-neobrutal-md',
        'p-6',
        'rounded-none'
      )}
    >
      <h3
        className={cn(
          'text-2xl sm:text-3xl',
          'font-bold',
          'text-foreground',
          'mb-6',
          'flex items-center gap-3'
        )}
      >
        <span>📈</span>
        <span>{t('charts.subcategories')}</span>
      </h3>
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: '600px', height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
                label={{ value: t('charts.percentage'), angle: -90, position: 'insideLeft', fill: '#cbd5e1' }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(67, 56, 202, 0.1)' }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-foreground text-sm font-medium">{value}</span>
                )}
              />
              <Bar
                dataKey="percentage"
                fill="#4338ca"
                radius={[0, 0, 0, 0]}
                animationBegin={200}
                animationDuration={800}
              >
                {barData.map((entry, index) => {
                  const categoryIndex = TOKENOMICS_DATA.findIndex(c => c.name === entry.category);
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[categoryIndex % CHART_COLORS.length]}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function TokenomicsCharts() {
  return (
    <div className="space-y-8 mb-8">
      <TokenomicsPieChart />
      <TokenomicsBarChart />
    </div>
  );
}

