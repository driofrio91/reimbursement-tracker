import { chromium } from "playwright";

const baseUrl = "http://localhost:3000";

async function ensureServiceExists(page) {
  await page.goto(`${baseUrl}/services`, { waitUntil: "networkidle" });

  const emptyState = page.getByText("Todavia no hay servicios");
  if (await emptyState.isVisible().catch(() => false)) {
    await page.getByRole("link", { name: "Crear servicio" }).click();
    await page.waitForURL("**/services/new");

    const today = new Date();
    const yyyy = String(today.getFullYear());
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    await page.locator('input[name="serviceDate"]').fill(`${yyyy}-${mm}-${dd}`);
    await page.locator('input[name="actualAmount"]').fill("200");
    await page.locator('input[name="invoiceBilledAmount"]').fill("55");
    await page.locator('input[name="invoiceExpectedAmount"]').fill("49.5");
    await page.locator('input[name="description"]').fill("Pulido visual factura");
    await page.locator('select[name="personId"]').selectOption({ index: 1 });
    await page.locator('select[name="insurerId"]').selectOption({ index: 1 });
    await page.locator('input[name="policyHolderName"]').fill("Titular demo");
    await page.getByRole("button", { name: "Crear servicio" }).click();
    await page.waitForURL("**/services/**", { timeout: 20000 });
    return;
  }

  await page.locator('tbody tr a[href^="/services/"]').first().click();
  await page.waitForURL("**/services/**", { timeout: 20000 });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1800 } });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').fill("admin@local.test");
  await page.locator('input[name="password"]').fill("Qwerty123.");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/", { timeout: 20000 });

  await ensureServiceExists(page);
  const serviceDetailUrl = page.url();

  await page.waitForTimeout(700);
  await page.screenshot({ path: "artifacts/invoice-detail-polish-desktop.png", fullPage: true });

  await page.getByRole("button", { name: "Marcar pagada" }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "artifacts/invoice-paid-modal-polish-desktop.png", fullPage: true });

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 1600 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await mobilePage.locator('input[name="email"]').fill("admin@local.test");
  await mobilePage.locator('input[name="password"]').fill("Qwerty123.");
  await mobilePage.getByRole("button", { name: "Entrar" }).click();
  await mobilePage.waitForURL("**/", { timeout: 20000 });
  await mobilePage.goto(serviceDetailUrl, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(700);
  await mobilePage.screenshot({ path: "artifacts/invoice-detail-polish-mobile.png", fullPage: true });

  await mobileContext.close();
  await context.close();
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
