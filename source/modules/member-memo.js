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
 * @param {string} memberKey
 * @returns {Promise<Element>} 
 */
async function geneMemberMemoUI(memberKey) {
  const memo = await getMemberMemo(memberKey);

  const memoEl = document.createElement('span');
  memoEl.className = 'memberMemo';
  memoEl.insertAdjacentHTML(
    'beforeend',
    `<span class="content"> 메모: <span class="string">${memo}</span></span>`,
  );

  const buttonEl = document.createElement('button');
  buttonEl.className = 'btnEditMemo';
  buttonEl.innerHTML = PencilSquareIcon;
  buttonEl.addEventListener('click', () => {
    const newMemo = prompt('메모 입력', memo);
    if (newMemo !== null) {
      setMemberMemo(memberKey, newMemo);
      memoEl.querySelector('.content > .string').innerText = newMemo;
    }
  });
  memoEl.append(buttonEl);
  return memoEl;
}

/**
 * @description 프로필 페이지 UI
 *
 * @type {PageHandler}
 */
async function injectUIOnProfilePage({ cafeId, memberKey }) {
  const el = $query('.sub_tit_profile .nick_area');
  if ($query('.sub_tit_profile .nick_area .memberMemo')) {
    return;
  }
  const memoEl = await geneMemberMemoUI(memberKey);
  el.insertAdjacentElement('beforeend', memoEl);
}

onPage('member-profile', injectUIOnProfilePage);
