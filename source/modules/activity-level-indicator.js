const ACT_LEVEL = {
  WEIGHT: {
    // 항목별 활동지수
    ARTICLE: 10, // 게시글
    COMMENT: 5, // 댓글
    VISIT: 1, // 방문수
    JOIN: 5, // 가입일
  },
  SECTION: [
    // 레벨구간별 필요 활동지수
    { MIN_LEVEL: 0, MIN_EXP: 0, LEVEL_EXP: 8 },
    { MIN_LEVEL: 1, MIN_EXP: 8, LEVEL_EXP: 73.51724138 },
    { MIN_LEVEL: 30, MIN_EXP: 2140, LEVEL_EXP: 176 },
    { MIN_LEVEL: 60, MIN_EXP: 7420, LEVEL_EXP: 144 },
    { MIN_LEVEL: 120, MIN_EXP: 16060, LEVEL_EXP: 312.375 },
    { MIN_LEVEL: 200, MIN_EXP: 41050, LEVEL_EXP: 376 },
    { MIN_LEVEL: 350, MIN_EXP: 97450, LEVEL_EXP: 500 },
  ],
};

/**
 * @description 활동지수를 계산합니다.
 *
 * @param {number} articleCount
 * @param {number} commentCount
 * @param {number} visitCount
 * @param {number} joinDate
 * @returns {number}
 */
function calculateActivityExp(
  articleCount,
  commentCount,
  visitCount,
  joinDate,
) {
  return (
    articleCount * ACT_LEVEL.WEIGHT.ARTICLE +
    commentCount * ACT_LEVEL.WEIGHT.COMMENT +
    visitCount * ACT_LEVEL.WEIGHT.VISIT +
    joinDate * ACT_LEVEL.WEIGHT.JOIN
  );
}

function calculateLevel(exp) {
  let level = 0;
  for (const section of ACT_LEVEL.SECTION) {
    if (exp >= section.MIN_EXP) {
      level =
        section.MIN_LEVEL +
        Math.floor((exp - section.MIN_EXP) / section.LEVEL_EXP);
    }
  }
  return level;
}

function calculateCurrentLevelExp(level) {
  let currentLevelExp = 0;
  for (const section of ACT_LEVEL.SECTION) {
    if (level >= section.MIN_LEVEL) {
      currentLevelExp =
        section.MIN_EXP + section.LEVEL_EXP * (level - section.MIN_LEVEL);
    }
  }
  return currentLevelExp;
}

function calculateNextLevelExp(exp) {
  let nextLevelExp = 0;
  for (const section of ACT_LEVEL.SECTION) {
    if (exp >= section.MIN_EXP) {
      nextLevelExp =
        section.MIN_EXP +
        section.LEVEL_EXP *
          (Math.floor((exp - section.MIN_EXP) / section.LEVEL_EXP) + 1);
    }
  }
  return nextLevelExp;
}

/**
 *
 * @param {MemberInfo} memberInfo
 * @returns {string}
 */
function geneLevelUI(memberInfo) {
  // 왁물원에서만 표시
  if (memberInfo.clubId !== 27842958) {
    return '';
  }

  const activityExp = calculateActivityExp(
    memberInfo.articleCount,
    memberInfo.commentCount,
    memberInfo.visitCount,
    Math.floor(
      (Date.now() - new Date(memberInfo.joinDate).getTime()) /
        1000 /
        60 /
        60 /
        24,
    ),
  );
  const currentLevel = calculateLevel(activityExp);
  const currentLevelExp = calculateCurrentLevelExp(currentLevel);
  const nextLevelExp = calculateNextLevelExp(activityExp);
  const expPercent =
    ((activityExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;

  const nextArticle = Math.ceil(
    (nextLevelExp - activityExp) / ACT_LEVEL.WEIGHT.ARTICLE,
  );
  const nextVisit = Math.ceil(
    (nextLevelExp - activityExp) / ACT_LEVEL.WEIGHT.VISIT,
  );
  const nextComment = Math.ceil(
    (nextLevelExp - activityExp) / ACT_LEVEL.WEIGHT.COMMENT,
  );

  return `
    <div class="activityLevelIndicator">
      Lv.<span class="levelValue">${currentLevel}</span>
      <div class="levelGaugeWrapper">
        <div class="levelGaugeCard">
          <div class="levelGauge">
            <div class="levelGaugeBar">
              <div class="currentGauge" style="width: ${expPercent}%;"></div>
            </div>
            <div class="levelStatus">
              <div class="expPercent">
                <span class="percent">${expPercent.toFixed(1)}</span>%
              </div>
              <div class="levelExp">
                <span class="currentExp">${activityExp}</span>/<span class="nextExp">${nextLevelExp}</span>
              </div>
            </div>
          </div>
          <div class="next">
            <p style="margin-block-end: 2px;">다음 레벨까지</p>
            <p>똥글 <span class="nextArticle count">${nextArticle}개</span> 또는</p>
            <p>댓글 <span class="nextComment count">${nextComment}개</span> 또는</p>
            <p>방문 <span class="nextVisit count">${nextVisit}회</span> 필요</p>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * @description 활동 지수 레벨을 프로필 페이지 등급 옆에 표시합니다.
 *
 * @type {PageHandler}
 */
async function injectLevelUIOnProfile({ cafeId, memberKey }) {
  if ($query('.sub_tit_profile .user_level .activityLevelIndicator')) {
    return;
  }

  const memberInfo = await getCafeMemberProfile({ cafeId, memberKey });

  const el = $query('.sub_tit_profile .user_level');
  el.insertAdjacentHTML('afterBegin', geneLevelUI(memberInfo));
}

onPage('member-profile', injectLevelUIOnProfile);
