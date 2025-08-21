import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { NextRequest, NextResponse } from "next/server";
import TurndownService from "turndown";

async function getBrowser() {
  return puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v116.0.0/chromium-v116.0.0-pack.tar"
    ),
    headless: chromium.headless,
    // ignoreHTTPSErrors: true,
  });
}

async function scrapeWebsite(url: string) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle2",
  });

  await page.evaluate(() => {
    document
      .querySelectorAll("script, style, noscript, iframe")
      .forEach((el) => el.remove());
  });

  await page.evaluate(() => {
    document
      .querySelectorAll("sidebar, nav, footer, header")
      .forEach((el) => el.remove());
  });

  const cleanedContent = await page.evaluate(() => document.body.innerHTML);
  await browser.close();

  return cleanedContent;
}

const turndownService = new TurndownService();

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return Response.json({ error: "No URL provided" }, { status: 401 });
  }

  const htmlContent = await scrapeWebsite(url);

  if (!htmlContent) {
    return Response.json({ error: "Error fetching content" }, { status: 500 });
  }

  const markdownContent = turndownService.turndown(htmlContent);

  return NextResponse.json({ text: markdownContent });
}
