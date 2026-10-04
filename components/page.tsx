'use client'
import { useState, useEffect } from 'react'
import PriceChart from '@/components/PriceChart'

export default function Home(){
  const [url,setUrl]=useState('https://www.amazon.com/dp/B0CHX1W1XY')
  const [selector,setSelector]=useState('span.a-price-whole')
  const [loading,setLoading]=useState(false)
  const [result,setResult]=useState<any>(null)
  const [history,setHistory]=useState<any[]>([])

  const create = async ()=>{
    setLoading(true)
    const res = await fetch('/api/create',{method:'POST', body: JSON.stringify({url, selectors: {price: selector, title: 'h1'}})})
    const data = await res.json()
    setResult(data)
    setLoading(false)
    loadHistory(data.id)
  }

  const loadHistory = async (id:string)=>{
    const res = await fetch(`/api/v2/${id}?history=1`)
    const j = await res.json()
    setHistory(j.chart_data || j.history?.map((h:any)=>({time: new Date(h.t).toISOString(),...h.data})) || [])
  }

  // 每30秒自动刷新图表
  useEffect(()=>{
    if(!result?.id) return
    const i = setInterval(()=>loadHistory(result.id), 30000)
    return ()=>clearInterval(i)
  },[result])

  return (
    <div className="max-w-3xl mx-auto p-6 mt-6">
      <h1 className="text-4xl font-bold">URL to API + Price History</h1>
      <p className="text-gray-500 mt-2">DuckDB cleaned, auto-updates every 30min. V2 by DuckDB Lab.</p>

      <div className="flex gap-2 mt-8">
        <input value={url} onChange={e=>setUrl(e.target.value)} className="flex-1 border p-3 rounded-lg" placeholder="URL" />
        <input value={selector} onChange={e=>setSelector(e.target.value)} className="w-[220px] border p-3 rounded-lg" placeholder="price selector" />
      </div>
      <button onClick={create} className="w-full bg-black text-white p-3 mt-3 rounded-lg font-bold">
        {loading? 'Scraping & Cleaning with DuckDB...' : 'Generate API'}
      </button>

      {result && (
        <>
          <div className="mt-6 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm">
            <div>GET {window.location.origin}/api/v2/{result.id}</div>
            <div className="text-gray-400 mt-2">Cleaned JSON:</div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(result.cleaned, null, 2)}</pre>
          </div>

          <PriceChart data={history} />

          <div className="mt-4 flex gap-2">
            <a href={`/api/v2/${result.id}`} target="_blank" className="text-sm border px-3 py-1 rounded">Open API</a>
            <a href={`/api/v2/${result.id}?history=1`} target="_blank" className="text-sm border px-3 py-1 rounded">Open History JSON</a>
          </div>

          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            DuckDB SQL: <code>SELECT AVG(price) FROM (SELECT * FROM read_json('.../api/v2/{result.id}?history=1'))</code>
          </div>
        </>
      )}
    </div>
  )
}