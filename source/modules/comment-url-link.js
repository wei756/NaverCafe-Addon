const cafeRegex =
  /^https?:\/\/(?:(?:m\.)?cafe\.naver\.com\/(?<cafeUrl>[a-zA-Z0-9]+)\/|m\.cafe\.naver\.com\/ca-fe\/web\/cafes\/(?:(?<cafeId>[0-9]+)|(?<mobileCafeUrl>[a-zA-Z0-9]+))\/articles\/)(?<articleId>[0-9]+)/;
const youtubeRegex =
  /^https?:\/\/((www.)?youtube\.com\/watch\?v=|youtu\.be\/|www\.youtube\.com\/v\/)(?<videoId>[A-Za-z0-9_\-]{11})/;
const youtubeShortsRegex =
  /^https?:\/\/(www)?\.youtube\.com\/shorts\/(?<videoId>[A-Za-z0-9_\-]{11})/;
const afreecaStationRegex =
  /^https:\/\/bj\.afreecatv\.com\/(?<streamerId>[a-zA-Z0-9-_]+)/;
const afreecaLiveRegex =
  /^https:\/\/play\.afreecatv\.com\/(?<streamerId>[a-zA-Z0-9-_]+)\/(?<videoId>\d+)/;
const afreecaVodRegex =
  /^https:\/\/vod\.afreecatv\.com\/player\/(?<videoId>\d+)/;

/**
 * @type {PageHandler}
 */
async function replaceCommentUrlStringToLink({ cafeId, articleId, memberKey }) {
  console.log('replaceCommentUrlStringToLink');
  const commentList = await waitUntilLoadedElement(
    '.CommentBox ul.comment_list',
  );

  /** @type {HTMLAnchorElement[]} */
  const links = [...(commentList?.querySelectorAll('.text_comment a') || [])];

  links.forEach(async (link) => {
    const url = link.href;

    const linkElement = document.createElement('span');
    linkElement.classList.add('CommentLinkButton');

    const cafe = parseCafeUrl(url);
    const youtube = url.match(youtubeRegex);
    const youtubeShorts = url.match(youtubeShortsRegex);
    const afreecaStation = url.match(afreecaStationRegex);
    const afreecaLive = url.match(afreecaLiveRegex);
    const afreecaVod = url.match(afreecaVodRegex);
    if (cafe) {
      // 카페 게시글
      const articleInfo = await parseCafeArticleInfo(cafe);
      if (!articleInfo.cafe.name) {
        linkElement.innerText = '존재하지 않는 카페';
      } else if (!articleInfo.article.subject) {
        linkElement.innerText = '존재하지 않는 게시글';
      } else {
        linkElement.innerText = articleInfo.article.subject;

        // 모바일 pc링크로 변환
        if (link.href.includes('//m.cafe.naver.com')) {
          link.href = `https://cafe.naver.com/${articleInfo.cafe.url}/${articleInfo.article.articleId}`;
        }
      }
      if (articleInfo.cafe.name) {
        const icon = document.createElement('img');
        icon.classList.add('linkIcon');
        icon.src = articleInfo.cafe.icon;
        linkElement.prepend(icon);
      }
      link.innerText = '';
      link.appendChild(linkElement);
    } else if (youtube) {
      // 유튜브 영상
      const videoId = youtube.groups.videoId;
      const videoInfo = await getYoutubeVideoInfo(videoId);
      if (!videoInfo) {
        linkElement.innerText = `존재하지 않는 유튜브 링크`;
      }
      linkElement.innerText = videoInfo.title || videoId;

      const icon = document.createElement('img');
      icon.classList.add('linkIcon');
      icon.src =
        'https://www.youtube.com/s/desktop/a258f8cf/img/favicon_32x32.png';
      linkElement.prepend(icon);
      link.innerText = '';
      link.appendChild(linkElement);
    } else if (youtubeShorts) {
      // 유튜브 쇼츠
      const videoId = youtubeShorts.groups.videoId;
      const videoInfo = await getYoutubeVideoInfo(videoId);
      if (!videoInfo) {
        linkElement.innerText = `존재하지 않는 유튜브 링크`;
      }
      linkElement.innerText = videoInfo.title || videoId;

      const icon = ShortsIcon('linkIcon');
      linkElement.insertAdjacentHTML('afterbegin', icon);
      link.innerText = '';
      link.appendChild(linkElement);
    } else if (afreecaStation) {
      // 아프리카 방송국
      const streamerId = afreecaStation.groups.streamerId;

      linkElement.innerText = `방송국 - ${streamerId}`;

      const icon = document.createElement('img');
      icon.classList.add('linkIcon');
      icon.src = 'https://bj.afreecatv.com/favicon.ico';
      linkElement.prepend(icon);
      link.innerText = '';
      link.appendChild(linkElement);
    } else if (afreecaLive) {
      const streamerId = afreecaLive.groups.streamerId;
      const videoId = afreecaLive.groups.videoId;
      const streamInfo = await getAfreecaLiveInfo(streamerId, videoId);
      if (!streamInfo) {
        linkElement.innerText = `존재하지 않는 아프리카TV 생방송 링크`;
      }

      linkElement.innerText = `${streamInfo.title || videoId} | ${
        streamInfo.nickname || streamerId
      } 생방송`;

      const icon = document.createElement('img');
      icon.classList.add('linkIcon');
      icon.src = 'https://bj.afreecatv.com/favicon.ico';
      linkElement.prepend(icon);
      link.innerText = '';
      link.appendChild(linkElement);
    } else if (afreecaVod) {
      const videoId = afreecaVod.groups.videoId;
      const videoInfo = await getAfreecaVodInfo(videoId);
      if (!videoInfo) {
        linkElement.innerText = `존재하지 않는 아프리카TV VOD 링크`;
      }

      linkElement.innerText = videoInfo.name || videoId;

      const icon = document.createElement('img');
      icon.classList.add('linkIcon');
      icon.src = 'https://bj.afreecatv.com/favicon.ico';
      linkElement.prepend(icon);
      link.innerText = '';
      link.appendChild(linkElement);
    }
  });
}

/**
 *
 * @param {{cafeUrl?: string; cafeId?: number; articleId: number}} cafe
 */
async function parseCafeArticleInfo(cafe) {
  const result = {
    cafe: {
      name: null,
      url: '',
      icon: '',
    },
    article: {
      articleId: 0,
      subject: null,
    },
  };

  const cafeInfo = await getCafeGateInfo(cafe.cafeUrl || cafe.cafeId);
  if (cafeInfo.code) {
    return result;
  }
  if (!cafe.cafeId) {
    cafe.cafeId = cafeInfo.cafeInfoView.cafeId;
  }

  result.cafe.name = cafeInfo.mobileCafeName;
  result.cafe.url = cafeInfo.cafeInfoView.cafeUrl;
  result.cafe.icon = cafeInfo.profileImageUrl;

  const siblingResponse = await getArticleSiblings(cafe.cafeId, cafe.articleId);
  if (siblingResponse.errorCode) {
    return result;
  }
  /** @type {SiblingArticleResponse} */
  const sibling = siblingResponse;
  const article = sibling.articles.items.find(
    (article) => article.id === parseInt(cafe.articleId),
  );

  if (!article) {
    return result;
  }
  result.article.articleId = cafe.articleId;
  if (article.head?.head) {
    result.article.subject = `[${article.head.head}] ${article.subject}`;
  } else {
    result.article.subject = article.subject;
  }

  return result;
}

/**
 *
 * @param {string} url
 * @returns {{cafeUrl?: string; cafeId?: number; articleId: number} | null}
 */
function parseCafeUrl(url) {
  const matched = url.match(cafeRegex);

  if (matched) {
    const { cafeUrl, mobileCafeUrl, cafeId, articleId } = matched.groups;
    return { cafeUrl: cafeUrl || mobileCafeUrl, cafeId, articleId };
  }
  return null;
}

onPage('article', replaceCommentUrlStringToLink);
