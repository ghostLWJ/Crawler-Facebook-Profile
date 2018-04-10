const puppeteer = require ('puppeteer');
const { wrap: async } = require ('co');

const config = require ('./config.js');

let page = null;
let browser = null;

const fbUrl = {
  index: 'https://www.facebook.com/',
  searchPeople: 'https://www.facebook.com/search/people/?q=',
  peopleProfile: 'https://www.facebook.com/profile.php?id='
};


const getItemFn = function () {
  const extractedElements = document.querySelectorAll('div._5bl2');
  const items = [];
  for (let element of extractedElements) {
    let dataBt = element.querySelectorAll('div[data-bt]')[0].getAttribute('data-bt');
    dataBt = JSON.parse (dataBt);
    items.push (dataBt.id);
  }
  return items;
}

const infiniteScrollBottom = async (function* (page, getItemFn, targetCount = 50, scrollDelay = 3000) {
  let items = [];
  let previousHeight;
  let lastItemCount = 0
  while (items.length < targetCount) {
    yield page.waitFor(2000); // for headless false debug
    items = yield page.evaluate(getItemFn);
    if (lastItemCount === items.length) { break; }
    lastItemCount = items.length;
    previousHeight = yield page.evaluate('document.body.scrollHeight');
    yield page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    yield page.waitFor(scrollDelay);
  }
  return items;
});

const login = async (function* () {
  if (page) { return page; }

  const headless = false;
  const slowMo = 100;

  browser = yield puppeteer.launch({
    headless,
    slowMo
  });

  page = yield browser.newPage();

  yield page.goto(fbUrl.index);

  const inputEmail = yield page.$('#email');
  const inputPass = yield page.$('#pass');
  const inputButton = yield page.$('input[type=submit]');

  yield inputEmail.type (config.fb.account);
  yield inputPass.type (config.fb.password);
  yield inputButton.click();
  yield page.waitForNavigation();

  return page;
})

const searchPeople = async (function* (name) {
  if (!name) { return {}; }
  const page = yield login();

  yield page.goto(`${fbUrl.searchPeople}${name}`);

  const ids = yield infiniteScrollBottom(page, getItemFn);

  for (let id of ids) { yield page.goto(`${fbUrl.peopleProfile}${id}`); }
});

searchPeople('jack');

module.exports = {
  searchPeople,
};
