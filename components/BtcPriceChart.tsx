// app/components/BtcPriceChart.tsx
import { BtcPrice } from '@/lib/types';
import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type BtcPriceChartProps = { data: { history: BtcPrice[], exchange: string } };

/**
 * BtcPriceChart component renders a line chart for Bitcoin prices.
 * @param {BtcPriceChart} props - The properties for the component.
 * @returns {React.JSX.Element} - A responsive line chart displaying Bitcoin prices over time.
 */
export default function BtcPriceChart(props: BtcPriceChartProps): React.JSX.Element {
  return (
    <>
      <h2 className="text-center font-semibold mb-2">BTC/USD ({props.data.exchange.capitalize()})</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={props.data.history}>
          <XAxis
            dataKey="time"
            tickFormatter={time => new Date(time).toLocaleTimeString('en-US', {hour12: false, timeStyle: 'short'})}
            tick={{ fill: 'white', fontSize: 12 }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={value => `$${value.toLocaleString()}`}
            tick={{ fill: 'white', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: any) => `$${value.toFixed(2)}`}
            labelFormatter={(label: any) => new Date(label).toLocaleString()}
            contentStyle={{
              backgroundColor : '#1f1f1f',
              border          : '1px solid #ccc',
              color           : '#fff',
            }}
          />
          <Line type="monotone" dataKey="price" stroke="#ffffff" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
