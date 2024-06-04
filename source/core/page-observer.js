/**
 * @typedef {'member-profile' | 'article-list' | 'article'} PageName
 */

/**
 * @typedef PageEvent
 * @property {string} cafeId
 * @property {string} memberKey
 */
/**
 * @typedef {(e: PageEvent) => void} PageHandler
 */

/** @type {Record<PageName, PageHandler[]>} */
const handlers = {
  article: [],
  'article-list': [],
  'member-profile': [],
};

/**
 * @param {PageName} name
 * @param {PageHandler} handler
 * @returns {void}
 */
function onPage(name, handler) {
  handlers[name]?.push(handler);
}

async function performMemberProfileEvent() {
  // member-profile
  while (true) {
    await waitUntilLoadedElement(
      '.sub_tit_profile .nick_area',
      async () => {
        if ($query('.sub_tit_profile .nick_area .loaded')) {
          return;
        }

        const isProfilePage = await parseMemberOnProfilePage();
        if (isProfilePage) {
          const { cafeId, memberKey } = isProfilePage;
          handlers['member-profile'].forEach((handler) =>
            handler({ cafeId, memberKey }),
          );

          const el = $query('.sub_tit_profile .nick_area');
          el.insertAdjacentHTML(
            'beforeend',
            `<span class="loaded" style="display:none"></span>`,
          );
        }
      },
      -1,
    );

    await wait(50);
  }
}

function performEvents() {
  performMemberProfileEvent();
}
