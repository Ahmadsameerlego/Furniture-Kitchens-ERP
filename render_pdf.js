const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
    const edgePaths = [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    ];

    let executablePath = edgePaths.find(p => fs.existsSync(p));
    if (!executablePath) {
        throw new Error('No compatible browser executable found.');
    }

    console.log('Using browser at:', executablePath);

    const browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--font-render-hinting=max'
        ]
    });

    const page = await browser.newPage();
    const htmlPath = path.resolve(__dirname, 'quotation_furniture_land.html');
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

    console.log('Loading URL:', fileUrl);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    const outputPdfPath = path.resolve(__dirname, 'عرض_سعر_نظام_Rewaq_ERP_شركة_Furniture_Land.pdf');

    await page.pdf({
        path: outputPdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '12mm',
            right: '12mm',
            bottom: '12mm',
            left: '12mm'
        }
    });

    console.log('PDF successfully generated at:', outputPdfPath);
    await browser.close();
}

generatePDF().catch(err => {
    console.error('Error generating PDF:', err);
    process.exit(1);
});
