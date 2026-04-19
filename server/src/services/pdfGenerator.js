import puppeteer from 'puppeteer'
import path from 'path'

export async function generatePDF(html, outputPath) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  
  await page.setContent(html)
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true
  })
  
  await browser.close()
  return outputPath
}