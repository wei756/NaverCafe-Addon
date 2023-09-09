/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

jQuery(function($){
    $(document).ready(() => {
        injectBestArticleUI();
        injectDarkmodeUI();
        checkActivityStop();
    });

    function injectDarkmodeUI() {
        if ($('#front-img').length == 1) {
            const btnDarkmodeHtml = '<button id="NM_darkmode_btn" type="button" role="button" class="btn_theme" aria-pressed="false"> <span class="blind">라이트 모드로 보기</span></button>';
            const btnContentTopHtml = '<a id="NM_scroll_top_btn" href="" class="content_top"><span class="blind">TOP</span></a>';
            const btnDarkmode = $(btnDarkmodeHtml);
            const btnContentTop = $(btnContentTopHtml);
            const body = $('body');
            body.append(btnDarkmode);
            body.append(btnContentTop);
            
            isDarkmode(darkmode => {
                btnDarkmode.attr('aria-pressed', darkmode);
                btnDarkmode.on('click', () => {
                    setDarkmode(!darkmode);
                    location.reload(true);
                });
            });
            btnContentTop.click(e => {
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
    
        $('ul.list_sub_tab').ready(() => {
            // 인기글 링크
            if (location.href.indexOf('BestArticleList.nhn') != -1) {
                var page = $(link_best);
                $('ul.list_sub_tab').append(page);
                page.on('click', () => {
                    location.href = location.href.replace('&best=true', '')
                                                .replace('#', '') + '&best=true';
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
    function loadBestArticle() {
        const main_area = document.getElementById('main-area');

        main_area.querySelector('ul.list_sub_tab > li.on').setAttribute('aria-selected', 'false');
        main_area.querySelector('ul.list_sub_tab > li.on').classList.remove('on');
        main_area.querySelector('ul.list_sub_tab > li.best').classList.add('on');
        main_area.querySelector('ul.list_sub_tab > li.best').setAttribute('aria-selected', 'true');

        $('div.list-style .sort_area *').remove();
        const thumb_show = $('<div class="check_box"><input type="checkbox" id="thumb_show"><label for="thumb_show">썸네일 미리보기</label></div>');
        $('div.list-style .sort_area').append(thumb_show);

        thumb_show.find('#thumb_show').on('change', e => {
            const val = !stateShowBestThumb;
            setShowBestThumb(val, () => {
                setStateShowBestThumb(val);
            });
        });
        main_area.querySelector('table.board-box > tbody').remove();
        
        const params = getURLParams();
        const clubid = params['clubid'];
        getBestArticles(clubid, data => {
            dispBestArticles(data);
            isShowBestThumb(setStateShowBestThumb);

            // 유저 차단 적용
            doBlock();
        });
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
     * @description 인기글 데이터를 불러옵니다.
     * @param {string} cafeid 카페 id
     * @param {function} callback 콜백 함수
     */
    function getBestArticles(cafeid, callback) {
        var url = 'https://apis.naver.com/cafe-web/cafe2/WeeklyPopularArticleList.json?cafeId=' + cafeid;
        $.ajax({
            type: 'POST',
            url: url,
            dataType: 'json',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success: callback,
            error: xhr => {
                alert('인기글을 불러오는 데 실패하였습니다.');
                alert(xhr.responseText);
            }
        })
    }
    
    /** 
     * @description 인기글 목록을 출력합니다.
     * @param {JSON} data 인기글 JSON
     */
    function dispBestArticles(data) {
        const table = document.querySelector('#main-area .article-board');

        const list = data['message']['result']['popularArticleList'];

        // 인기글 표시 영역 height 설정
        parent.document.getElementById('cafe_main').style.height = (list.length * 37 + 250) + 'px';

        // 인기글 목록 삽입
        table.innerHTML += `<ul id="bestArticleList">${geneBestArticles(list)}</ul>`;
    }

    /** 
     * @description 인기글 목록 HTML을 생성합니다.
     * @param {Array} list 인기글 array (message->result->popularArticleList)
     */
    function geneBestArticles(list) {
        var innerHtml = '';
        list.map((itemData, i, arr) => {
            const { 
                cafeId, articleId, subject, representImage, representImageType, commentCount, formattedCommentCount, newArticle, nickname, writerId, aheadOfWriteDate, formattedReadCount, upCount
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

            // 작성자 드롭다운 메뉴
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
                <div class="b_nick"><a href="#" class="nickname" onclick="${nickOnClick}">${nickname}</a></div>
                <div class="b_date">${aheadOfWriteDate}</div>
                <div class="b_view">${formattedReadCount}</div>
                <div class="b_likeit">${upCount}</div>
                ${thumbnail}
            </li>`;
        });
        return innerHtml;
     }

    isDarkmode(darkmode => {
        if (darkmode) {
            document.documentElement.setAttribute('data-dark', 'true');
        }
    })

    /** 
     * @description 다크 모드를 설정합니다.
     * @param {boolean} bool 추가할 데이터
     */
    function setDarkmode(bool) {
        getBlockList(items => {
            items.darkmode = bool;
            chrome.storage.sync.set(items, () => { 
            });
        });
    }
    
    /** 
     * @description 다크 모드 상태를 불러옵니다.
     * @param {function} callback 콜백 함수
     */
    function isDarkmode(callback) {
        getBlockList(items => {
            callback(items.darkmode);
        });
    }

    /**
     * @description 현재 보고 있는 회원이 활동정지 상태인지 확인하고 그 상태를 프로필에 표시합니다.
     */
    function checkActivityStop() {
        if (location.href.indexOf('CafeMemberNetworkView.nhn') !== -1) { // 프로필 페이지
            const params = getURLParams();
            const { clubid, memberid } = params;
            getActivityStop({
                cafeid: clubid, 
                memberid: memberid,
                callback: stopped => {
                    if (stopped) {
                        document.querySelector('.pers_nick_area .p-nick a.m-tcol-c').innerHTML += '<span>(활동 정지됨)</span>';
                    }
                }
            });
        }
    }

});