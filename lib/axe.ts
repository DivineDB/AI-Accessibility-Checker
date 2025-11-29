import { AxePuppeteer } from '@axe-core/puppeteer';
import { Page } from 'puppeteer';

export async function runAxeScan(page: Page) {
  const results = await new AxePuppeteer(page).analyze();
  return results;
}
