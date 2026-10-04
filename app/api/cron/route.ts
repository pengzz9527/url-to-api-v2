import { list, put } from '@vercel/blob'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { cleanWithDuckDB } from '@/lib/duckdb'
export const dynamic='force-dynamic';export const maxDuration=60
export async function GET(){
  const {blobs}=await list({prefix:'api/v2/'})
  const toRefresh=blobs.sort((a,b)=>new Date(a.uploadedAt).getTime()-new Date(b.uploadedAt).getTime()).slice(0,5)
  const results=[]
  for(const blob of toRefresh){
    try{
      const oldDoc=await fetch(blob.url).then(r=>r.json())
      const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true})
      const page=await browser.newPage()
      await page.goto(oldDoc.url,{waitUntil:'domcontentloaded',timeout:15000})
      await new Promise(r=>setTimeout(r,1500))
      const raw:any={}
      for(const k in oldDoc.selectors){try{raw[k]=await page.$eval(oldDoc.selectors[k],(el:any)=>el.innerText)}catch{raw[k]=''} }
      await browser.close()
      const {cleaned}=await cleanWithDuckDB(raw)
      const history=[...(oldDoc.history||[]),{t:Date.now(),data:cleaned}].slice(-100)
      await put(blob.pathname,JSON.stringify({...oldDoc,current:cleaned,raw,history,updated_at:new Date().toISOString()}),{access:'public',allowOverwrite:true})
      results.push({id:oldDoc.id,ok:true})
    }catch(e:any){results.push({id:blob.pathname,ok:false})}
  }
  return Response.json({refreshed:results.length,results})
}