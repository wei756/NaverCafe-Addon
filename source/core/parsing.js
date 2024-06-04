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

/**
 * @description 현재 페이지가 게시글 페이지인지 확인하고 게시글 페이지면 카페id와 게시글id를 반환합니다.
 *
 * @returns {{cafeId: string, articleId: string} | null}
 */
function checkArticlePage() {
  const url = location.href;
  const articlePageRegex =
    /cafe\.naver\.com\/ca-fe\/cafes\/(?<cafeId>\d+)\/articles\/(?<articleId>\d+)/g;
  const articleOldPageRegex =
    /cafe\.naver\.com\/ArticleRead\.nhn(\&|\?)clubid=(?<cafeId>\d+)&articleid=(?<articleId>\d+)/g;
  if (url.match(articlePageRegex)) {
    return articlePageRegex.exec(url).groups;
  } else if (url.match(articleOldPageRegex)) {
    return articleOldPageRegex.exec(url).groups;
  } else {
    return null;
  }
}

/**
 * @description 현재 게시글의 작성자 key를 반환합니다.
 *
 * @returns {Promise<{cafeId: string | null, articleId: string | null, memberKey: string | null}>}
 */
async function getWriterProfileOnArticle() {
  const blankResult = { cafeId: null, articleId: null, memberKey: null };
  const isArticlePage = checkArticlePage();
  if (!isArticlePage) {
    return blankResult;
  }
  const { cafeId, articleId } = isArticlePage;

  await waitUntilLoadedElement('.ArticleContentBox');
  const articleProfile = await waitUntilLoadedElement('.ArticleWriterProfile');
  await waitUntilLoadedElement('.ArticleWriterProfile a.more_area');
  const url = articleProfile?.querySelector('a.more_area')?.href;

  if (!url) {
    return blankResult;
  }

  const profilePageRegex =
    /ca-fe\/cafes\/(?<cafeId>\d+)\/members\/(?<memberKey>[0-9a-zA-Z_-]+)/g;

  if (url?.match(profilePageRegex)) {
    const { memberKey } = profilePageRegex.exec(url).groups;
    return { cafeId, articleId, memberKey };
  } else {
    return blankResult;
  }
}
