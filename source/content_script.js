/**
 * @author Wei756 <wei756fg@gmail.com>
 * @license MIT
 */

jQuery(async function ($) {
  $(document).ready(() => {
    injectFloatingUI();
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
