const { default: puppeteer } = require("puppeteer");

module.exports ={
    BROWSER: async function(){
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
        return browser;
    }
}