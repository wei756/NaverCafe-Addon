/**
 * @typedef MemberMemo
 * @property {string} memberKey
 * @property {string} memo
 */
/**
 * @typedef AddonPreferences
 * @property {boolean} showBestThumb
 * @property {boolean} showProfileOnArticle
 * @property {boolean} darkmode
 * @property {MemberMemo[]} memberMemos
 * @property {4} version
 */

const STORAGE_VERSION = 4;
/**
 * @description 애드온 설정 데이터의 초기값을 생성합니다.
 */
async function initSyncStorage() {
  const items = await getSyncStorage();
  //console.log(items);

  if (items.showBestThumb === undefined) {
    items.showBestThumb = true;
  }
  if (items.showProfileOnArticle === undefined) {
    items.showProfileOnArticle = true;
  }
  if (items.darkmode === undefined) {
    items.darkmode = false;
  }
  if (items.memberMemos === undefined) {
    items.memberMemos = [];
  }
  items.version = STORAGE_VERSION;

  await new Promise((resolve) =>
    chrome.storage.sync.set(items, () => {
      resolve();
    }),
  );
}

/**
 * @description 애드온 설정 데이터를 초기화합니다.
 */
async function resetSyncStorage() {
  const dummyList = {
    showBestThumb: true,
    showProfileOnArticle: true,
    darkmode: false,
    version: STORAGE_VERSION,
  };
  chrome.storage.sync.set(dummyList, () => {});
}

/**
 * @description 애드온 설정 데이터를 불러옵니다.
 *
 * @returns {Promise<AddonPreferences>}
 */
function getSyncStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, (items) => {
      resolve(items);
    });
  });
}

/**
 * @description 애드온 설정 데이터에 데이터를 저장합니다.
 *
 * @param {keyof AddonPreferences} key
 * @param {any} value
 * @returns {Promise<>}
 */
async function setSyncStorage(key, value) {
  const oldData = await getSyncStorage();
  await new Promise((resolve) =>
    chrome.storage.sync.set(
      {
        ...oldData,
        [key]: value,
      },
      () => {
        resolve();
      },
    ),
  );
}
