/**
 * @description 현재 페이지가 프로필 페이지인지 확인하고 프로필 페이지면 카페id와 멤버키를 반환합니다.
 *
 * @returns {Promise<{cafeId: string, memberKey: string} | null>}
 */
async function parseMemberOnProfilePage() {
  // url 추출
  (await waitUntilLoadedElement('button.nick_btn')).click();
  const url = (
    await waitUntilLoadedElement(
      '#LayerMore1 > ul.layer_list > li:first-child > a',
    )
  )?.href;
  (await waitUntilLoadedElement('button.nick_btn')).click();

  const profilePageRegex =
    /cafe\.naver\.com\/ca-fe\/cafes\/(?<cafeId>\d+)\/members\/(?<memberKey>[0-9a-zA-Z_-]+)/g;
  if (url?.match(profilePageRegex)) {
    return profilePageRegex.exec(url).groups;
  } else {
    return null;
  }
}
