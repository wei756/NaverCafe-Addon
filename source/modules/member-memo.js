/**
 * @param {string} memberKey
 * @returns {Promise<string>}
 */
async function getMemberMemo(memberKey) {
  const memos = (await getSyncStorage()).memberMemos;

  return memos.find((item) => item.memberKey === memberKey)?.memo ?? '없음';
}

/**
 * @param {string} memberKey
 * @param {string} memo
 */
async function setMemberMemo(memberKey, memo) {
  const memos = (await getSyncStorage()).memberMemos;

  const oldMemo = memos.find((item) => item.memberKey === memberKey);
  if (oldMemo) {
    oldMemo.memo = memo;
  } else {
    memos.push({ memberKey, memo });
  }
  await setSyncStorage('memberMemos', memos);
}

/**
 * @description 프로필 페이지에 멤버 메모와 편집 UI를 삽입합니다.
 *
 * @type {PageHandler}
 */
async function injectMemberMemoUIOnProfilePage({ cafeId, memberKey }) {
  const el = $query('.sub_tit_profile .nick_area');
  if ($query('.sub_tit_profile .nick_area .memo')) {
    return;
  }

  const memo = await getMemberMemo(memberKey);

  const memoEl = document.createElement('span');
  memoEl.className = 'memo';
  memoEl.insertAdjacentHTML(
    'beforeend',
    `<span class="content"> 메모: <span class="string">${memo}</span></span>`,
  );

  const buttonEl = document.createElement('button');
  buttonEl.className = 'btnEditMemo';
  buttonEl.innerText = '메모 수정';
  buttonEl.addEventListener('click', () => {
    const newMemo = prompt('메모 입력', memo);
    if (newMemo !== null) {
      setMemberMemo(memberKey, newMemo);
      memoEl.querySelector('.content > .string').innerText = newMemo;
    }
  });
  memoEl.append(buttonEl);

  el.insertAdjacentElement('beforeend', memoEl);
}

onPage('member-profile', injectMemberMemoUIOnProfilePage);
