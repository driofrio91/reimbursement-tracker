import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";

const baseUrl = "http://localhost:3000";
const screenshotDir = path.resolve("artifacts", "screenshots", "p0-auth");
const password = process.env.LOCAL_ADMIN_PASSWORD;
const operatorPassword = process.env.LOCAL_OPERATOR_PASSWORD;

if (!password || !operatorPassword) {
  throw new Error("Missing LOCAL_ADMIN_PASSWORD or LOCAL_OPERATOR_PASSWORD in environment.");
}

await fs.mkdir(screenshotDir, { recursive: true });

async function login(page, email, userPassword) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', userPassword);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  if (page.url().includes("/login")) {
    const errorText = await page.locator("text=Credenciales invalidas").count();
    if (errorText > 0) {
      throw new Error(`Login failed for ${email}: invalid credentials.`);
    }
  }

  await page.waitForURL(`${baseUrl}/`, { timeout: 20000 });
}

const desktopBrowser = await chromium.launch({ headless: true });
const desktopContext = await desktopBrowser.newContext({ viewport: { width: 1440, height: 900 } });
const desktopPage = await desktopContext.newPage();

await desktopPage.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
await desktopPage.screenshot({ path: path.join(screenshotDir, "01-login-desktop.png"), fullPage: true });

await login(desktopPage, "admin@local.test", password);
await desktopPage.screenshot({ path: path.join(screenshotDir, "02-home-admin-desktop.png"), fullPage: true });

await desktopPage.goto(`${baseUrl}/services/new`, { waitUntil: "networkidle" });
await desktopPage.screenshot({ path: path.join(screenshotDir, "03-services-new-admin-desktop.png"), fullPage: true });

await desktopContext.clearCookies();
await desktopPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await desktopPage.waitForURL(`${baseUrl}/login`, { timeout: 15000 });
await desktopPage.screenshot({ path: path.join(screenshotDir, "04-logout-login-desktop.png"), fullPage: true });

await login(desktopPage, "operator@local.test", operatorPassword);
await desktopPage.screenshot({ path: path.join(screenshotDir, "05-home-operator-desktop.png"), fullPage: true });

await desktopContext.close();
await desktopBrowser.close();

const mobileBrowser = await chromium.launch({ headless: true });
const mobileContext = await mobileBrowser.newContext({ ...devices["iPhone 13"] });
const mobilePage = await mobileContext.newPage();

await login(mobilePage, "admin@local.test", password);
await mobilePage.goto(`${baseUrl}/services/new`, { waitUntil: "networkidle" });
await mobilePage.screenshot({ path: path.join(screenshotDir, "06-services-new-admin-mobile.png"), fullPage: true });

await mobileContext.close();
await mobileBrowser.close();

console.log(`Screenshots saved to ${screenshotDir}`);
