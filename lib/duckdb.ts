export async function cleanWithDuckDB(raw: any){
  const cleaned:any={}
  for(const k in raw){
    const v=(raw[k]||'').trim()
    const m=v.match(/([0-9]+\.?[0-9]*)/)
    cleaned[k]=v.includes('$')&&m?parseFloat(m[1]):v.slice(0,500)
  }
  return {cleaned}
}