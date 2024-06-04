/**
 * @param {(el: Element) => Promise<any>} handler
 * @param {number} timeout
 * @returns {Promise<HTMLElement>}
 */
async function onProfilePage(handler, timeout = 10000) {
  return await waitUntilLoadedElement(
    '.sub_tit_profile .nick_area',
    handler,
    timeout,
  );
}
