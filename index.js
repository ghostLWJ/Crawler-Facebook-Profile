const puppeteer = require ('puppeteer');
const { wrap: async } = require ('co');
const _ = require ('lodash');

const config = require ('./config.js');

let page = null;
let browser = null;

const createService = async (function* () {
  const headless = false;
  const slowMo = 0;
  browser = yield puppeteer.launch ({ headless, slowMo });
  page = yield browser.newPage ();
  yield login();
});

const fbUrl = {
  index: 'https://www.facebook.com/',
  searchPeople: 'https://www.facebook.com/search/people/?q=',
  peopleProfile: 'https://www.facebook.com/profile.php?id='
};

/**
 * @return [id: String]
 */
const getProfiles = function () {
  const profileElements = document.querySelectorAll('div._5bl2');
  const items = [];
  for (let profileEl of profileElements) {
    let dataBt = profileEl.querySelectorAll('div[data-bt]')[0].getAttribute('data-bt');
    dataBt = JSON.parse (dataBt);
    items.push (dataBt.id);
  }
  return items;
};

/**
 * @return { name: String }
 */
const parseProfile = function () {
  const alternateNameTagName = '<span';
  let profile = {};
  let name = document.querySelector('#fb-timeline-cover-name > a').innerHTML;

  if (name.includes (alternateNameTagName)) {
    name = name.substring(0, name.indexOf(alternateNameTagName) - 1);
  }

  profile.name = name;
  return profile;
}


const infiniteScrollBottom = async (function* (page, getItemFn, targetCount = 50, scrollDelay = 3000) {
  let items = [];
  let previousHeight;
  let lastItemCount = 0
  while (items.length < targetCount) {
    yield page.waitFor(2000); // for headless false debug, permission popup cancel manually.
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
  yield page.goto(fbUrl.index);

  const inputEmail = yield page.$('#email');
  const inputPass = yield page.$('#pass');
  const inputButton = yield page.$('input[type=submit]');

  yield inputEmail.type (config.fb.account);
  yield inputPass.type (config.fb.password);
  yield inputButton.click();
  yield page.waitForNavigation();
});

/**
 * Profile
 * { id: String, name: String }
 */

/**
 * @param Array | Number id
 * @return Array [profile]
 */
const getPeopleProfile = async (function* (id) {
  let profiles = [];
  let _ids = [];

  if (_.isArray (id)) { _ids = [...id]; }
  else { _ids.push (id); }

  for (let i of _ids) {
    yield page.goto(`${fbUrl.peopleProfile}${String(i)}`);
    let profile = yield page.evaluate(parseProfile);

    profiles.push ({
      id: i,
      name: profile.name
    });
  }

  return profiles;
});

/**
 * @param Page page
 * @param Array | Number id
 * @return Array [profile]
 */
const searchPeople = async (function* (name, peopleCount = 50) {
  let profiles = [];

  yield page.goto(`${fbUrl.searchPeople}${name}`);

  const ids = yield infiniteScrollBottom(page, getProfiles, peopleCount);
  yield getPeopleProfile (ids);

  return profiles;
});

module.exports = {
  createService,
  searchPeople
};
