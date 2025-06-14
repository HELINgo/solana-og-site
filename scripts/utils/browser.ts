// scripts/utils/browser.ts
import puppeteer from 'puppeteer';

export async function createBrowser() {
  return await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}
