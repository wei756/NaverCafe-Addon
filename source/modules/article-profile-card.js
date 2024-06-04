async function injectProfileCardOnArticle({ cafeId, articleId, memberKey }) {
  const articleProfile = await waitUntilLoadedElement('.ArticleWriterProfile');

  // 멤버 데이터 불러오기
  const memberInfo = await getCafeMemberProfile({ cafeId, memberKey });
  //console.log(memberInfo)
  const { introduction } = await getCafeMemberIntroduction(
    cafeId,
    memberInfo.memberId,
  );
  memberInfo.introduction = introduction;
  const recentArticleList = (await getCafeMemberArticles(cafeId, memberKey))
    .articleList;

  const isActivityStop = await getActivityStop(cafeId, memberKey);
  memberInfo.isActivityStop = !!isActivityStop;

  articleProfile.innerHTML = '';
  articleProfile.innerHTML = `<div class="SubscribeButton ProfileSwitchButton"><em class="diaplay_profile_text">프로필 표시</em><div class="ToggleSwitch ToggleSwitch--skinGray"><input id="toggle_diaplay_profile" type="checkbox" class="switch_input blind"><label for="toggle_diaplay_profile" class="switch_slider"></label></div></div>`;
  articleProfile.append(geneProfileOnArticle(memberInfo, recentArticleList));

  const profileArea = await waitUntilLoadedElement(
    '.ArticleWriterProfile .profileArea',
  );

  const { showProfileOnArticle } = await getSyncStorage();

  if (showProfileOnArticle) {
    (
      await waitUntilLoadedElement(
        '.ArticleWriterProfile .SubscribeButton #toggle_diaplay_profile',
      )
    ).checked = true;
  } else {
    profileArea.classList.add('blind');
  }

  (
    await waitUntilLoadedElement(
      '.ArticleWriterProfile .SubscribeButton .switch_slider',
    )
  ).addEventListener('click', async () => {
    const newValue = !(await getSyncStorage()).showProfileOnArticle;
    await setSyncStorage('showProfileOnArticle', newValue);
    if (newValue) {
      profileArea.classList.remove('blind');
    } else {
      profileArea.classList.add('blind');
    }
  });
}

function geneProfileOnArticle(memberInfo, articleList) {
  const profileElement = document.createElement('div');
  profileElement.className = 'profileArea';
  profileElement.innerHTML = `
  <div class="profilePanel">
    <div class="profileLink">
      <div class="profileCircleWrapper">
        <img src="" alt="프로필사진" class="profileCircle">
      </div>
      <div class="descArea">
        <a class="nicknameWrapper">
          <span class="nickname"></span>
          <div class="class">
            <span class="className"></span>
            <img src="" alt="" class="classIcon">
          </div>
          <span class="activityStop">활동 정지됨</span>
        </a>
        <div class="memberSummary">
          <div class="count visit">
            방문
            <span class="countValue visitCount">0</span>
          </div>
          <div class="count article">
            작성글
            <span class="countValue articleCount">0</span>
          </div>
          <div class="count sub">
            구독멤버
            <span class="countValue subCount">0</span>
          </div>
        </div>
      </div>
    </div>
    <div class="description"></div>
  </div>
  <div class="vLine"></div>
  <div class="recentArticleListWrapper">
    <div class="listHeader">최근 작성 글</div>
    <ul class="recentArticleList">
    </ul>
  </div>`;

  profileElement.querySelector('img.profileCircle').src =
    memberInfo.circleProfileImageURL;

  profileElement.querySelector(
    'a.nicknameWrapper',
  ).href = `/ca-fe/cafes/${memberInfo.clubId}/members/${memberInfo.memberKey}`;
  profileElement.querySelector('.nickname').innerText = memberInfo.nickName;
  profileElement.querySelector('.className').innerText =
    memberInfo.memberLevelName;
  profileElement.querySelector('.classIcon').src = memberInfo.levelIconImageURL;
  profileElement.querySelector('.classIcon').alt = memberInfo.memberLevelName;

  if (!memberInfo.isActivityStop) {
    profileElement.querySelector('.activityStop').classList.add('notStop');
  }

  profileElement.querySelector('.visitCount').innerText =
    formatNumberWithCommas(memberInfo.visitCount);
  profileElement.querySelector('.articleCount').innerText =
    formatNumberWithCommas(memberInfo.articleCount);
  profileElement.querySelector('.subCount').innerText = formatNumberWithCommas(
    memberInfo.memberSubscriberCount,
  );

  profileElement.querySelector('.description').innerText =
    memberInfo.introduction;
  const recentArticleListElement = profileElement.querySelector(
    'ul.recentArticleList',
  );
  articleList.forEach((article) => {
    const li = document.createElement('li');
    li.className = 'recentArticleItem';
    li.innerHTML = `
    <a href="">
      <div class="horsehead"></div>
      <div class="title"></div>
    </a>
    `;
    li.querySelector(
      'a',
    ).href = `https://cafe.naver.com/ArticleRead.nhn?clubid=${article.clubid}&articleid=${article.articleid}`;
    li.querySelector('.horsehead').innerText = article.articleHead
      ? `[${article.articleHead.head}]`
      : '';
    li.querySelector('.title').innerText = article.subject;
    recentArticleListElement.append(li);
  });

  return profileElement;
}

onPage('article', injectProfileCardOnArticle);