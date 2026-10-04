import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { put } from '@vercel/blob'
import { cleanWithDuckDB } from '@/lib/duckdb'
export const dynamic='force-dynamic'
export async function POST(req:Request){
  const {url,selectors}=await req.json()
  const id=Math.random().toString(36).slice(2,8)
  const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true})
  const page=await browser.newPage()
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:15000})
  await new Promise(r=>setTimeout(r,1500))
  const raw:any={}
  for(const k in selectors){try{raw[k]=await page.$eval(selectors[k],(el:any)=>el.innerText)}catch{raw[k]=''} }
  await browser.close()
  const {cleaned}=await cleanWithDuckDB(raw)
  await put(`api/v2/${id}.json`,JSON.stringify({id,url,selectors,current:cleaned,raw,history:[{t:Date.now(),data:cleaned}],updated_at:new Date().toISOString()}),{access:'public'})
  return Response.json({id,raw,cleaned})
}