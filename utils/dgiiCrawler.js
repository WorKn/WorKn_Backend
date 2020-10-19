// const puppeteer = require('puppeteer');
const puppeteer = {};

exports.getContributorDGIIData = async (rnc) => {
  try {
    const selector = '#cphMain_txtRNCCedula';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // console.log('Going to page...');
    await page.goto(
      'https://dgii.gov.do/app/WebApps/ConsultasWeb2/ConsultasWeb/consultas/rnc.aspx'
    );
    await page.waitForSelector(selector);

    // console.log('Clicking element...');
    await page.click(selector);
    await page.keyboard.type(rnc);

    // console.log('Pressing enter...');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(500);

    const data = await page.evaluate(() => {
      let data = {};
      const firstCol = document.querySelectorAll('td[style="font-weight:bold;"]');
      const secondCol = document.querySelectorAll('td:not([style="font-weight:bold;"])');

      for (var i = 0; i < firstCol.length; i++) {
        data[firstCol[i].innerText] = secondCol[i].innerText;
      }

      return data;
    });

    await page.close();
    await browser.close();

    return data;
  } catch (error) {
    console.log(error);
    await browser.close();
    return {};
  }
};

exports.isOrgRegisteredInDGII = async (rnc) => {
  try {
    let verified = false;
    const result = await this.getContributorDGIIData(rnc);

    if (JSON.stringify(result) != JSON.stringify({})) verified = true;

    return verified;
  } catch (error) {
    console.log(error);
    return false;
  }
};
