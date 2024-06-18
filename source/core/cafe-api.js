/**
 * @typedef CafeApiError
 * @property {string} code
 * @property {string} msg
 */

/**
 * @typedef {Object} MemberInfo
 * @property {boolean} allowPopularMember
 * @property {number} articleCount
 * @property {string} circleProfileImageURL
 * @property {number} clubId
 * @property {string} clubName
 * @property {number} commentCount
 * @property {boolean} currentPopularMember
 * @property {boolean} isAgreeManagerDelegate
 * @property {string} joinDate
 * @property {string} levelIconImageURL
 * @property {number} liveCount
 * @property {boolean} memberAlarmStatus
 * @property {string} memberId
 * @property {string} memberKey
 * @property {number} memberLevel
 * @property {number} memberLevelIconId
 * @property {string} memberLevelName
 * @property {number} memberSubscriberCount
 * @property {string} nickName
 * @property {boolean} npayPointGiftable
 * @property {boolean} npayRemitable
 * @property {string} profileIconImageUrl
 * @property {string} profileImageURL
 * @property {boolean} readOnlyStatus
 * @property {boolean} realNameUse
 * @property {boolean} realNameUsingCafe
 * @property {number} replyCount
 * @property {boolean} showActivityStopIcon
 * @property {boolean} showBlog
 * @property {boolean} showCommentListButton
 * @property {boolean} showDetailInfoButton
 * @property {boolean} showLevelUpApplyIcon
 * @property {boolean} showLiveList
 * @property {boolean} showManageHome
 * @property {boolean} showSexAndAge
 * @property {number} visitCount
 */
/**
 * @typedef PopularArticleItem
 * @property {string} statDate
 * @property {number} cafeId
 * @property {number} articleId
 * @property {string} subject
 * @property {string} nickname
 * @property {string} writerId
 * @property {number} memberLevel
 * @property {number} memberLevelIconId
 * @property {number} commentCount
 * @property {string} formattedCommentCount
 * @property {string} representImage
 * @property {string} representImageType
 * @property {number} imageCount
 * @property {number} writeDateTimestamp
 * @property {string} aheadOfWriteDate
 * @property {string} saleStatus
 * @property {number} menuId
 * @property {string} menuType
 * @property {string} boardType
 * @property {boolean} newArticle
 * @property {boolean} openArticle
 * @property {number} readCount
 * @property {number} upCount
 * @property {string} formattedReadCount
 * @property {boolean} hasNewComment
 * @property {number} lastCommentDateTimestamp
 * @property {number} refArticleId
 * @property {number} totalScore
 * @property {boolean} enableToReadWhenNotCafeMember
 */

/**
 * @typedef SiblingArticleResponse
 * @property {SiblingArticleMenu} menu
 * @property {SiblingArticleList} articles
 * @property {SiblingArticleAlarm} alarm
 *
 * @typedef SiblingArticleMenu
 * @property {number} id
 * @property {string} name
 *
 * @typedef SiblingArticleList
 * @property {SiblingArticleItem[]} items
 * @property {number} totalPages
 *
 * @typedef SiblingArticleItem
 * @property {number} id
 * @property {string} subject
 * @property {string} writerId
 * @property {string} writerMemberKey
 * @property {string} writerNick
 * @property {number} writeDate
 * @property {number} memberLevel
 * @property {number} memberLevelIconId
 * @property {number} commentCount
 * @property {string} saleStatus
 * @property {SiblingArticleHead} head
 * @property {boolean} isAttachedMap
 * @property {boolean} isAttachedMovie
 * @property {boolean} isAttachedLink
 * @property {boolean} isAttachedMusic
 * @property {boolean} isAttachedCalendar
 * @property {boolean} isAttachedPoll
 * @property {boolean} isAttachedFile
 * @property {boolean} isAttachedImage
 * @property {boolean} isNewArticle
 * @property {boolean} isCafeBook
 * @property {boolean} isBadMenuByRestrict
 *
 * @typedef SiblingArticleHead
 * @property {number} headId
 * @property {string} head
 *
 * @typedef SiblingArticleAlarm
 * @property {boolean} isShow
 * @property {boolean} isChecked
 *
 * @typedef SiblingArticleError
 * @property {string} errorCode
 * @property {string} reason
 * @property {SiblingArticleErrorMore} more
 *
 * @typedef SiblingArticleErrorMore
 * @property {string} cafeUrl
 * @property {string} cafeName
 * @property {string} pcCafeName
 * @property {number} cafeId
 */

/**
 * @typedef CafeInfo
 * @property {string} profileImageUrl
 * @property {string} mobileGateImageUrl
 * @property {string} mobileCafeName
 * @property {CafeInfoView} cafeInfoView
 * @property {number} memberCount
 * @property {boolean} useMemberLevel
 * @property {boolean} readOnly
 * @property {boolean} popularMenu
 * @property {boolean} showPopularMember
 * @property {string} popularItemStatusCode
 * @property {string} popularArticleStatDate
 * @property {string} styleCode
 * @property {number} styleId
 * @property {SkinColorType} skinColorType
 * @property {boolean} openMemberInfo
 *
 * @typedef CafeInfoView
 * @property {number} cafeId
 * @property {string} cafeUrl
 * @property {string} cafeName
 * @property {string} openType
 * @property {string} sysopId
 * @property {string} sysopNick
 * @property {string} openDate
 * @property {boolean} powerCafe
 * @property {boolean} dormantCafe
 * @property {boolean} starJoinCafe
 * @property {boolean} educationCafe
 * @property {boolean} gameCafe
 * @property {boolean} teenagerHarmfulCafe
 * @property {boolean} townCafe
 * @property {string} regionName
 *
 * @typedef SkinColorType
 * @property {string} type
 * @property {string} cssFilePostfix
 */

/**
 * @typedef YoutubeVideoInfo
 * @property {string} title
 * @property {string} author_name
 * @property {string} author_url
 * @property {string} type
 * @property {string} height
 * @property {string} width
 * @property {string} version
 * @property {string} provider_name
 * @property {string} provider_url
 * @property {string} thumbnail_url
 * @property {string} thumbnail_width
 * @property {string} thumbnail_height
 * @property {string} html
 */

/**
 * @typedef AfreecaVodInfo
 * @property {string} '@context'
 * @property {string} '@type'
 * @property {string} name
 * @property {string} description
 * @property {string} thumbnailUrl
 * @property {string} uploadDate
 * @property {string} duration
 * @property {string} embedUrl
 * @property {string} author
 */

/**
 * @typedef AfreecaLiveInfo
 * @property {string} title
 * @property {string} nickname
 */

/**
 * @description 인기글 데이터를 불러옵니다.
 *
 * @param {string} cafeid 카페 id
 * @returns {Promise<{message: {result: {popularArticleList: PopularArticleItem[]}}}>}
 */
function getBestArticles(cafeid) {
  const url = `https://apis.naver.com/cafe-web/cafe2/WeeklyPopularArticleList.json?cafeId=${cafeid}`;
  return new Promise((resolve, reject) =>
    $.ajax({
      type: 'POST',
      url,
      dataType: 'json',
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: resolve,
      error: (xhr) => {
        alert('인기글을 불러오는 데 실패하였습니다.');
        alert(xhr.responseText);
        reject(xhr);
      },
    }),
  );
}

/**
 * @description 회원의 활동정지 상태를 반환합니다.
 *
 * @param {string} cafeid 카페 id
 * @param {string} memberKey 회원 id
 * @returns {Promise<boolean>}
 */
function getActivityStop(cafeId, memberKey) {
  return new Promise((resolve, reject) =>
    $.ajax({
      type: 'POST',
      url: `https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberStatus?cafeId=${cafeId}&memberKey=${memberKey}`,
      dataType: 'json',
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (data) => {
        resolve(
          data.message.status == '200' && data.message.result.activityStop,
        );
      },
      error: (xhr) => {
        reject(false);
      },
    }),
  );
}

const memberCache = {};

/**
 * Cafe API를 통해 멤버 정보를 불러옵니다.
 *
 * @param {{cafeId: string, memberId?: string, memberKey?: string}}
 * @returns {Promise<MemberInfo>}
 */
async function getCafeMemberProfile({ cafeId, memberId, memberKey }) {
  if (memberCache[memberKey] || memberCache[memberId]) {
    return memberCache[memberKey] || memberCache[memberId];
  }

  if (!cafeId || (!memberId && !memberKey) || (!memberId && !memberKey)) {
    return null;
  }

  const reqUrl = `https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberProfile?cafeId=${cafeId}${
    memberId ? '&memberId=' + memberId : '&memberKey=' + memberKey
  }&requestFrom=A`;
  const res = await fetch(reqUrl, { credentials: 'include' });

  if (res.ok == true) {
    const { message } = await res.json();
    if (message.status == '200') {
      memberKey
        ? (memberCache[memberKey] = message.result)
        : (memberCache[memberId] = message.result);
      return message.result;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/**
 * Cafe API를 통해 멤버 소개글을 불러옵니다.
 *
 * @param {{cafeId: string, memberId: string}}
 * @returns {Promise<{cafeId: number, introduction: string, memberId: introduction}>}
 */
async function getCafeMemberIntroduction(cafeId, memberId) {
  const reqUrl = `https://apis.naver.com/cafe-web/cafe-cafeinfo-api/v1.0/cafes/${cafeId}/member-profile/${memberId}/introduction`;
  const res = await fetch(reqUrl, { credentials: 'include' });

  if (res.ok == true) {
    const { result } = await res.json();
    if (result) {
      return result;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/**
 * Cafe API를 통해 멤버 최근 게시글을 불러옵니다.
 *
 * @param {{cafeId: string, memberId?: string, memberKey?: string}}
 * @returns {Promise<MemberInfo>}
 */
async function getCafeMemberArticles(cafeId, memberKey) {
  const reqUrl = `https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberNetworkArticleListV1?search.cafeId=${cafeId}&search.memberKey=${memberKey}&search.perPage=5&search.page=1`;
  const res = await fetch(reqUrl, { credentials: 'include' });

  if (res.ok == true) {
    const { message } = await res.json();
    if (message.status == '200') {
      return message.result;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/**
 * @description 차단한 멤버 키를 불러옵니다.
 *
 * @param {string} cafeid 카페 id
 * @returns {Promise<string[]>}
 */
function getBlockedMembers(cafeid) {
  const url = `https://apis.naver.com/cafe-web/cafe2/ArticleListV2dot1.json?search.clubid=${cafeid}&search.perPage=0`;
  return new Promise((resolve, reject) =>
    $.ajax({
      type: 'GET',
      url,
      dataType: 'json',
      xhrFields: {
        withCredentials: true,
      },
      crossDomain: true,
      success: (res) => {
        if (res.message.status == '200') {
          resolve(res.message.result.blockMemberList);
        } else {
          reject(res);
        }
      },
      error: (xhr) => {
        alert('인기글을 불러오는 데 실패하였습니다.');
        alert(xhr.responseText);
        reject(xhr);
      },
    }),
  );
}

/**
 * @description 이웃 글 목록을 불러옵니다.
 *
 * @param {number} cafeId
 * @param {number} articleId
 * @returns {Promise<SiblingArticleResponse | SiblingArticleError>}
 */
async function getArticleSiblings(cafeId, articleId, limit = 5) {
  const url = `https://apis.naver.com/cafe-web/cafe-articleapi/cafes/${cafeId}/articles/${articleId}/siblings?limit=${limit}`;
  return await fetch(url, { credentials: 'include' }).then((res) => res.json());
}

/**
 * @description 카페 정보를 출력합니다.
 *
 * @param {string | number} cafeUrl
 * @returns {Promise<CafeInfo | CafeApiError>}
 */
async function getCafeGateInfo(cafeUrl) {
  const params =
    typeof cafeUrl === 'string' ? `cluburl=${cafeUrl}` : `cafeid=${cafeUrl}`;
  return await fetch(
    `https://apis.naver.com/cafe-web/cafe2/CafeGateInfo.json?${params}`,
  )
    .then((res) => res.json())
    .then((res) => res.message.result || res.message.error);
}

/**
 * @description 유튜브 영상 정보를 출력합니다.
 *
 * @param {string} videoId
 * @returns {Promise<YoutubeVideoInfo | null>}
 */
async function getYoutubeVideoInfo(videoId) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  return await fetch(url)
    .then((res) => res.json())
    .catch(() => null);
}

/**
 * @description 아프리카 VOD 정보를 출력합니다.
 *
 * @param {string} videoId
 * @returns {Promise<AfreecaVodInfo | null>}
 */
async function getAfreecaVodInfo(videoId) {
  const url = `https://api.allorigins.win/raw?url=https://vod.afreecatv.com/player/${videoId}`;
  return await fetch(url)
    .then((res) => res.text())
    .then(
      (html) =>
        html.match(
          /(?<=<script type="application\/ld\+json">)(\n|.)*?(?=<\/script>)/,
        )?.[0],
    )
    .then(JSON.parse)
    .catch(() => null);
}

/**
 * @description 아프리카 생방송 정보를 출력합니다.
 *
 * @param {string} streamerId
 * @param {string} videoId
 * @returns {Promise<AfreecaLiveInfo | null>}
 */
async function getAfreecaLiveInfo(streamerId, videoId) {
  const url = `https://api.allorigins.win/raw?url=https://play.afreecatv.com/${streamerId}/${videoId}`;
  return await fetch(url)
    .then((res) => res.text())
    .then((html) => ({
      title: html.match(
        /(?<=<meta property="og:title" content=")(.+?)(?=" \/>)/,
      )?.[0],
      nickname: html.match(/(?<=<div class="nickname">)(.+?)(?=<\/div>)/)?.[0],
    }))
    .catch(() => null);
}
