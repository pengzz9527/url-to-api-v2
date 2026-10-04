import { list } from '@vercel/blob'
export const dynamic='force-dynamic'
export async function GET(req:Request,{params}:{params:{id:string}}){
  const withHistory=new URL(req.url).searchParams.get('history')==='1'
  const {blobs}=await list({prefix:`api/v2/${params.id}.json`})
  if(!blobs.length) return Response.json({error:'Not found'},{status:404})
  const doc=await fetch(blobs[0].url).then(r=>r.json())
  if(withHistory) return Response.json({current:doc.current,history:doc.history,chart_data:doc.history.map((h:any)=>({time:new Date(h.t).toISOString(),...h.data}))})
  return Response.json(doc.current)
}