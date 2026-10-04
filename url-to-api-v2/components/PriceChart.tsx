'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function PriceChart({ data }: {data: any[]}){
  // data = [{time: '2026-10-04...', price: 19.9, title: '...'}]
  if(!data || data.length < 2){
    return <div className="text-xs text-gray-400 p-4 border rounded">Waiting for 2 data points... Next update in 30 min</div>
  }

  const chartData = data.map(d=>({
    time: new Date(d.time).toLocaleTimeString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}),
    price: Number(d.price) || 0
  })).filter(d=>d.price>0)

  const min = Math.min(...chartData.map(d=>d.price))
  const max = Math.max(...chartData.map(d=>d.price))

  return (
    <div className="w-full h-[280px] mt-4 p-4 border rounded-xl bg-white">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-bold">Price History ({chartData.length} points)</span>
        <span className="text-xs text-gray-500">Min ${min} / Max ${max}</span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" fontSize={10} tick={{fill:'#999'}} />
          <YAxis domain={['auto','auto']} fontSize={10} tick={{fill:'#999'}} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#000" strokeWidth={2} dot={{r:3}} activeDot={{r:5}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}