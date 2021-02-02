/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

jQuery(function($){
    var link = '<li class="info5 likeit"><span class="tit"><span class="_icon">♡</span><strong class="gm-tcol-c"><a class="link_likeit" target="cafe_main">좋아요한 글 보기</a></strong></span></li>';
    
    var link_best = '<li class="best" aria-selected="false"><a href="#" class="link">인기글</a></li>';

    $(document).ready(function() {
        injectLikeItUI();
        injectBestArticleUI();
        injectDarkmodeUI();
        checkActivityStop();
    });

    function injectDarkmodeUI() {
        if ($("#front-img").length == 1) {
            var btnDarkmodeHtml = '<button id="NM_darkmode_btn" type="button" role="button" class="btn_theme" aria-pressed="false"> <span class="blind">라이트 모드로 보기</span> </button>';
            var btnDarkmode = $(btnDarkmodeHtml);
            
            isDarkmode(function (darkmode) {
                btnDarkmode.attr("aria-pressed", darkmode);
                
                $("body").append(btnDarkmode);

                btnDarkmode.on("click", function(event) {
                    setDarkmode(!darkmode);
                    location.reload(true);
                });
            });

            var btnContentTopHtml = '<a id="NM_scroll_top_btn" href="" class="content_top"><span class="blind">TOP</span></a>';
            var btnContentTop = $(btnContentTopHtml);
            $("body").append(btnContentTop);
            btnContentTop.click(function (e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth'});
            })
        }
    }

    /** 
     * @description 좋아요한 글 목록 UI를 삽입합니다.
     */
    function injectLikeItUI() {
        var link = '<a href="#" class="likeit link_sort"">좋아요한 글</a>';
        $('.article-board.article_profile').ready(function() {
            // 좋아요한 글 링크
            var page = $(link);
            $(".article-board.article_profile > .list-style > .sort_area").append(page);
            page.on("click", function() {
                location.href = location.href.replace("&likeit.page=true", "")
                                            .replace("&likeit.timestamp=", "&likeit.dump=")
                                            .replace("&blocking.page=true", "")
                                            .replace("&blocking.type=", "&blocking.dump=")
                                            .replace("#", "") + "&likeit.page=true"; // 좋아요한 글 페이지로 이동
            });

            // 좋아요 페이지 로딩
            var params = getURLParams();
            var isLikeIt = params["likeit.page"];
            var timestamp = params["likeit.timestamp"];
            if (!isEmpty(isLikeIt)) {
                isLikeIt = isLikeIt.replace("#", "");
            }
            if (isLikeIt == "true") { // 좋아요한 글 페이지면

                if (typeof(timestamp) == "undefined") { // 첫 페이지
                    loadLikeIt("");
                } else {
                    loadLikeIt(timestamp);
                }

            }
        });
    }

    /** 
     * @description 인기글 목록 UI를 삽입합니다.
     */
    function injectBestArticleUI() {
        $('ul.list_sub_tab').ready(function() {
            // 인기글 링크
            if (location.href.indexOf("BestArticleList.nhn") != -1) {
                var page = $(link_best);
                $("ul.list_sub_tab").append(page);
                page.on("click", function() {
                    location.href = location.href.replace("&best=true", "")
                                                .replace("#", "") + "&best=true";
                });
            }

            // 인기글 페이지 로딩
            var params = getURLParams();
            var isBest = params["best"];
            if (!isEmpty(isBest)) {
                isBest = isBest.replace("#", "");
            }
            if (isBest == "true") { // 인기글 페이지면
                parent.document.querySelector("#cafe_main").style.height = "7200px";
                loadBestArticle();
            }
        });
    }

    /** 
     * @description 좋아요한 글 목록을 불러옵니다.
     * @param {string} timestamp 타임스탬프
     */
    function loadLikeIt(timestamp) {
        var main_area = $("#main-area");
        var section = main_area.children(".article-board.article_profile");

        var table = '<table><caption><span class="blind">게시글 목록</span></caption><colgroup><col><col style="width:120px"><col style="width:100px"><col style="width:80px"></colgroup><thead><tr><th scope="col">제목</th><th scope="col" class="th_name">작성자</th><th scope="col">작성일</th><th scope="col">조회</th></tr></thead><tbody></tbody></table>';
        
        // 기존 UI 제거
        section.find(".sort_area > .link_sort.on").removeClass("on");
        section.find(".sort_area > .link_sort.likeit").addClass("on");
        main_area.children(".post_btns").remove();
        main_area.children(".prev-next").html("");
        section.children("table").remove();

        section.append($(table));

        var params = getURLParams();
        var clubid = params["search.clubid"];
        var memberid = params["search.query"];
        if (typeof(memberid) == "undefined") {
            memberid = params["search.writerid"];
        }
        memberid = memberid.replace("#", "");
        getLikeItArticles(
                clubid, 
                memberid, 
                "20", 
                timestamp, 
                function(data) {
            drawLikeItArticles(data, clubid, memberid, "20", timestamp);
        });
    }

    /** 
     * @description 인기글 목록을 불러옵니다.
     */
    function loadBestArticle() {
        var main_area = document.querySelector("#main-area");

        //var table = '<table><caption><span class="blind">게시글 목록</span></caption><colgroup><col><col style="width:120px"><col style="width:100px"><col style="width:80px"></colgroup><thead><tr><th scope="col">제목</th><th scope="col" class="th_name">작성자</th><th scope="col">작성일</th><th scope="col">조회</th></tr></thead><tbody></tbody></table>';
        
        main_area.querySelector("ul.list_sub_tab > li.on").setAttribute("aria-selected", "false");
        main_area.querySelector("ul.list_sub_tab > li.on").classList.remove("on");
        main_area.querySelector("ul.list_sub_tab > li.best").classList.add("on");
        main_area.querySelector("ul.list_sub_tab > li.best").setAttribute("aria-selected", "true");

        main_area.querySelector("div.list-style").remove();
        main_area.querySelector("table.board-box > tbody").remove();

        var params = getURLParams();
        var clubid = params["clubid"];
        getBestArticles(clubid, function(data) {
            drawBestArticles(data);

            // 유저 차단 적용
            doBlock();
        });
    }

    /** 
     * @description 좋아요한 글 데이터를 불러옵니다.
     * @param {string} cafeid 카페 id
     * @param {string} memberid 회원 id
     * @param {string} count 출력할 개수
     * @param {string} timestamp 타임스탬프
     * @param {function} callback 콜백 함수
     */
    function getLikeItArticles(cafeid, memberid, count, timestamp, callback) {
        var url = 'https://m.cafe.naver.com/CafeMemberLikeItList.nhn?search.cafeId=' + cafeid + 
                '&search.memberId='+ memberid +
                '&search.count='+ count +
                '&search.likeItTimestamp=' + timestamp;
        $.ajax({
            type: "POST",
            url: url,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success:function(data){
                callback(data);
            },
            error: function (xhr) {
                alert("에러 발생");
                alert(xhr.responseText);
            }
        })
    }

    
    /** 
     * @description 인기글 데이터를 불러옵니다.
     * @param {string} cafeid 카페 id
     * @param {function} callback 콜백 함수
     */
    function getBestArticles(cafeid, callback) {
        var url = 'https://apis.naver.com/cafe-web/cafe2/WeeklyPopularArticleList.json?cafeId=' + cafeid;
        $.ajax({
            type: "POST",
            url: url,
            dataType: "json",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            success:function(data){
                callback(data);
            },
            error: function (xhr) {
                alert("에러 발생");
                alert(xhr.responseText);
            }
        })
    }

    /** 
     * @description 좋아요한 글 목록을 출력합니다.
     * @param {JSON} data 좋아요한 글 JSON
     * @param {string} cafeid 카페 id
     * @param {string} memberid 회원 id
     * @param {string} count 출력할 개수
     * @param {string} timestamp 타임스탬프
     */
    function drawLikeItArticles(data, cafeid, memberid, count, timestamp) {
        var article_html = '<tr><td class="td_article"><div class="board-number"><div class="inner_number">null</div></div><div class="board-list"><div class="inner_list"><a class="title_txt" target="_parent" href="#">null</a><span class="list-i-img"><i class="blind">사진</i></span><span class="list-i-poll"><i class="blind">투표</i></span><span class="list-i-link"><i class="blind">링크</i></span><span class="list-i-upload"><i class="blind">파일</i></span><a href="#" target="_parent" class="cmt">[<em>null</em>]</a><span class="list-i-new"><i class="blind">new</i></span></div></div></td><td class="td_name"><div class="pers_nick_area"><table role="presentation" cellspacing="0"><tbody><tr><td class="p-nick"><a href="#" class="m-tcol-c"><div class="ellipsis m-tcol-c">null</div></a></td></tr></tbody></table></div></td><td class="td_date">null</td><td class="td_view">null</td></tr>';
        var prevnext_html = '<a href="#" class="pgL"><span class="m-tcol-c">처음으로</span></a><a href="#" class="pgR"><span class="m-tcol-c">다음</span></a>';
        var main_area = document.querySelector("#main-area");
        var section = main_area.querySelector(".article-board.article_profile");
        
        //main_area.children(".prev-next").html("");
        main_area.querySelector(".prev-next").innerHTML = prevnext_html;
        if (timestamp == "") { // 첫페이지
            main_area.querySelector(".prev-next > .pgL").remove();
        } else {
            main_area.querySelector(".prev-next > .pgL").addEventListener("click", function() { // 처음으로
                getLikeItArticles(cafeid, memberid, count, "");
            });
        }
        
        var table = section.querySelector("table > tbody");
        table.innerHTML = "<div id='data'></div>";
        var tmpData = table.querySelector("#data");
        tmpData.innerHTML = data;

        var articles, articlelinks, titles, comments, nicks, dates, views;
        articles = tmpData.querySelectorAll("li");
        articlelinks = tmpData.querySelectorAll("._articleListItem");
        titles = tmpData.querySelectorAll("._articleListItem > strong.tit");
        comments = tmpData.querySelectorAll(".link_comment > em.num");
        nicks = tmpData.querySelectorAll("._articleListItem > .user_area > span.nick > span.ellip");
        dates = tmpData.querySelectorAll("._articleListItem > .user_area > span.time");
        views = tmpData.querySelectorAll("._articleListItem > .user_area > span.no");
        var le = articles.length;
        
        main_area.querySelector(".prev-next > .pgR").addEventListener("click", function() { // 다음 페이지
            location.href = location.href.replace("&likeit.timestamp=", "&likeit.dump=")
                                        .replace("#", "") + "&likeit.timestamp=" + articles[le - 1].getAttribute("data-timestamp");
        });

        for(var i = le - 1; i >= 0; i--) {
            table.innerHTML = article_html + table.innerHTML;

            var article_id = articlelinks[i].getAttribute("data-article-id");
            var new_icon = articlelinks[i].querySelectorAll(".icon_new_txt").length;
            var img_icon = articles[i].querySelectorAll(".thumb_area").length;
            var poll_icon = articles[i].querySelectorAll(".icon_poll").length;
            var link_icon = articlelinks[i].querySelectorAll(".icon_link").length;
            var upload_icon = articles[i].querySelectorAll(".icon_file").length;

            table.querySelector(".inner_number").innerText = article_id; // 게시글 id

            table.querySelector(".title_txt").innerHTML = titles[i].innerHTML; // 게시글 제목
            table.querySelector(".title_txt").href = "https://cafe.naver.com/ArticleRead.nhn?clubid=" + cafeid + "&articleid=" + article_id; // 게시글 제목 링크
            if (comments[i].innerText != 0) {
                table.querySelector(".cmt > em").innerText = comments[i].innerText; // 게시글 댓글수
                table.querySelector(".cmt").href = "https://cafe.naver.com/ArticleRead.nhn?clubid=" + cafeid + "&articleid=" + article_id; // 게시글 댓글 링크
            } else { // 댓글이 없으면
                table.querySelector(".cmt").remove();
            }
            if (new_icon == 0) {// new 아이콘이 없으면
                table.querySelector(".list-i-new").remove();
            }
            if (img_icon == 0) {// 이미지가 없으면
                table.querySelector(".list-i-img").remove();
            }
            if (poll_icon == 0) {// 투표가 없으면
                table.querySelector(".list-i-poll").remove();
            }
            if (link_icon == 0) {// 링크가 없으면
                table.querySelector(".list-i-link").remove();
            }
            if (upload_icon == 0) {// 파일이 없으면
                table.querySelector(".list-i-upload").remove();
            }

            table.querySelector(".td_name .p-nick div").innerText = nicks[i].innerText; // 게시글 작성자

            table.querySelector(".td_date").innerText = dates[i].innerText; // 게시글 작성일

            table.querySelector(".td_view").innerText = views[i].innerText; // 게시글 조회
            
        }
        table.querySelector("#data").remove();
    }
    
    /** 
     * @description 인기글 목록을 출력합니다.
     * @param {JSON} data 인기글 JSON
     */
    function drawBestArticles(data) {
        var article_html = '<tr align="center"><td colspan="2"><span class="m-tcol-c list-count"></span></td><td align="left" class="board-list"><a class="title" href="/ArticleRead.nhn?clubid=&articleid=">null</a> <span class="list-i-type"><i class="blind"></i></span> <a href="/ArticleRead.nhn?clubid=&articleid=" class="cmt">[<em>null</em>] </a><span class="list-i-new"><i class="blind">new</i></span> </td><td class="p-nick"><div class="pers_nick_area"><table role="presentation" cellspacing="0"><tbody><tr><td class="p-nick"><a href="#" class="m-tcol-c nickname">null</a></td></tr></tbody></table></div></td><td class="date">null</td><td class="view">null</td><td class="likeit">null</td></tr>';
        var main_area = document.querySelector("#main-area");
        main_area.querySelector("table.board-box").innerHTML += "<tbody></tbody>";
        var table = main_area.querySelector("table.board-box > tbody");

        var list = data['message']['result']['popularArticleList'];

        var le = list.length;
        parent.document.querySelector("#cafe_main").style.height = (37 * le + 250) + "px";
        for(var i = le - 1; i >= 0; i--) {
            table.innerHTML = article_html + table.innerHTML;
            
            table.querySelector(".list-count").innerText = i + 1; // 게시글 순서

            table.querySelector(".title").innerHTML = list[i].subject; // 게시글 제목
            table.querySelector(".title").href = "https://cafe.naver.com/ArticleRead.nhn?clubid=" + list[i].cafeId + "&articleid=" + list[i].articleId; // 게시글 제목 링크
            // 미디어 아이콘
            var mediaType = list[i].representImageType;
            var mediaIcon = table.querySelector(".list-i-type");
            var mediaIconBlind = table.querySelector(".list-i-type > .blind");
            if (mediaType === "I" || mediaType === "G") {
                mediaIcon.classList.add("list-i-img");
                mediaIconBlind.innerText = "사진";
            } else if (mediaType === "M") {
                mediaIcon.classList.add("list-i-movie");
                mediaIconBlind.innerText = "동영상";
            } else {
                mediaIcon.remove();
            }
            if (list[i].commentCount != 0) {
                table.querySelector(".cmt > em").innerText = list[i].formattedCommentCount; // 게시글 댓글수
                table.querySelector(".cmt").href = "https://cafe.naver.com/ArticleRead.nhn?clubid=" + list[i].cafeId + "&articleid=" + list[i].articleId; // 게시글 댓글 링크
            } else { // 댓글이 없으면
                table.querySelector(".cmt").remove();
            }
            if (list[i].newArticle !== true) {
                table.querySelector(".list-i-new").remove();
            }
            table.querySelector(".nickname").innerText = list[i].nickname; // 작성자 닉네임
            table.querySelector(".nickname").setAttribute('onclick', "ui(event, '" + list[i].writerId + "',3,'" + list[i].nickname + "','" + list[i].cafeId + "','me', 'false', 'true', '', 'false', '0'); return false;"); // 작성자 드롭다운 메뉴
            table.querySelector(".date").innerText = list[i].aheadOfWriteDate; // 게시글 작성일
            table.querySelector(".view").innerText = list[i].formattedReadCount; // 게시글 조회수
            table.querySelector(".likeit").innerText = list[i].upCount; // 게시글 좋아요 수
        }
    }

    isDarkmode(function (darkmode) {
        if (darkmode) {
            document.documentElement.setAttribute("data-dark", "true");
        }
    })

    /** 
     * @description 다크 모드를 설정합니다.
     * @param {boolean} bool 추가할 데이터
     */
    function setDarkmode(bool) {
        getBlockList(function(items) {
            items.darkmode = bool;
            chrome.storage.sync.set(items, function() { 
            });
        });
    }
    
    /** 
     * @description 다크 모드 상태를 불러옵니다.
     * @param {function} callback 콜백 함수
     */
    function isDarkmode(callback) {
        getBlockList(function(items) {
            callback(items.darkmode);
        });
    }

    /**
     * 회원이 활동정지 상태인지 확인하고 그 상태를 출력합니다.
     */
    function checkActivityStop() {
        if (location.href.indexOf("CafeMemberNetworkView.nhn") != -1) {
            // 프로필 페이지 로딩
            var params = getURLParams();
            var cafeId = params["clubid"];
            var memberId = params["memberid"];
            if (!isEmpty(memberId)) {
                $.ajax({
                    type: "POST",
                    url: "https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberStatus?cafeId=" + cafeId + "&memberId=" + memberId,
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    crossDomain: true,
                    success:function(data){
                        if (data.message.status == "200" && data.message.result.activityStop) {
                            var stoppedElement = document.createElement("span");
                            stoppedElement.append("(활동 정지됨)");
                            document.querySelector(".pers_nick_area .p-nick a.m-tcol-c").appendChild(stoppedElement);
                        }
                    },
                    error: function (xhr) {
                    }
                })
            }
        }
    }

});