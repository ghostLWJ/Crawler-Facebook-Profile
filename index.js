const puppeteer = require ('puppeteer');
const { wrap: async } = require ('co');
const _ = require ('lodash');

const config = require ('./config');

let page = null;
let browser = null;

let headless = true;
let slowMo = 0;

const createService = async (function* () {
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
  return Promise.resolve(items);
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
  let tryCount = 5;
  const waitForCancelPermission = 5000;
  try {
    while (items.length < targetCount) {
      if (!headless) { yield page.waitFor (waitForCancelPermission); headless = true; } // for headless false debug, permission popup cancel manually.
      items = yield page.evaluate(getItemFn);
      if (lastItemCount === items.length) {
        if (!tryCount--) {
          break;
        }
        console.log (`Try count is = ${tryCount}`);
      }
      lastItemCount = items.length;
      previousHeight = yield page.evaluate('window.scrollY');
      yield page.evaluate ('window.scrollTo(0, document.body.scrollHeight)');
      yield page.waitForFunction (`window.scrollY > ${previousHeight}`);
      yield page.waitFor(scrollDelay);
    }
  } catch (e) {
    console.log (`OOops Error happened ${e}`);
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

  try {
    profiles = yield infiniteScrollBottom(page, getFriends, Infinity, 500).catch( e => console.log(`rejected error ${e}`));
  } catch (e) {
    console.log (`Oops Error happened ${e}`);
  }

  return profiles;
})

module.exports = {
  createService,
  searchPeople,
  searchMutualFriends
};
