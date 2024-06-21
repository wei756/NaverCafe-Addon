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
  const commentList = await waitUntilLoadedElement(
    '.CommentBox ul.comment_list',
  );

  /** @type {HTMLAnchorElement[]} */
  const links = [...(commentList?.querySelectorAll('.text_comment a') || [])];

  links.forEach(async (link) => {
    const url = link.href;

    const linkElement = document.createElement('span');
    linkElement.classList.add('CommentLinkButton');
    const iconWrapper = document.createElement('span');
    linkElement.appendChild(iconWrapper);
    const label = document.createElement('span');
    linkElement.appendChild(label);
    const line = document.createElement('div');
    line.classList.add('line');
    linkElement.appendChild(line);
    const revealOriginalLinkButton = document.createElement('button');
    revealOriginalLinkButton.innerText = '원본 링크 보기';
    revealOriginalLinkButton.classList.add('revertOriginal');
    revealOriginalLinkButton.addEventListener('click', (e) => {
      e.preventDefault();
      link.innerText = url;
    });
    linkElement.appendChild(revealOriginalLinkButton);

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
        label.innerText = '존재하지 않는 카페';
      } else {
        label.innerText = articleInfo?.article?.subject ?? cafe.articleId;
        // 모바일 pc링크로 변환
        if (link.href.includes('//m.cafe.naver.com')) {
          link.href = `https://cafe.naver.com/${articleInfo.cafe.url}/${articleInfo.article.articleId}`;
        }
      }
      if (articleInfo.cafe.name) {
        iconWrapper.appendChild(LinkIcon(articleInfo.cafe.icon));
      }
    } else if (youtube) {
      // 유튜브 영상
      const videoId = youtube.groups.videoId;
      const videoInfo = await getYoutubeVideoInfo(videoId);
      label.innerText = videoInfo?.title ?? videoId;
      iconWrapper.appendChild(
        LinkIcon(
          'https://www.youtube.com/s/desktop/a258f8cf/img/favicon_32x32.png',
        ),
      );
    } else if (youtubeShorts) {
      // 유튜브 쇼츠
      const videoId = youtubeShorts.groups.videoId;
      const videoInfo = await getYoutubeVideoInfo(videoId);
      label.innerText = videoInfo?.title ?? videoId;
      iconWrapper.appendChild(LinkShortsIcon());
    } else if (afreecaStation) {
      // 아프리카 방송국
      const streamerId = afreecaStation.groups.streamerId;
      const stationInfo = await getAfreecaStationInfo(streamerId);
      label.innerText = `${stationInfo?.station?.user_nick ?? '알 수 없는'} 방송국`;
      iconWrapper.appendChild(LinkIcon('https://bj.afreecatv.com/favicon.ico'));
    } else if (afreecaLive) {
      // 아프리카 생방송
      const streamerId = afreecaLive.groups.streamerId;
      const videoId = afreecaLive.groups.videoId;
      const streamInfo = await getAfreecaLiveInfo(streamerId, videoId);
      const stationInfo = await getAfreecaStationInfo(streamerId);
      if (!streamInfo) {
        label.innerText = `존재하지 않는 아프리카TV 생방송 링크`;
      }
      label.innerText = `${streamInfo.title || videoId} | ${
        stationInfo?.station?.user_nick || streamerId
      } 생방송`;
      iconWrapper.appendChild(LinkIcon('https://bj.afreecatv.com/favicon.ico'));
    } else if (afreecaVod) {
      // 아프리카 VOD
      const videoId = afreecaVod.groups.videoId;
      const videoInfo = await getAfreecaVodInfo(videoId);
      label.innerText = videoInfo?.name || videoId;
      iconWrapper.appendChild(LinkIcon('https://bj.afreecatv.com/favicon.ico'));
    }

    if (label.innerText) {
      link.childNodes[0].replaceWith(linkElement);
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

  // 카페 정보
  result.cafe.name = cafeInfo.mobileCafeName;
  result.cafe.url = cafeInfo.cafeInfoView.cafeUrl;
  result.cafe.icon = cafeInfo.profileImageUrl;

  // 이웃 게시글 정보를 통해 현재 게시글 정보를 가져옴
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

  // 게시글 제목
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
