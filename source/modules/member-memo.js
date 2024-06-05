/**
 * @param {string} memberKey
 * @returns {Promise<string>}
 */
async function getMemberMemo(memberKey) {
  const memos = (await getSyncStorage()).memberMemos;

  return memos.find((item) => item.memberKey === memberKey)?.memo ?? '';
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
  const memoContent = memo
    ? `메모: <span class="string">${memo}</span>`
    : `메모 없음`;

  const memoEl = document.createElement('span');
  memoEl.className = 'memberMemo';
  memoEl.insertAdjacentHTML(
    'beforeend',
    `<span class="content">${memoContent}</span>`,
  );

  const buttonEl = document.createElement('button');
  buttonEl.className = 'btnEditMemo';
  buttonEl.innerHTML = PencilSquareIcon;
  buttonEl.addEventListener('click', () => {
    const newMemo = prompt('메모 입력', memo);
    if (newMemo === null) {
      return;
    }
    if (newMemo.length > 30) {
      alert('메모는 30자 이내로만 저장할 수 있습니다.');
      return;
    }
    setMemberMemo(memberKey, newMemo);
    const memoContent =
      newMemo.length > 0
        ? `메모: <span class="string">${newMemo}</span>`
        : `메모 없음`;
    memoEl.querySelector('.content').innerHTML = memoContent;
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
