const puppeteer = require ('puppeteer');
const { wrap: async } = require ('co');
const _ = require ('lodash');

const config = require ('./config');

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
  peopleProfile: 'https://www.facebook.com/profile.php?id=',
  skFriends: 'https://www.facebook.com/profile.php?id=',
};
const skFriendSuffix = '&sk=friends';

/**
 * @return Array [id: String]
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
 * @return Array [Profile]
 */
const getFriends = function () {
  const profileElements = document.querySelectorAll('._698');
  const items = [];
  for (let profileEl of profileElements) {
    profileEl = profileEl.querySelectorAll('a')[1];
    let name = profileEl.innerText;
    let dataHoverCard = profileEl.getAttribute('data-hovercard');
    let id = dataHoverCard.substring(dataHoverCard.indexOf('id=')+3, dataHoverCard.indexOf('&'));
    items.push ({
      id ,
      name
    });
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

/**
 * @param Page page
 * @param Function getItemFn
 * @param Number targetCount
 * @param Number scrollDelay
 * @return Array [id: String]
 */
const infiniteScrollBottom = async (function* (page, getItemFn, targetCount = 50, scrollDelay = 3000) {
  let items = [];
  let previousHeight;
  let lastItemCount = 0
  while (items.length < targetCount) {
    yield page.waitFor(2000); // for headless false debug, permission popup cancel manually.
    items = yield page.evaluate(getItemFn);
    if (lastItemCount === items.length) { break; }
    lastItemCount = items.length;
    // previousHeight = yield page.evaluate('document.body.scrollHeight');
    previousHeight = yield page.evaluate('window.scrollY');
    yield page.evaluate ('window.scrollTo(0, document.body.scrollHeight)');
    yield page.waitForFunction (`window.scrollY > ${previousHeight}`);
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
      id: String(i),
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
  profiles = yield getPeopleProfile (ids);

  return profiles;
});

/*
 * @param { first: String, second: String } target
 * @return Array [profile]
 */
const searchMutualFriends = async (function* (target) {
  const { first, second } = target;
  let profiles = [];

  yield page.goto(`${fbUrl.skFriends}${first}${skFriendSuffix}`);

  profiles = yield infiniteScrollBottom(page, getFriends, Infinity, 500);

  return profiles;
})

module.exports = {
  createService,
  searchPeople,
  searchMutualFriends
};
