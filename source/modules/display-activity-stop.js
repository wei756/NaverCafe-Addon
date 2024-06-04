/**
 * @description 현재 보고 있는 회원이 활동정지 상태인지 확인하고 그 상태를 프로필에 표시합니다.
 *
 * @type {PageHandler}
 */
async function checkActivityStop({ cafeId, memberKey }) {

  if ($query('.sub_tit_profile .nick_area .activityStop')) {
    return;
  }

  const isActivityStop = await getActivityStop(cafeId, memberKey);
  const el = $query('.sub_tit_profile .nick_area .nick_btn');
  if (isActivityStop) {
    el.insertAdjacentHTML(
      'afterend',
      '<span class="activityStop">활동 정지됨</span>',
    );
  } else {
    el.insertAdjacentHTML(
      'afterend',
      '<span class="activityStop notStop"></span>',
    );
  }
}

onPage('member-profile', checkActivityStop);
