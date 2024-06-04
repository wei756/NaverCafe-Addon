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
 * @description 인기글 데이터를 불러옵니다.
 *
 * @param {string} cafeid 카페 id
 * @returns {{message: {result: {popularArticleList: PopularArticleItem[]}}}}
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
 * @returns {boolean}
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
 * @returns {MemberInfo}
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
 * @returns {{cafeId: number, introduction: string, memberId: introduction}}
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
 * @returns {MemberInfo}
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
 * @returns {string[]}
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
