import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const calFont = fileURLToPath(new URL( "../assets/fonts/Cal.ttf", import.meta.url));
const calbase = Buffer.from(await readFile(calFont)).toString("base64");

// ✅ TTF-data-url
const cal = `data:font/ttf;base64,${calbase}`;

const majorFont = fileURLToPath(new URL( "../assets/fonts/Major.ttf", import.meta.url));
const majorbase = Buffer.from(await readFile(majorFont)).toString("base64");

// ✅ TTF-data-url
const major = `data:font/ttf;base64,${majorbase}`;

const notoFont = fileURLToPath(new URL( "../assets/fonts/Nato.ttf", import.meta.url));
const notobase = Buffer.from(await readFile(notoFont)).toString("base64");

// ✅ TTF-data-url
const noto = `data:font/ttf;base64,${notobase}`;

async function fetchLogo(){
const res = await fetch("https://bdgt.netlify.app/logo.png");
const arrayBuffer = await res.arrayBuffer();
const logoBase64 = Buffer.from(arrayBuffer).toString("base64");
const logo = `data:image/png;base64,${logoBase64}`;
return logo;
}

type Row = {
  name?: string;
  amount?: number | string;
};

function escapeHtml(input: unknown) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(amount: unknown) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0));
}

function renderTableRows(rows: Row[]) {
  return rows
    .map((r) => {
      const name = escapeHtml(r.name ?? "");
      const amount = formatCurrency(r.amount ?? 0);
      return `
        <tr>
          <td class="nato">${name}</td>
          <td class="num nr">${amount}</td>
        </tr>
      `;
    })
    .join("");
}

function sumAmounts(rows: Row[]) {
  return rows.reduce((acc, r) => acc + Number(r.amount ?? 0), 0);
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);


  const incomes: Row[] = Array.isArray(body.incomes) ? body.incomes : [];
  const expenses: Row[] = Array.isArray(body.expenses) ? body.expenses : [];

  const incomeSum = sumAmounts(incomes);
  const expenseSum = sumAmounts(expenses);

const chartImg = body.chartPng
  ? `<img src="${body.chartPng}" style="width:320px; height:auto; margin-top:auto;" />`
  : `<div class="muted">Ingen chart</div>`;

  const incomesRows = incomes.length
    ? renderTableRows(incomes)
    : `<tr><td colspan="2" class="muted">Inga inkomster</td></tr>`;

  const expensesRows = expenses.length
    ? renderTableRows(expenses)
    : `<tr><td colspan="2" class="muted">Inga utgifter</td></tr>`;

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Budget</title>
        <style>
          @font-face {
            font-family: "Cal Sans";
            src: url(${cal}) format("truetype");
            font-weight: normal;
            font-style: normal;
          }
          @font-face {
            font-family: "Major Mono Display";
            src: url(${major}) format("truetype");
            font-weight: normal;
            font-style: normal;
          }
          @font-face {
            font-family: "Noto Sans Mono";
            src: url(${noto}) format("truetype");
            font-weight: normal;
            font-style: normal;
          }
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 28px; color: #222; }
          h1 { margin: 0 0 16px;  font-family: "Cal Sans", sans-serif; color: #303030; }
          span{font-family: "Noto Sans Mono", monospace;}
          .nato{ font-family: "Noto Sans Mono", monospace; }
          .meta { margin-bottom: 18px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; justify-content: space-between; }
          .card { border: 1px solid #ddd; border-radius: 10px; padding: 14px; }
          .row { display:flex; justify-content:space-between; margin: 6px 0; }
          .muted { color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }
          th { border-bottom: 1px solid #ddd; }
          .num { text-align: right; white-space: nowrap; }
          .footer { margin-top: 18px; font-size: 12px; color:#666; }
          .nr {font-family: "Major Mono Display", monospace;font-weight: 600;}
          .total {font-family: "Noto Sans Mono", monospace; font-weight: 800; }
          .brBo{ border-bottom:1px solid #000;  padding-bottom:4px; }
          .expenses{ display: grid; grid-template-columns: 1fr ; gap: 10px; }
        </style>
      </head>

      <body>
        <h1>Budget Översikt</h1>

        <div class="meta">
          <div class="row brBo"><span>Total Inkomst</span><strong class="nr">${formatCurrency(incomeSum)}</strong></div>
          <div class="row brBo"><span>Total Budget</span><strong class="nr">${formatCurrency(body.budget)}</strong></div>
          <div class="row brBo"><span>Sparande</span><strong class="nr">${formatCurrency(body.savings)}</strong></div>
          <div class="row brBo"><span>Per dag</span><strong class="nr">~ ${formatCurrency(body.perDay)}</strong></div>
          <div class="row"><span>Per vecka</span><strong class="nr">~ ${formatCurrency(body.perWeek)}</strong></div>
        </div>

        <div class="grid">
          <div class="expenses">
            <h2 style="margin:0 column-span: all;">Utgifter</h2>
            <table>
              <thead>
                <tr>
                  <th>Namn</th>
                  <th class="num">Mängd</th>
                </tr>
              </thead>
              <tbody>
                ${expensesRows}
                <tr class="total">
                  <td>Totalt</td>
                  <td class="num nr">${formatCurrency(expenseSum)}</td>
                </tr>
              </tbody>
            </table>
             
          </div>
          ${chartImg}
        </div>
        <div class="nato" style="margin-top: 10px;">${body.dayToSalary}</div>
        <div class="footer">
        
          Skapad: ${new Date().toLocaleDateString("sv-SE")}
        </div>
      </body>
    </html>
  `;
 const executablePath = await chromium.executablePath();
   
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args:chromium.args,
    defaultViewport: { width: 1280, height: 720 },
  });

  try {
    const logo = fetchLogo();
    const page = await browser.newPage();
    await page.goto("about:blank", { waitUntil: "domcontentloaded" });
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
      displayHeaderFooter: true,
      footerTemplate: `
    <div style="
      width: 100%;
      font-size: 10px;
      padding: 0 15mm;
      color: #666;
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <span>Powered by <a href="https://wolkano.se/" style="text-shadow: 1px 1px 0px #ff5400; text-decoration: none; ">Wolkano</a></span>
      <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>
  `,
  headerTemplate: `<div></div>`,
    });

    setHeader(event, "Content-Type", "application/pdf");
 
    setHeader(event, "Content-Disposition", 'inline; filename="Budget.pdf"');
   
   

    return pdf;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;  
  } finally {
    await browser.close();
  }
});
