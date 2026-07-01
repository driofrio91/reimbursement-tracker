import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:4010";
const outputDir = path.resolve("artifacts", "qa-mobile");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(outputDir, name), fullPage: true });
}

async function getOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth,
    };
  });
}

async function run() {
  await ensureDir(outputDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices["iPhone 12"] });
  const page = await context.newPage();

  const result = {
    baseUrl,
    executedAt: new Date().toISOString(),
    checks: [],
    routes: {},
    overflow: {},
    primaryActions: {},
  };

  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await screenshot(page, "01-login.png");

  await page.locator('input[name="email"]').fill("sandy@local.test");
  await page.locator('input[name="password"]').fill("Sandy123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 15000 });

  result.checks.push({ id: "QA-22-login", pass: true, note: "Login movil correcto con Sandy." });

  const routesToCheck = ["/", "/services", "/services/new", "/invoices"];

  for (const route of routesToCheck) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    result.routes[route] = page.url();
    const overflow = await getOverflow(page);
    result.overflow[route] = overflow;
    await screenshot(page, `route-${route.replaceAll("/", "_") || "root"}.png`);
  }

  const createServiceButtonVisible = await page
    .goto(`${baseUrl}/services`, { waitUntil: "networkidle" })
    .then(async () => page.locator('a[href="/services/new"]').first().isVisible())
    .catch(() => false);

  const invoiceSearchButtonVisible = await page
    .goto(`${baseUrl}/invoices`, { waitUntil: "networkidle" })
    .then(async () => page.getByRole("button", { name: "Buscar" }).isVisible())
    .catch(() => false);

  result.primaryActions = {
    servicesNewButtonVisible: createServiceButtonVisible,
    invoicesSearchButtonVisible: invoiceSearchButtonVisible,
  };

  const firstInvoiceDetailLink = page.locator('a[href^="/invoices/"]').first();
  if ((await firstInvoiceDetailLink.count()) > 0) {
    await firstInvoiceDetailLink.click();
    await page.waitForLoadState("networkidle");
    await screenshot(page, "invoice-detail-mobile.png");

    const serviceLinkVisible = await page.locator('a[href^="/services/"]').first().isVisible().catch(() => false);
    result.primaryActions.invoiceDetailServiceLinkVisible = serviceLinkVisible;
  }

  const overflowEntries = Object.entries(result.overflow);
  const hasAnyOverflow = overflowEntries.some(([, info]) => info.hasHorizontalOverflow);

  result.checks.push({
    id: "QA-22",
    pass: true,
    note: "Navegacion movil ejecutada en rutas privadas principales.",
  });
  result.checks.push({
    id: "QA-23",
    pass: Boolean(createServiceButtonVisible && invoiceSearchButtonVisible),
    note: "Acciones principales visibles en /services y /invoices.",
  });
  result.checks.push({
    id: "QA-24",
    pass: !hasAnyOverflow,
    note: hasAnyOverflow ? "Se detecto overflow horizontal en al menos una ruta." : "Sin overflow horizontal en rutas revisadas.",
  });

  await fs.writeFile(path.join(outputDir, "results.json"), JSON.stringify(result, null, 2), "utf8");

  await context.close();
  await browser.close();

  console.log(JSON.stringify(result, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
