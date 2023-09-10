/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

jQuery(async function($){
  $(document).ready(() => {
    injectBestArticleUI();
    injectFloatingUI();
    checkActivityStop();
    injectProfileOnArticle();
    hideBlockedMembersOnArticleList();
    //console.log('href', location.href);
  });

  async function injectFloatingUI() {
    if ($('#front-img').length == 1) {
      const btnDarkmodeHtml = '<button id="NM_darkmode_btn" type="button" role="button" class="btn_theme" aria-pressed="false"> <span class="blind">라이트 모드로 보기</span></button>';
      const btnContentTopHtml = '<a id="NM_scroll_top_btn" href="" class="content_top"><span class="blind">TOP</span></a>';
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
      btnContentTop.on('click', e => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      })
    }
  }

  /** 
   * @description 인기글 목록 UI를 삽입합니다.
   */
  function injectBestArticleUI() {
    const link_best = '<li class="best" aria-selected="false"><a href="#" class="link">인기글</a></li>';
      
    $('ul.list_sub_tab').ready(() => { // 베스트게시글 페이지면

      // 인기글 링크 삽입
      if (location.href.indexOf('BestArticleList.nhn') != -1) {
        const popularArticleLink = $(link_best);
        $('ul.list_sub_tab').append(popularArticleLink);
        popularArticleLink.on('click', () => {
          location.href = location.href
            .replace('&best=true', '')
            .replace('#', '')
              + '&best=true';
        });
      }

      // 인기글 페이지 로딩
      const params = getURLParams();
      const isBest = params['best'];
      if (isBest && isBest.replace('#', '') === 'true') { // 인기글 페이지면
        parent.document.querySelector('#cafe_main').style.height = '7200px';
        loadBestArticle();
      }
    });
  }

  let stateShowBestThumb = true;
  /** 
   * @description 인기글 목록을 불러옵니다.
   */
  async function loadBestArticle() {
    const main_area = document.getElementById('main-area');

    main_area.querySelector('ul.list_sub_tab > li.on').setAttribute('aria-selected', 'false');
    main_area.querySelector('ul.list_sub_tab > li.on').classList.remove('on');
    main_area.querySelector('ul.list_sub_tab > li.best').classList.add('on');
    main_area.querySelector('ul.list_sub_tab > li.best').setAttribute('aria-selected', 'true');

    $('div.list-style .sort_area *').remove();
    const thumb_show = $('<div class="check_box"><input type="checkbox" id="thumb_show"><label for="thumb_show">썸네일 미리보기</label></div>');
    $('div.list-style .sort_area').append(thumb_show);

    thumb_show.find('#thumb_show').on('change', async e => {
      await setSyncStorage('showBestThumb', !stateShowBestThumb);
      setStateShowBestThumb(!stateShowBestThumb);
    });
    main_area.querySelector('table.board-box > tbody').remove();

    const params = getURLParams();
    const cafeId = params['clubid'];

    const bestArticles = await getBestArticles(cafeId);
    dispBestArticles(bestArticles);
    setStateShowBestThumb((await getSyncStorage()).showBestThumb);

    //TODO: 네이버 카페 차단 적용
    //doBlock();

  }

  /** 
   * @description 썸네일 표시여부 상태를 설정합니다.
   */
  function setStateShowBestThumb(val) {
    stateShowBestThumb = val;
    $('#thumb_show').prop('checked', val);
    const bestArticleList = $('#bestArticleList');
    bestArticleList.attr('class', val ? 'showThumb' : '');
  }
    
  /** 
   * @description 인기글 목록을 출력합니다.
   * 
   * @param {{message: {result: {popularArticleList: PopularArticleItem[]}}}} data 인기글 JSON
   */
  function dispBestArticles(data) {
    const table = document.querySelector('#main-area .article-board');

    const list = data.message.result.popularArticleList;

    // 인기글 표시 영역 height 설정
    parent.document.getElementById('cafe_main').style.height = (list.length * 37 + 250) + 'px';

    // 인기글 목록 삽입
    table.innerHTML += `<ul id="bestArticleList">${geneBestArticles(list)}</ul>`;
  }

  /** 
   * @description 인기글 목록 HTML을 생성합니다.
   * 
   * @param {PopularArticleItem[]} list 인기글 array (message->result->popularArticleList)
   */
  function geneBestArticles(list) {
    let innerHtml = '';
    list.forEach((itemData, i) => {
      const { 
        cafeId, articleId, subject, representImage, representImageType, commentCount, formattedCommentCount, newArticle, nickname, memberLevelIconId, memberLevel, writerId, aheadOfWriteDate, formattedReadCount, upCount
      } = itemData;

      // 인기글 URL
      const articleUrl = `https://cafe.naver.com/ArticleRead.nhn?clubid=${cafeId}&articleid=${articleId}`;

      // 미디어 아이콘
      const mediaType = {
        I: {className: 'img', label: '사진'},
        G: {className: 'img', label: '사진'},
        M: {className: 'movie', label: '동영상'},
      }
      const currMedia = mediaType[representImageType];
      const mediaIcon = currMedia    ? `<span class="list-i-${currMedia['className']}"><i class="blind">${currMedia['label']}</i></span>` : '';
      // 댓글
      const comment   = commentCount ? `<a href="${articleUrl + '&commentFocus=true'}" class="cmt">[<em>${formattedCommentCount}</em>] </a>` : '';
      // 새 글 아이콘
      const newIcon   = newArticle   ? '<span class="list-i-new"><i class="blind">new</i></span>' : '';

      // TODO: 작성자 드롭다운 메뉴
      const nickOnClick = `ui(event, '${writerId}',3,'${nickname}','${cafeId}','me', 'false', 'true', '', 'false', '0'); return false;`;

      // 썸네일 오버레이
      const thumbnail = representImage ? `
      <div class="best_thumb_area">
        <div class="thumb">
          <img src="${representImage}" width="100px" height="100px" alt="본문이미지" onerror="this.style.display='none';" class="image_thumb">
        </div>
      </div>` : '';

      innerHtml += `
      <li class="bestArticleItem" align="center">
        <div class="b_index">${i + 1}</div>
        <div class="b_title"><span><a class="title" href="${articleUrl}">${subject}</a> ${mediaIcon} ${comment}${newIcon}</span></div>
        <div class="b_nick"><a href="#" class="nickname" onclick="${nickOnClick}">${nickname}<span class="mem-level"><img src="https://cafe.pstatic.net/levelicon/1/${memberLevelIconId}_${memberLevel}.gif" width="11" height="11"></span></a></div>
        <div class="b_date">${aheadOfWriteDate}</div>
        <div class="b_view">${formattedReadCount}</div>
        <div class="b_likeit">${upCount}</div>
        ${thumbnail}
      </li>`;
    });
    return innerHtml;
  }

  /**
   * @description 현재 페이지가 프로필 페이지인지 확인하고 프로필 페이지면 카페id와 멤버키를 반환합니다.
   * 
   * @returns {{cafeId: string, memberKey: string} | null}
   */
  function checkProfilePage(url) {
    const profilePageRegex = /cafe\.naver\.com\/ca-fe\/cafes\/(?<cafeId>\d+)\/members\/(?<memberKey>[0-9a-zA-Z_-]+)/g;
    if (url.match(profilePageRegex)) {
      return profilePageRegex.exec(url).groups;
    } else {
      return null;
    }
  }

  /**
   * @description 현재 보고 있는 회원이 활동정지 상태인지 확인하고 그 상태를 프로필에 표시합니다.
   */
  async function checkActivityStop() {
    while(true) {

      await waitUntilLoadedElement('.sub_tit_profile .nick_area', async el => {

        if ($query('.sub_tit_profile .nick_area .activityStop')) { return; }
  
        // url 추출
        (await waitUntilLoadedElement('button.nick_btn')).click();
        const url = (await waitUntilLoadedElement('#LayerMore1 > ul.layer_list > li:first-child > a')).href;
        (await waitUntilLoadedElement('button.nick_btn')).click();
  
        const isProfilePage = checkProfilePage(url);
        if (isProfilePage) {
          const { cafeId, memberKey } = isProfilePage;
  
          const isActivityStop = await getActivityStop(cafeId, memberKey);
          if (isActivityStop) {
            el.insertAdjacentHTML('beforeend', '<span class="activityStop">활동 정지됨</span>');
          }else {
            el.insertAdjacentHTML('beforeend', '<span class="activityStop notStop"></span>');
          }
        }
      }, -1);

      await wait(50);
    }

  }

  /**
   * @description 현재 페이지가 게시글 페이지인지 확인하고 게시글 페이지면 카페id와 게시글id를 반환합니다.
   * 
   * @returns {{cafeId: string, articleId: string} | null}
   */
  function checkArticlePage(url) {
    const articlePageRegex = /cafe\.naver\.com\/ca-fe\/cafes\/(?<cafeId>\d+)\/articles\/(?<articleId>\d+)/g;
    const articleOldPageRegex = /cafe\.naver\.com\/ArticleRead\.nhn(\&|\?)clubid=(?<cafeId>\d+)&articleid=(?<articleId>\d+)/g;
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
   * @returns {{cafeId: string, memberKey: string} | null}
   */
  function getArticleProfileMemberKey(url) {
    const profilePageRegex = /ca-fe\/cafes\/(?<cafeId>\d+)\/members\/(?<memberKey>[0-9a-zA-Z_-]+)/g;
    if (url.match(profilePageRegex)) {
      return profilePageRegex.exec(url).groups;
    } else {
      return null;
    }
  }

  async function injectProfileOnArticle() {
    const isArticlePage = checkArticlePage(location.href);
    if (isArticlePage) {
      const {
        cafeId, articleId
      } = isArticlePage;

      
      await waitUntilLoadedElement('.ArticleContentBox');
      const articleProfile = await waitUntilLoadedElement('.ArticleWriterProfile');
      const {
        memberKey
      } = getArticleProfileMemberKey(articleProfile.querySelector('a.more_area').href);

      //console.log(cafeId, articleId, memberKey);

      // 멤버 데이터 불러오기
      const memberInfo = await getCafeMemberProfile({cafeId, memberKey});
      //console.log(memberInfo)
      const { introduction } = await getCafeMemberIntroduction(cafeId, memberInfo.memberId);
      memberInfo.introduction = introduction;
      const recentArticleList = (await getCafeMemberArticles(cafeId, memberKey)).articleList;
      
      const isActivityStop = await getActivityStop(cafeId, memberKey);
      memberInfo.isActivityStop = !!isActivityStop;

      articleProfile.innerHTML = '';
      articleProfile.innerHTML = `<div class="SubscribeButton ProfileSwitchButton"><em class="diaplay_profile_text">프로필 표시</em><div class="ToggleSwitch ToggleSwitch--skinGray"><input id="toggle_diaplay_profile" type="checkbox" class="switch_input blind"><label for="toggle_diaplay_profile" class="switch_slider"></label></div></div>`
      articleProfile.append(geneProfileOnArticle(memberInfo, recentArticleList));

      const profileArea = await waitUntilLoadedElement('.ArticleWriterProfile .profileArea');

      const {
        showProfileOnArticle
      } = await getSyncStorage();

      if (showProfileOnArticle) {
        (await waitUntilLoadedElement('.ArticleWriterProfile .SubscribeButton #toggle_diaplay_profile')).checked = true;
      } else {
        profileArea.classList.add('blind');
      }
      
      (await waitUntilLoadedElement('.ArticleWriterProfile .SubscribeButton .switch_slider')).addEventListener('click', async () => {
        const newValue = !(await getSyncStorage()).showProfileOnArticle;
        await setSyncStorage('showProfileOnArticle', newValue);
        if (newValue) {
          profileArea.classList.remove('blind');
        } else {
          profileArea.classList.add('blind');
        }
      })
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

    profileElement.querySelector('img.profileCircle').src = memberInfo.circleProfileImageURL;

    profileElement.querySelector('a.nicknameWrapper').href = `/ca-fe/cafes/${memberInfo.clubId}/members/${memberInfo.memberKey}`;
    profileElement.querySelector('.nickname').innerText = memberInfo.nickName;
    profileElement.querySelector('.className').innerText = memberInfo.memberLevelName;
    profileElement.querySelector('.classIcon').src = memberInfo.levelIconImageURL;
    profileElement.querySelector('.classIcon').alt = memberInfo.memberLevelName;
    
    if (!memberInfo.isActivityStop) {
      profileElement.querySelector('.activityStop').classList.add('notStop');
    }

    profileElement.querySelector('.visitCount').innerText = formatNumberWithCommas(memberInfo.visitCount);
    profileElement.querySelector('.articleCount').innerText = formatNumberWithCommas(memberInfo.articleCount);
    profileElement.querySelector('.subCount').innerText = formatNumberWithCommas(memberInfo.memberSubscriberCount);

    profileElement.querySelector('.description').innerText = memberInfo.introduction;
    const recentArticleListElement = profileElement.querySelector('ul.recentArticleList');
    articleList.forEach(article => {
      const li = document.createElement('li');
      li.className = 'recentArticleItem';
      li.innerHTML = `
      <a href="">
        <div class="horsehead"></div>
        <div class="title"></div>
      </a>
      `;
      li.querySelector('a').href = `https://cafe.naver.com/ArticleRead.nhn?clubid=${article.clubid}&articleid=${article.articleid}`;
      li.querySelector('.horsehead').innerText = article.articleHead ? `[${article.articleHead.head}]` : '';
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
    const articleListPageRegex = /cafe\.naver\.com\/ArticleList\.nhn\?search.clubid=(?<cafeId>\d+)/g;
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

    const articleListElement = await waitUntilLoadedElement('.article-board:not(#upperArticleList) > table > tbody');

    articleListElement?.querySelectorAll(':scope > tr')?.forEach(article => {
      const articleUrl = article.querySelector('td.td_article a.article').href;
      const nickname = article.querySelector('td.p-nick').innerText;
      const profileOnclick = article.querySelector('td.p-nick a').getAttribute('onclick');
      const memberKey = profileOnclick.match(/ui\(event, \'(?<memberKey>[0-9a-zA-Z-_]+)\'/)?.groups?.memberKey;
      
      if (memberKey && blockedMemberList.includes(memberKey)) { // 차단ㄱ?
        article.innerHTML = `<td colspan="5" class="td_article" style="color: #999;">
        차단한 멤버의 게시글입니다.
        <a href="${articleUrl}" class="view_blocked_article">이 글만 보기</a>
        </td>`;
        //article.style.display = 'none';
      }
    });
    
  }

});