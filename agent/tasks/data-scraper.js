/**
 * TASK 1: DATA SCRAPER
 * Pulls live NY cannabis market data from state sources
 * Sources: data.ny.gov OCM dataset, Cannabis Control Board, Headset
 */
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const { log } = require('../utils/logger');

const DATA_FILE = path.join(__dirname, '..', 'output', 'market-data.json');
const OCM_DATASET_URL = 'https://data.ny.gov/resource/jskf-tt3q.json?$limit=5000';

async function scrapeMarketData() {
  let data = await loadPreviousData();
  
  try {
    // SOURCE 1: OCM License Dataset (data.ny.gov)
    log('SCRAPER', 'Fetching OCM license dataset...');
    const licenses = await fetchOCMLicenses();
    data.licenses = licenses;
    log('SCRAPER', `OCM: ${licenses.totalCount} license records`);
  } catch (err) {
    log('SCRAPER', `OCM fetch failed: ${err.message}. Using cached data.`);
  }

  try {
    // SOURCE 2: Cannabis.ny.gov for dispensary counts and sales
    log('SCRAPER', 'Fetching cannabis.ny.gov updates...');
    const siteData = await fetchOCMSiteData();
    data.dispensaries = siteData.dispensaries || data.dispensaries;
    data.salesData = siteData.salesData || data.salesData;
  } catch (err) {
    log('SCRAPER', `Site scrape failed: ${err.message}. Using cached data.`);
  }

  // Compute derived metrics
  data.computed = computeMetrics(data);
  data.lastUpdated = new Date().toISOString();
  data.updateCycle = (data.updateCycle || 0) + 1;

  // Persist
  await fs.writeJson(DATA_FILE, data, { spaces: 2 });
  log('SCRAPER', `Data saved: cycle #${data.updateCycle}`);
  return data;
}

async function loadPreviousData() {
  try {
    return await fs.readJson(DATA_FILE);
  } catch {
    return getDefaultData();
  }
}

function getDefaultData() {
  // Verified baseline from April 3, 2026 CCB meeting + Headset + OCM
  return {
    licenses: {
      totalCount: 2204,
      byType: {
        cultivators: 246, distributors: 234, microbusinesses: 324,
        processors: 540, retailDispensaries: 519, caurd: 341,
      },
      seePercentage: 57,
      caurdActive: 325,
    },
    dispensaries: { openCount: 623 },
    salesData: {
      cumulative: 3300000000,
      annual2025: 1690000000,
      monthlyFeb2026: 163500000,
      yoyGrowth: 54.8,
      avgItemPrice: 31.29,
      avgItemPricePriorYear: 35.41,
      projected2026: 2600000000,
      medical2025: 95500000,
      medicalDeclineYoY: -30,
    },
    beverages: {
      salesYoY: 88.2,
      unitGrowthYoY: 134.1,
      teaCoffeeGrowth: 223.8,
    },
    updateCycle: 0,
    lastUpdated: new Date().toISOString(),
    computed: {},
  };
}

async function fetchOCMLicenses() {
  const res = await fetch(OCM_DATASET_URL);
  if (!res.ok) throw new Error(`OCM API ${res.status}`);
  const records = await res.json();
  
  const byType = {};
  let seeCount = 0;
  records.forEach(r => {
    const type = (r.license_type || r.category || 'unknown').toLowerCase();
    byType[type] = (byType[type] || 0) + 1;
    if (r.see_applicant === 'Yes' || r.equity === 'Yes') seeCount++;
  });

  return {
    totalCount: records.length,
    byType,
    seePercentage: records.length > 0 ? Math.round((seeCount / records.length) * 100) : 0,
    rawRecordCount: records.length,
  };
}

async function fetchOCMSiteData() {
  const res = await fetch('https://cannabis.ny.gov/', {
    headers: { 'User-Agent': 'TCRB-Agent/1.0' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const text = $('body').text();

  // Extract dispensary count from page text
  const dispMatch = text.match(/(\d{3,4})\s*(?:legal\s+)?dispensar/i);
  const salesMatch = text.match(/\$?([\d.]+)\s*billion/i);
  
  return {
    dispensaries: dispMatch ? { openCount: parseInt(dispMatch[1]) } : null,
    salesData: salesMatch ? { latestBillionRef: parseFloat(salesMatch[1]) } : null,
  };
}

function computeMetrics(data) {
  const lic = data.licenses || {};
  const sales = data.salesData || {};
  const disp = data.dispensaries || {};

  return {
    conversionRate: lic.totalCount && disp.openCount
      ? ((disp.openCount / lic.totalCount) * 100).toFixed(1)
      : null,
    priceCompressionYoY: sales.avgItemPrice && sales.avgItemPricePriorYear
      ? (((sales.avgItemPrice - sales.avgItemPricePriorYear) / sales.avgItemPricePriorYear) * 100).toFixed(1)
      : null,
    licensesNotOpen: lic.totalCount && disp.openCount
      ? lic.totalCount - disp.openCount
      : null,
  };
}

module.exports = { scrapeMarketData };
