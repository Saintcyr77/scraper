import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 926 });

    let hasNextPage = true;
    let pageNumber = 1;
    let headlines = [];

    while (hasNextPage) {
        await page.goto(`https://leetcode.com/problemset/all/?page=${pageNumber}`, { waitUntil: "networkidle2" });

        const newHeadlines = await page.evaluate(() => {
            const headlines = [];
            document.querySelectorAll(".h-5").forEach((headline) => {
                const text = headline.innerText;
                const href = headline.getAttribute("href");
                if (text && text.trim() !== "") {
                    headlines.push({ text: text.trim(), href });
                }
            });
            return headlines;
        });

        headlines = headlines.concat(newHeadlines);

        const nextButtonDisabled = await page.evaluate(() => {
            const nextButton = document.querySelector('[aria-label="next"]');
            return nextButton ? nextButton.disabled : true;
        });

        if (nextButtonDisabled) {
            hasNextPage = false;
        } else {
            pageNumber++;
        }
    }

    console.log(headlines);


    const csvData = headlines.map((headline) => `"${headline.text.replace(/"/g, '""')}","https://leetcode.com${headline.href ? headline.href : ""}"`).join("\n");
    fs.writeFileSync("headlines.csv", "Headline, Href\n" + csvData);

    await browser.close();
})();
