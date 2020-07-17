let pp = require("puppeteer");
const { elementIsNotVisible } = require("selenium-webdriver/lib/until");
async function fn(){
    let browser = await pp.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
        
    });
    let {email,pwd} = require("./credentials")
    let AllTabs = await browser.pages();
    let tab = AllTabs[0];
    await tab.goto("https://www.hackerrank.com/auth/login?h_l=body_middle_left_button&h_r=login")
    await tab.type("#input-1",email);
    await tab.type("#input-2",pwd);
    await Promise.all([
        tab.waitForNavigation({ waitUntil: "networkidle0" }),
        tab.click("button.auth-button"),
    ]);
    await tab.click('a[data-analytics="NavBarProfileDropDown"]');
    await
        Promise.all([
            tab.waitForNavigation({ waitUntil: "networkidle0" }),
            tab.click("a[data-analytics='NavBarProfileDropDownAdministration']")]);
    // Performs release event on target element
    // driver.findElements
    let liArr = await tab.$$("ul.nav-tabs li");
    await liArr[1].click();
    let createChallengePageLink = await tab.url();
    console.log(createChallengePageLink);
    // parallely tab open 
    // browser.newPage();
    await handleSinglePage(tab, browser);
}

async function handleSinglePage(tab, browser){
    await tab.waitForSelector(".backbone.block-center", {visible:true});
    let qList = await tab.$$(".backbone.block-center");
    let linkPromiseArr = [];
    for(let i = 0;i < qList.length; i++){
        let link = tab.evaluate(function(elem){
            return elem.getAttribute("href")
        },qList[i]);
        linkPromiseArr.push(link);
    }
    let allLinksArr = await Promise.all(linkPromiseArr);
    allQonOnePArr = [];
    for(let i = 0;i < allLinksArr.length;i++){
        let cLink = `https://www.hackerrank.com${allLinksArr[i]}`
        let newTab = await browser.newPage();
        let qWillSolvedP = questionSolver(cLink,newTab);
        allQonOnePArr.push(qWillSolvedP);
    }
    await Promise.all(allQonOnePArr);

    let allLis = await tab.$$(".pagination ul li");
    let nxtBtn = allLis[allLis.length - 2];
    let isDisabled = await tab.evaluate(function(elem){
        return elem.getAttribute("class");
    },nxtBtn);
    if(isDisabled == "disabled"){
        return;
    } else {
        await Promise.all([nxtBtn.click(),tab.waitForNavigation({waitUntil : "networkidle0"})]);
        await handleSinglePage(tab, browser);
    }
}
fn();
function questionSolver(cLink, newTab) {
    return new Promise(function (resolve, reject) {
        newTab.goto(cLink, { waitUntil: "networkidle0" }).
            then(function () {
                let waitForModerator = newTab.waitForSelector("li[data-tab='moderators']", { visible: true });
                return waitForModerator;
            })
            .then(function () {
                let navigationPromise = Promise.all(
                    [newTab.click("li[data-tab='moderators']"), newTab.waitForNavigation({ waitUntil: "networkidle0" })])
                return navigationPromise
            }).then(function () {
                let waitForModeratorP = newTab.waitForSelector("#moderator", { visible: true})
                return waitForModeratorP;
            }).then(function () {
                let keyWillEnteredP = newTab.type("#moderator", "Raghav");
                return keyWillEnteredP;
            }).then(function () {
                let waitForEnterP = newTab.keyboard.press("Enter");
                return waitForEnterP;
            }).then(function () {
                let waitForClick = newTab.click(".save-challenge.btn.btn-green");
                return waitForClick;
            }).then(function () {
                let waitForTabToCloseP = newTab.close();
                return waitForTabToCloseP;
            })
            .then(function () {
                console.log("After");
                resolve();
            }).catch(function (err) {
                reject(err);
            })
    })

}