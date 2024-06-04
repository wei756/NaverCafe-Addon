/**
 * @author Wei756 <wei756fg@gmail.com>
 * @license MIT
 */

jQuery(async function ($) {
  $(document).ready(() => {
    injectFloatingUI();
    injectProfileOnArticle();
    hideBlockedMembersOnArticleList();
    
    performEvents();
  });

  async function injectFloatingUI() {
    if ($('#front-img').length == 1) {
      const btnDarkmodeHtml =
        '<button id="NM_darkmode_btn" type="button" role="button" class="btn_theme" aria-pressed="false"> <span class="blind">라이트 모드로 보기</span></button>';
      const btnContentTopHtml =
        '<a id="NM_scroll_top_btn" href="" class="content_top"><span class="blind">TOP</span></a>';
      const btnDarkmode = $(btnDarkmodeHtml);
      const btnContentTop = $(btnContentTopHtml);
      const body = $('body');
      body.append(btnDarkmode);
      body.append(btnContentTop);

      // 다크모드 체크후 버튼 삽입
      const isDarkmode = (await getSyncStorage()).darkmode;
      btnDarkmode.attr('aria-pressed', isDarkmode);
      btnDarkmode.on('click', async () => {
        await setSyncStorage('darkmode', !isDarkmode);
        location.reload(true);
      });

      // 페이지 상단으로 스크롤 버튼 삽입
      btnContentTop.on('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      });
    }
  }

  /**
   * @description 현재 페이지가 게시글 페이지인지 확인하고 게시글 페이지면 카페id와 게시글id를 반환합니다.
   *
   * @returns {{cafeId: string, articleId: string} | null}
   */
  function checkArticlePage(url) {
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
   * @description
   *
   * @returns {{cafeId: string | null, memberKey: string | null}}
   */
  function getArticleProfileMemberKey(url) {
    const profilePageRegex =
      /ca-fe\/cafes\/(?<cafeId>\d+)\/members\/(?<memberKey>[0-9a-zA-Z_-]+)/g;
    if (url?.match(profilePageRegex)) {
      return profilePageRegex.exec(url).groups;
    } else {
      return { cafeId: null, memberKey: null };
    }
  }

  async function injectProfileOnArticle() {
    const isArticlePage = checkArticlePage(location.href);
    if (isArticlePage) {
      const { cafeId, articleId } = isArticlePage;

      await waitUntilLoadedElement('.ArticleContentBox');
      const articleProfile = await waitUntilLoadedElement(
        '.ArticleWriterProfile',
      );
      await waitUntilLoadedElement('.ArticleWriterProfile a.more_area');
      const { memberKey } = getArticleProfileMemberKey(
        articleProfile?.querySelector('a.more_area')?.href,
      );

      if (!memberKey) {
        return;
      }

      //console.log(cafeId, articleId, memberKey);

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
      articleProfile.append(
        geneProfileOnArticle(memberInfo, recentArticleList),
      );

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
    profileElement.querySelector('.classIcon').src =
      memberInfo.levelIconImageURL;
    profileElement.querySelector('.classIcon').alt = memberInfo.memberLevelName;

    if (!memberInfo.isActivityStop) {
      profileElement.querySelector('.activityStop').classList.add('notStop');
    }

    profileElement.querySelector('.visitCount').innerText =
      formatNumberWithCommas(memberInfo.visitCount);
    profileElement.querySelector('.articleCount').innerText =
      formatNumberWithCommas(memberInfo.articleCount);
    profileElement.querySelector('.subCount').innerText =
      formatNumberWithCommas(memberInfo.memberSubscriberCount);

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

  /**
   * @description 현재 페이지가 글목록 페이지인지 확인합니다.
   *
   * @param {string} url
   * @returns {{cafeId: string} | null}
   */
  function checkArticleListPage(url) {
    const articleListPageRegex =
      /cafe\.naver\.com\/ArticleList\.nhn\?search.clubid=(?<cafeId>\d+)/g;
    if (url.match(articleListPageRegex)) {
      return articleListPageRegex.exec(url).groups;
    } else {
      return null;
    }
  }

  /**
   * @description 글목록에서 차단한 멤버를 숨깁니다.
   */
  async function hideBlockedMembersOnArticleList() {
    if (!checkArticleListPage(location.href)) {
      return;
    }

    const blockedMemberList = await getBlockedMembers(27842958);

    const articleListElement = await waitUntilLoadedElement(
      '.article-board:not(#upperArticleList) > table > tbody',
    );

    articleListElement?.querySelectorAll(':scope > tr')?.forEach((article) => {
      const articleUrl = article.querySelector('td.td_article a.article').href;
      const nickname = article.querySelector('td.p-nick').innerText;
      const profileOnclick = article
        .querySelector('td.p-nick a')
        .getAttribute('onclick');
      const memberKey = profileOnclick.match(
        /ui\(event, \'(?<memberKey>[0-9a-zA-Z-_]+)\'/,
      )?.groups?.memberKey;

      if (memberKey && blockedMemberList.includes(memberKey)) {
        // 차단ㄱ?
        article.innerHTML = `<td colspan="5" class="td_article" style="color: #999;">
        차단한 멤버의 게시글입니다.
        <a href="${articleUrl}" class="view_blocked_article">이 글만 보기</a>
        </td>`;
        //article.style.display = 'none';
      }
    });
  }
});
