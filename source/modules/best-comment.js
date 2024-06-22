/**
 * @type {PageHandler}
 */
async function injectBestComments({ cafeId, articleId, memberKey }) {
  const commentList = await waitUntilLoadedElement(
    '.CommentBox ul.comment_list',
  );

  /** @type {CommentItem[]} */
  const comments = [];
  for (let i = 1; i <= 3; i++) {
    const chunk = await getComments(cafeId, articleId, i, 100);
    comments.push(...chunk);
    if (chunk.length < 100) {
      break;
    }
  }
  const commentIds = comments.map((comment) => comment.id);
  /** @type {{cafeId: number, articleId: number, commentId: number, count: number}[]} */
  const commentLikes = [];
  while (commentIds.length > 0) {
    const likeItems = await getCommentLikes(
      cafeId,
      articleId,
      commentIds.splice(0, 60),
    );
    commentLikes.push(
      ...likeItems.map((item) => {
        const [cafeId, articleId, commentId] = item.contentsId.split('-');
        return {
          cafeId: parseInt(cafeId),
          articleId: parseInt(articleId),
          commentId: parseInt(commentId),
          count:
            item.reactions.find((reaction) => reaction.reactionType === 'like')
              ?.count || 0,
        };
      }),
    );
  }

  const commentsWithLikes = comments
    .map((comment) => {
      const likes = commentLikes.find((like) => like.commentId === comment.id);
      return { ...comment, likes: likes?.count ?? 0 };
    })
    .filter((comment) => comment.likes >= 5)
    .sort((a, b) => b.likes - a.likes);

  console.log(commentsWithLikes.slice(0, 5));

  const bestComments = geneBestCommentElement(
    cafeId,
    commentsWithLikes.slice(0, 5),
  );

  commentList.before(bestComments);
}

/**
 * @param {number} cafeId
 * @param {CommentItem[]} comments
 */
function geneBestCommentElement(cafeId, comments) {
  const bestCommentElement = document.createElement('div');
  bestCommentElement.classList.add('BestComment');

  const bestCommentList = document.createElement('ul');
  bestCommentList.classList.add('BestComment__list');
  comments.forEach((comment) => {
    const date = new Date(comment.updateDate);
    const yyyy = date.getFullYear();
    const MM = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    const hh = ('0' + date.getHours()).slice(-2);
    const mm = ('0' + date.getMinutes()).slice(-2);
    const dateString = `${yyyy}.${MM}.${dd}. ${hh}:${mm}`;
    const profileUrl = `https://cafe.naver.com/ca-fe/cafes/${cafeId}/members/${comment.writer.memberKey}`;
    const textContent = comment.content; //.replaceAll('\r\n', '<br>');

    const li = document.createElement('li');
    li.classList.add('BestComment__item');
    li.innerHTML = `
      <a class="BestComment__profile" href="${profileUrl}">
        <img src="${comment.writer.image.url}" />
      </a>
      <div class="BestComment__content_wrapper">
        <span class="BestComment__nick">
          <a href="${profileUrl}">
            ${comment.writer.nick}
          </a>
          <i class="BestComment__level" style="background-image: url(&quot;https://ca-fe.pstatic.net/web-section/static/img/sprite_levelicon_9dbde2.svg#${
            comment.memberLevelIconId
          }_${comment.memberLevel}-usage&quot;);"></i>
          <span class="BestComment__best">BEST</span>
        </span>
        <div class="BestComment__content">
          <span class="text_comment"></span>
          <span class="sticker">${
            comment.sticker
              ? `<a href="https://m.gfmarket.naver.com/sticker/detail/code/${
                  comment.sticker.id.split('-')[0]
                }" target="_blank">
              <img src="${
                comment.sticker.url
              }?type=p60_60" height="96" class="sticker" />
              </a>`
              : ''
          }</span>
          <span class="image">${
            comment.image
              ? `
              <img src="${comment.image.url}?type=${comment.image.type}" />`
              : ''
          }</span>
        </div>
        <div class="BestComment__info">
          <span class="comment_info_date">${dateString}</span>
          <span class="BestComment__like">
            ${CommentLikeIcon}${comment.likes}
          </span>
        </div>
      </div>
    `;
    li.querySelector('.text_comment').innerText = textContent;
    bestCommentList.appendChild(li);
  });
  bestCommentElement.appendChild(bestCommentList);
  return bestCommentElement;
}

onPage('article', injectBestComments);
