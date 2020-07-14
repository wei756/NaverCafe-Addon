/** 
 * @author Wei756 <kjhoon1122@naver.com> 
 * @license MIT
 */

jQuery(function($){
    var link = '<li class="info5 likeit"><span class="tit"><span class="_icon">♡</span><strong class="gm-tcol-c"><a class="link_likeit" target="cafe_main">좋아요한 글 보기</a></strong></span></li>';
    
    var link_best = '<li class="best" aria-selected="false"><a href="#" class="link">인기글</a></li>';

    $(document).ready(function() {
        injectLikeItUI();
        injectBeatArticleUI();
        injectBlockListUI();
        injectDarkmodeUI();
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

            var btnContentTopHtml = '<a id="NM_scroll_top_btn" href="#cafe-body-skin" class="content_top"><span class="blind">TOP</span></a>';
            var btnContentTop = $(btnContentTopHtml);
            $("body").append(btnContentTop);
        }
    }

    /** 
     * @description 차단 목록 UI를 삽입합니다.
     */
    function injectBlockListUI() {
        var link = '<span class="line_block link_del">&nbsp;&nbsp;|&nbsp;&nbsp;</span><a href="#" class="link_sort link_del link_block_keyword">키워드 차단 목록</a><span class="line_block link_del">&nbsp;&nbsp;|&nbsp;</span><a href="#" class="link_sort link_del link_block_nid">회원 차단 목록</a>';
        $('.article-board.article_profile').ready( function() {
            // 차단 목록 링크
            var page = $(link);
            var sort_area = $(".article-board.article_profile > .list-style > .sort_area");
            if (document.querySelectorAll(".article-board.article_profile > .list-style > .sort_area .link_del").length > 0) {
                sort_area.append(page);
            }
            sort_area.children(".line_block").css("color", "#e5e5e5");
            sort_area.children(".link_block_keyword").on("click", function() {
                location.href = location.href.replace("&blocking.page=true", "")
                                            .replace("&blocking.type=", "&blocking.dump=")
                                            .replace("#", "") + "&blocking.type=keyword&blocking.page=true"; // 키워드 차단 목록 페이지로 이동
            });
            sort_area.children(".link_block_nid").on("click", function() {
                location.href = location.href.replace("&blocking.page=true", "")
                                            .replace("&blocking.type=", "&blocking.dump=")
                                            .replace("#", "") + "&blocking.type=nid&blocking.page=true"; // 회원 차단 목록 페이지로 이동
            });

            // 차단 목록 페이지 로딩
            var params = getParams();
            var isBlocking = params["blocking.page"];
            var pageType = params["blocking.type"];
            isBlocking = isBlocking.replace("#", "");
            if (isBlocking == "true") { // 차단 목록 페이지면
                if (pageType == "nid") { // 회원 id
                    loadBlocking("nid");
                } else if (pageType == "keyword") { // 키워드
                    loadBlocking("keyword");
                }

            }
        });
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
                                            .replace("#", "") + "&likeit.page=true"; // 좋아요한 글 페이지로 이동
            });

            // 좋아요 페이지 로딩
            var params = getParams();
            var isLikeIt = params["likeit.page"];
            var timestamp = params["likeit.timestamp"];
            isLikeIt = isLikeIt.replace("#", "");
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
    function injectBeatArticleUI() {
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
            var params = getParams();
            var isBest = params["best"];
            isBest = isBest.replace("#", "");
            if (isBest == "true") { // 인기글 페이지면
                parent.document.querySelector("#cafe_main").style.height = "7200px";
                loadBestArticle();
            }
        });
    }

    /** 
     * @description 차단 목록을 불러옵니다.
     * @param {string} type 종류
     */
    function loadBlocking(type) {
        var main_area = $("#main-area");
        var section = main_area.children(".article-board.article_profile");

        var table = '<table><caption><span class="blind">차단 목록</span></caption><colgroup><col><col style="width:120px"><col style="width:100px"><col style="width:80px"></colgroup><thead><tr><th scope="col" class="type"></th><th scope="col"></th><th scope="col">차단일</th><th scope="col"></th></tr></thead><tbody></tbody></table>';
        
        // 기존 UI 제거
        section.find(".sort_area > .link_sort.on").removeClass("on");
        section.find(".sort_area > .link_block_" + type).addClass("on");
        main_area.children(".post_btns").remove();
        main_area.children(".prev-next").html("");
        section.children("table").remove();

        section.append($(table));
        section.find(".type").text(type == "nid" ? "회원 id" : "키워드");

        getBlockList(function(data) {
            drawBlockList(data, type);
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

        var params = getParams();
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

        var params = getParams();
        var clubid = params["clubid"];
        getBestArticles(clubid, function(data) {
            drawBestArticles(data);
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
     * @description 차단 목록을 출력합니다.
     * @param {JSON} data 차단 목록 JSON
     * @param {string} type 종류
     */
    function drawBlockList(data, type) {
        var main_area = document.querySelector("#main-area");
        var section = main_area.querySelector(".article-board.article_profile");
        
        
        var table = section.querySelector("table > tbody");
        table.innerHTML = "";

        var list = data["" + type];
        var le = list.length;

        for(var i = 0; i < le; i++) {
            var item = document.createElement("tr");

            // title
            var tdTitle = document.createElement("td");
            tdTitle.className = "td_article";
            var divNum = document.createElement("div");
            divNum.className = "board-number";
            var divInnerNum = document.createElement("div");
            divInnerNum.className = "inner_number";
            var divList = document.createElement("div");
            divList.className = "board-list";
            var divInnerList = document.createElement("div");
            divInnerList.className = "inner_list";
            var aList = document.createElement("a");
            aList.className = "title_txt";
            aList.setAttribute("target", "_parent");
            aList.href = "#";

            // name
            var tdName = document.createElement("td");
            tdName.className = "td_name";

            // date
            var tdDate = document.createElement("td");
            tdDate.className = "td_date";

            // view
            var tdView = document.createElement("td");
            tdView.className = "td_view";


            divInnerList.appendChild(aList);

            divNum.appendChild(divInnerNum);
            divList.appendChild(divInnerList);

            tdTitle.appendChild(divNum);
            tdTitle.appendChild(divList);

            item.appendChild(tdTitle);
            item.appendChild(tdName);
            item.appendChild(tdDate);
            item.appendChild(tdView);

            table.appendChild(item);

            divInnerNum.append(i + 1); // 순서

            aList.append(list[i]); // 회원 id

            tdDate.append(""); // 차단일

            var btnRemove = document.createElement("a");
            btnRemove.className = "remove";
            btnRemove.append("차단 해제");
            btnRemove.href = "#";

            tdView.appendChild(btnRemove); // 차단 해제
            btnRemove.addEventListener("click", function(event) {
                var targetElement = (event.target || event.srcElement).parentElement;
                var _id = targetElement.parentElement.querySelector(".title_txt").innerText;
                if(confirm(_id + " 님을 차단 해제하시겠습니까?")) {
                    removeBlockItem(type, _id);
                    location.reload(true);
                }
            });
            
        }
        table.querySelector("#data").remove();
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
        var article_html = '<tr align="center"><td colspan="2"><span class="m-tcol-c list-count"></span></td><td align="left" class="board-list"><a class="title" href="/ArticleRead.nhn?clubid=&articleid=">null</a><a href="/ArticleRead.nhn?clubid=&articleid=" class="cmt">[<em>null</em>]</a></td><td class="p-nick"><div class="pers_nick_area"><table role="presentation" cellspacing="0"><tbody><tr><td class="p-nick"><a href="#" class="m-tcol-c nickname">null</a></td></tr></tbody></table></div></td><td class="date">null</td><td class="view">null</td><td class="likeit">null</td></tr>';
        var main_area = document.querySelector("#main-area");
        main_area.querySelector("table.board-box").innerHTML += "<tbody></tbody>";
        var table = main_area.querySelector("table.board-box > tbody");

        var list = data['message']['result']['popularArticleList'];

        var le = list.length;
        for(var i = le - 1; i >= 0; i--) {
            table.innerHTML = article_html + table.innerHTML;
            
            table.querySelector(".list-count").innerText = i + 1; // 게시글 순서

            table.querySelector(".title").innerHTML = list[i].subject; // 게시글 제목
            table.querySelector(".title").href = "https://cafe.naver.com/ArticleRead.nhn?clubid=" + list[i].cafeId + "&articleid=" + list[i].articleId; // 게시글 제목 링크
            if (list[i].commentCount != 0) {
                table.querySelector(".cmt > em").innerText = list[i].formattedCommentCount; // 게시글 댓글수
                table.querySelector(".cmt").href = "https://cafe.naver.com/ArticleRead.nhn?clubid=" + list[i].cafeId + "&articleid=" + list[i].articleId; // 게시글 댓글 링크
            } else { // 댓글이 없으면
                table.querySelector(".cmt").remove();
            }
            table.querySelector(".nickname").innerText = list[i].nickname; // 작성자 닉네임
            table.querySelector(".date").innerText = list[i].aheadOfWriteDate; // 게시글 작성일
            table.querySelector(".view").innerText = list[i].formattedReadCount; // 게시글 조회수
            table.querySelector(".likeit").innerText = list[i].upCount; // 게시글 좋아요 수
        }
    }

    /** 
     * @description URL 파라미터를 반환합니다.
     * @return {Array} 파라미터
     */
    function getParams() {
        // 파라미터가 담길 배열
        var param = new Array();
     
        // 현재 페이지의 url
        var url = decodeURIComponent(location.href);
        // url이 encodeURIComponent 로 인코딩 되었을때는 다시 디코딩 해준다.
        url = decodeURIComponent(url);
     
        var params;
        // url에서 '?' 문자 이후의 파라미터 문자열까지 자르기
        params = url.substring( url.indexOf('?')+1, url.length );
        // 파라미터 구분자("&") 로 분리
        params = params.split("&");
     
        // params 배열을 다시 "=" 구분자로 분리하여 param 배열에 key = value 로 담는다.
        var size = params.length;
        var key, value;
        for(var i=0 ; i < size ; i++) {
            key = params[i].split("=")[0];
            value = params[i].split("=")[1];
     
            param[key] = value;
        }
     
        return param;
    }

    /**
     * @description 네이버 아이디
     * @type {string}
     */
    const nid = "nid";
    /**
     * @description 키워드
     * @type {string}
     */
    const keyword = "keyword";

    doBlock(); // 차단 실행

    /** 
     * @description 회원 아이디/키워드를 차단 목록에 추가합니다.
     * @param {string} type 회원 아이디/키워드
     * @param {string} data 추가할 데이터
     */
    function pushBlockItem(type, data) {
        getBlockList(function(items) {
            if (typeof items["" + type] == "undefined" || items["" + type] == null) { // 차단 목록 생성
                items["" + type] = new Array(data);
            } else {
                if (items["" + type].indexOf(data) == -1) { // 중복 검사
                    items["" + type].push(data);
                    alert(type + ": " + data + " 님을 차단하였습니다.");
                } else {
                    alert("이미 차단한 " + (type == nid ? "사용자" : "키워드") + "입니다. (" + data + ")");
                }
            }
            chrome.storage.local.set(items, function() { 
                //alert(data + " pushed!");
            });
        });
    }

    /** 
     * @description 차단 목록을 불러옵니다.
     * @param {function} callback 콜백 함수
     */
    function getBlockList(callback) {
        chrome.storage.local.get(null, function(items) {
            //alert("items: " + JSON.stringify(items));
            callback(items);
        });
    }

    /** 
     * @description 차단 목록에서 회원 아이디/키워드를 제거합니다.
     * @param {string} type 회원 아이디/키워드
     * @param {string} data 제거할 데이터
     */
    function removeBlockItem(type, data) {
        getBlockList(function(items) {
            if (typeof items["" + type] == "undefined" || items["" + type] == null) {
                alert("차단하지 않은 " + (type == nid ? "사용자" : "키워드") + "입니다. (" + data + ")");
            } else {
                if (items["" + type].indexOf(data) != -1) { // 존재하는지 여부 검사
                    items["" + type].splice(items["" + type].indexOf(data), 1);
                    alert(type + ": " + data + " 님을 차단 해제하였습니다.");
                    
                    chrome.storage.local.set(items, function() { 
                        //alert(data + " pushed!");
                    });
                } else {
                    alert("차단하지 않은 " + (type == nid ? "사용자" : "키워드") + "입니다. (" + data + ")");
                }
            }
        });
    }
    
    /** 
     * @description 사용자/키워드 차단을 실행합니다.
     */
    function doBlock() {

        getBlockList(function(dataBlock) {

            // 글 차단
            if (document.querySelectorAll("#main-area").length != 0)
                $("#main-area").ready(function() {
                    $("#main-area .article-board table").ready(function() {
                        var articles = document.querySelectorAll("#main-area > .article-board > table > tbody > tr");
                        var le = articles.length;

                        for(var i = 0; i < le; i++) {
                            var writerId = articles[i].querySelector(".p-nick > a").getAttribute("onclick").match(/'([^'])+'/g)[0].replace("'", "").replace("'", "");
                            //alert(i + ": " + writerId);

                            if (dataBlock.nid.indexOf(writerId) != -1) { // 유저 차단
                                articles[i].innerHTML = "";

                            } else {
                                articles[i].addEventListener("click", function(event) { // 유저 차단 UI 삽입
                                    var targetElement = (event.target || event.srcElement).parentElement;
                                    injectBlockUIArticle(targetElement.querySelector(".p-nick > a").getAttribute("onclick").match(/'([^'])+'/g)[0].replace("'", "").replace("'", "")); 
                                });

                            }

                        }
                    });
                });

            // 댓글 차단
            if (document.querySelectorAll("#app").length != 0)
                $("#app .Article .ArticleContentBox > .CommentBox > ul.comment_list").ready(function() {
                    setTimeout(() => {
                        var comments = document.querySelectorAll("ul.comment_list > li.CommentItem");
                        var le = comments.length;
                        
                        for(var i = 0; i < le; i++) {
                            var writerId = comments[i].querySelector("a.comment_thumb").href.match(/memberid=([a-z0-9_]+)/gi)[0].replace("memberid=", "");
                            //alert(i + ": " + writerId);

                            if (dataBlock.nid.indexOf(writerId) != -1) { // 유저 차단
                                comments[i].querySelector(".comment_area").removeChild(comments[i].querySelector(".comment_area > .comment_thumb"));
                                comments[i].querySelector(".comment_area").removeChild(comments[i].querySelector(".comment_area > .comment_box"));
                                var blockedCmt = document.createElement("div");
                                blockedCmt.className = "comment_box";
                                var blockedP = document.createElement("p");
                                blockedP.className = "comment_deleted";
                                blockedP.append("차단된 회원의 댓글입니다.");
                                blockedCmt.appendChild(blockedP);
                                comments[i].querySelector(".comment_area").appendChild(blockedCmt);

                            } else {
                                comments[i].addEventListener("click", function(event) { // 유저 차단 UI 삽입
                                    var targetElement = (event.target || event.srcElement).parentElement;
                                    injectBlockUIComment(targetElement.parentElement, 
                                        targetElement.parentElement.parentElement.parentElement.querySelector("a.comment_thumb").href.match(/memberid=([a-z0-9_]+)/gi)[0].replace("memberid=", "")); 
                                });

                            }

                        }
                    }, 1000);
                });

        });

    }

    /** 
     * @description 글 목록에 차단하기 UI를 삽입합니다.
     * @param {string} _id 차단 대상 id
     */
    function injectBlockUIArticle(_id) {
        document.querySelector(".perid-layer").addEventListener("DOMSubtreeModified", function() {
            if (document.querySelector(".perid-layer > ul").innerHTML.indexOf("blocking") == -1) {
                var btnBlock = document.createElement("li");
                var aBlock = document.createElement("a");
                aBlock.className = "blocking";
                aBlock.href = "#";
                var spanBlock = document.createElement("span");
                spanBlock.append("차단하기");
                aBlock.appendChild(spanBlock);
                btnBlock.appendChild(aBlock);
                document.querySelector(".perid-layer > ul").appendChild(btnBlock);

                document.querySelector(".perid-layer > ul .blocking").addEventListener("click", function(event) {
                    if(confirm("정말로 " + _id + " 님을 차단하시겠습니까?")) {
                        pushBlockItem(nid, _id);
                        location.reload(true);
                    }
                });
            }
        });

    }

    /** 
     * @description 댓글 목록에 차단하기 UI를 삽입합니다.
     * @param {string} element 삽입할 요소
     * @param {string} _id 차단 대상 id
     */
    function injectBlockUIComment(element, _id) {
        if (element.querySelector(".LayerMore").innerHTML.indexOf("blocking") == -1) {
            var btnBlock = document.createElement("li");
            btnBlock.className = "layer_item";
            var aBlock = document.createElement("a");
            aBlock.className = "layer_button blocking";
            aBlock.href = "#";
            aBlock.setAttribute("role", "button");
            aBlock.append("차단");
            btnBlock.appendChild(aBlock);
            element.querySelector(".LayerMore").appendChild(btnBlock);

            element.querySelector(".LayerMore .blocking").addEventListener("click", function(event) {
                if(confirm("정말로 " + _id + " 님을 차단하시겠습니까?")) {
                    pushBlockItem(nid, _id);
                    location.reload(true);
                }
            });
        }
        element.addEventListener("DOMSubtreeModified", function() {
            if (element.querySelector(".LayerMore").innerHTML.indexOf("blocking") == -1) {
                var btnBlock = document.createElement("li");
                btnBlock.className = "layer_item";
                var aBlock = document.createElement("a");
                aBlock.className = "layer_button blocking";
                aBlock.href = "#";
                aBlock.setAttribute("role", "button");
                aBlock.append("차단");
                btnBlock.appendChild(aBlock);
                element.querySelector(".LayerMore").appendChild(btnBlock);
    
                element.querySelector(".LayerMore .blocking").addEventListener("click", function(event) {
                    if(confirm("정말로 " + _id + " 님을 차단하시겠습니까?")) {
                        pushBlockItem(nid, _id);
                        location.reload(true);
                    }
                });
            }
        });

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
            chrome.storage.local.set(items, function() { 
                //alert(bool + " pushed!");
            });
        });
    }
    
    /** 
     * @description 차단 목록을 불러옵니다.
     * @param {function} callback 콜백 함수
     */
    function isDarkmode(callback) {
        chrome.storage.local.get(null, function(items) {
            //alert("items: " + JSON.stringify(items));
            callback(items.darkmode);
        });
    }

});