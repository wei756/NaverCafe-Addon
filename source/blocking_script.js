/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

var doBlock;

jQuery(function($){
    
    $(document).ready(function() {
        injectBlockListUI();
    });

    /** 
     * @description 차단 목록 UI를 삽입합니다.
     */
    function injectBlockListUI() {
        var link = '<span class="line_block link_del">&nbsp;&nbsp;|&nbsp;&nbsp;</span><a href="#" class="link_sort link_del link_block_keyword">키워드 차단 목록</a><span class="line_block link_del">&nbsp;&nbsp;|&nbsp;</span><a href="#" class="link_sort link_del link_block_nid">회원 차단 목록</a>';
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
                                            .replace("&likeit.page=true", "")
                                            .replace("&likeit.timestamp=", "&likeit.dump=")
                                            .replace("#", "") + "&blocking.type=keyword&blocking.page=true"; // 키워드 차단 목록 페이지로 이동
            });
            sort_area.children(".link_block_nid").on("click", function() {
                location.href = location.href.replace("&blocking.page=true", "")
                                            .replace("&blocking.type=", "&blocking.dump=")
                                            .replace("&likeit.page=true", "")
                                            .replace("&likeit.timestamp=", "&likeit.dump=")
                                            .replace("#", "") + "&blocking.type=nid&blocking.page=true"; // 회원 차단 목록 페이지로 이동
            });

            // 차단 목록 페이지 로딩
            var params = getURLParams();
            var isBlocking = params["blocking.page"];
            var pageType = params["blocking.type"];
            var cafeid = params['clubid'];
            if (!isEmpty(isBlocking)) {
                isBlocking = isBlocking.replace("#", "");
            }
            if (isBlocking == "true") { // 차단 목록 페이지면
                if (pageType == "nid") { // 회원 id
                    loadBlocking(nid, cafeid);
                } else if (pageType == "keyword") { // 키워드
                    loadBlocking(keyword, cafeid);
                }

            }
        });

        //프로필 페이지
        if (location.href.indexOf("CafeMemberNetworkView.nhn") != -1) {
            var params = getURLParams();
            var memberId = params["memberid"];
            document.querySelector(".pers_nick_area .p-nick a.m-tcol-c").addEventListener("click", function(event) { // 유저 차단 UI 삽입
                var targetElement = (event.target || event.srcElement);
                if (!isEmpty(targetElement)) {
                    var targetElement = targetElement.parentElement.parentElement;
                    if (!isEmpty(targetElement.querySelector(".p-nick > a"))) {
                        var _cafeid = targetElement.querySelector(".p-nick > a").getAttribute("onclick").match(/'([^'])+'/g)[2].replace("'", "").replace("'", "");
                        var _nickname = targetElement.querySelector(".p-nick > a").getAttribute("onclick").match(/'([^'])+'/g)[1].replace("'", "").replace("'", "");
                        var _id = targetElement.querySelector(".p-nick > a").getAttribute("onclick").match(/'([^'])+'/g)[0].replace("'", "").replace("'", "");
                        injectBlockUIArticle(_cafeid, _nickname, _id); 
                    }
                }
            });
        }
    }

    /** 
     * @description 차단 목록을 불러옵니다.
     * @param {string} type 종류
     */
    function loadBlocking(type, cafeid) {
        var main_area = $("#main-area");
        var section = main_area.children(".article-board.article_profile");

        var table = '<table><caption><span class="blind">차단 목록</span></caption><colgroup><col><col style="width:120px"><col style="width:100px"><col style="width:80px"></colgroup><thead><tr><th scope="col" class="type"></th><th scope="col"></th><th scope="col" class="date"></th><th scope="col"></th></tr></thead><tbody></tbody></table>';
        
        // 기존 UI 제거
        section.find(".sort_area > .link_sort.on").removeClass("on");
        section.find(".sort_area > .link_block_" + type).addClass("on");
        main_area.children(".post_btns").remove();
        main_area.children(".prev-next").html("");
        section.children("table").remove();

        section.append($(table));
        section.find(".type").text(type == "nid" ? "차단 회원" : "차단 키워드");
        section.find(".date").text("차단일");

        getBlockList(function(data) {
            drawBlockList(data, type, cafeid);
        });
    }

    /** 
     * @description 차단 목록을 출력합니다.
     * @param {JSON} data 차단 목록 JSON
     * @param {string} type 종류
     */
    function drawBlockList(data, type, cafeid) {
        var table = $("#main-area .article-board.article_profile table > tbody");
        table.html('');

        var list = data[type];
        var le = list.length;

        for(var i = 0; i < le; i++) {
            if (list[i]['cafeid'] !== '-' && cafeid != list[i]['cafeid']) { // 타 카페 차단
                continue;
            }
            var item = $('<tr><td class="td_article"><div class="board-number"><div class="inner_number"></div></div><div class="board-list"><div class="inner_list"><a href="#" class="title_txt" target="_parent"></a></div></div></td><td class="td_name"></td><td class="td_date"></td><td class="td_view"></td></tr>');

            item.attr('data-cafeid', list[i]['cafeid']); // 카페 id

            if (type === nid) {
                item.attr('data-id', list[i]['id']); // 회원 id
                item.attr('data-nickname', list[i]['nickname']); // 회원 닉네임
            } else {
                item.attr('data-keyword', list[i]['keyword']); // 키워드
            }

            item.find('.inner_number').text(list[i]['cafeid']); // 카페 id

            var aList = item.find('a.title_txt');
            var tdDate = item.find('td.td_date');
            var tdView = item.find('td.td_view');

            if (type === nid) {
                aList.text(list[i]['nickname'] + '(' + list[i]['id'] +')'); // 회원 id
                aList.attr('onclick', "ui(event, '" + list[i]['id'] + "',3,'" + list[i]['nickname'] + "','" + list[i]['cafeid'] + "','me', 'false', 'true', '', 'false', '0'); return false;"); // 드롭다운 메뉴
            }
            else {
                aList.append(list[i]['keyword']); // 키워드
            }

            var now = Date.now();
            var timestamp = new Date(list[i]['timestamp']);
            if (Math.floor(now / (1000 * 60 * 60 * 24)) === Math.floor(timestamp / (1000 * 60 * 60 * 24))) { // 오늘이면
                tdDate.text(timestamp.toLocaleTimeString('it-IT')); // 차단시각
            } else {
                tdDate.text(timestamp.toLocaleDateString('ko-KR')); // 차단날짜
            }

            var btnRemove = $('<a href="#" class="remove">차단 해제</a>');

            tdView.append(btnRemove); // 차단 해제
            btnRemove.on("click", function(event) {
                var targetElement = (event.target || event.srcElement).parentElement.parentElement;

                var cafeid = targetElement.getAttribute('data-cafeid');
                var id = targetElement.getAttribute('data-id');
                var nickname = targetElement.getAttribute('data-nickname');
                var _keyword = targetElement.getAttribute('data-keyword');

                var key = '', value;
                if (type == keyword) {
                    key = 'keyword';
                    value = _keyword;
                } else {
                    if (targetElement.hasAttribute('data-nickname') && nickname !== '-') {
                        key = 'nickname';
                        value = nickname;
                    }
                    else {
                        key = 'id';
                        value = id;
                    }
                }
                var msgStr = " 님을 차단 해제하시겠습니까?";
                if (type == keyword) {
                    var iga = "을";
                    var lastChar = value.charCodeAt(value.length - 1);
                    if (lastChar >= 44032 && lastChar <= 55215 && (lastChar - 44032) % 28 == 0) {
                        iga = "를";
                    }
                    msgStr = iga + " 차단 해제하시겠습니까?";
                }
                if(confirm(value + msgStr)) {
                    removeBlockItem(type, cafeid, key, value);
                    location.reload(true);
                }
            });
            
            table.append(item);
        }
    }
    
    /** 
     * @description 사용자/키워드 차단을 실행합니다.
     */
    doBlock = function () {

        getBlockList(function(dataBlock) {

            // 글 차단
            if (document.querySelectorAll("#main-area").length != 0)
                $("#main-area").ready(function() {
                    $("#main-area .article-board table").ready(function() {
                        var articles = document.querySelectorAll("#main-area > .article-board > table > tbody > tr");
                        var le = articles.length;

                        for(var i = 0; i < le; i++) {
                            var writer = articles[i].querySelector(".p-nick > a");
                            if (!isEmpty(writer)) {
                                var cafeid = writer.getAttribute("onclick").match(/'([^'])+'/g)[2].replace("'", "").replace("'", "");
                                var nickname = writer.getAttribute("onclick").match(/'([^'])+'/g)[1].replace("'", "").replace("'", "");
                                var writerId = writer.getAttribute("onclick").match(/'([^'])+'/g)[0].replace("'", "").replace("'", "");

                                // 유저 차단
                                if (indexBlockItem(dataBlock[nid], cafeid, 'nickname', nickname) != -1 || indexBlockItem(dataBlock[nid], cafeid, 'id', writerId) != -1) { 
                                    articles[i].innerHTML = "";
                                } else {
                                    articles[i].addEventListener("click", function(event) { // 유저 차단 UI 삽입
                                        var targetElement = (event.target || event.srcElement);
                                        if (!isEmpty(targetElement)) {
                                            var targetElement = targetElement.parentElement;
                                            if (!isEmpty(targetElement.querySelector(".p-nick > a"))) {
                                                var _cafeid = targetElement.querySelector(".p-nick > a").getAttribute("onclick").match(/'([^'])+'/g)[2].replace("'", "").replace("'", "");
                                                var _nickname = targetElement.querySelector(".p-nick > a").getAttribute("onclick").match(/'([^'])+'/g)[1].replace("'", "").replace("'", "");
                                                var _id = targetElement.querySelector(".p-nick > a").getAttribute("onclick").match(/'([^'])+'/g)[0].replace("'", "").replace("'", "");
                                                injectBlockUIArticle(_cafeid, _nickname, _id); 
                                            }
                                        }
                                    });

                                }
                            }

                            var title = articles[i].querySelector(".board-list .inner_list .article");
                            if (!isEmpty(title)) {
                                title = title.innerText;

                                // 키워드 차단
                                if (!isEmpty(dataBlock.keyword)) { 
                                    dataBlock.keyword.forEach(element => {
                                        if (title.indexOf(element['keyword']) != -1) {
                                            articles[i].innerHTML = "";
                                        }
                                    });
                                }
                            }

                        }
                    });
                });

            // 댓글 차단
            $("#app .Article .ArticleContentBox .CommentBox ul.comment_list").ready(function () {
                loopBlockComment(dataBlock);
            })
        });

    }


    doBlock(); // 차단 실행

    /** 
     * @description 회원 아이디/키워드를 차단 목록에 추가합니다.
     * @param {string} type 차단 타입
     * @param {string} keyword 추가할 키워드/닉네임
     * @param {string} cafeid 적용될 카페 id
     * @param {string} id 추가할 아이디
     */
    function pushBlockItem(type, cafeid = '-', keyword = '', id = '') {
        getBlockList(function(items) {

            if (typeof items[type] == "undefined" || items[type] == null) { // 차단 목록 생성
                items['version'] = 2; // json 버전
                items[type] = new Array(); // 새로운 array
            }

            if ((type == nid ? indexBlockItem(items[type], cafeid, 'id', id)
                             : indexBlockItem(items[type], cafeid, 'keyword', keyword)) === -1) { // 중복 검사
                if (type == nid) { // 사용자
                    items[type].push({
                        cafeid: cafeid, 
                        id: id, 
                        nickname: keyword,
                        timestamp: Date.now(),
                    });
                    alert("'" + keyword + "'(" + id + ") 님이 작성한 글과 댓글을 차단합니다.");

                } else { // 키워드
                    items[type].push({
                        cafeid: cafeid, 
                        keyword: keyword,
                        timestamp: Date.now(),
                    });
                    alert("'" + keyword + "'가 포함된 글이나 댓글을 차단합니다.");

                }
            } else { // 중복인 경우
                alert("'" + keyword + (type == nid ? "' 님은" : "' 은(는)") + " 이미 차단한 " + (type == nid ? "사용자" : "키워드") + "입니다.");
            }


            chrome.storage.sync.set(items, function() { 
                //alert(data + " pushed!");
                doBlock();
                doBlockComment(items);
                var cmtUI = document.querySelector(".LayerMore");
                if (!isEmpty(cmtUI)) {
                    cmtUI.parentNode.removeChild(cmtUI);
                }
                var articleUI = document.querySelector(".perid-layer ul");
                if (!isEmpty(articleUI)) {
                    articleUI.parentNode.removeChild(articleUI);
                }
            });

        });
    }
   
    convertFromOldBlockList();

    /*getBlockList(function(items) {
        testData('{"darkmode":false, "nid":["ecvhao"]}');
    });*/

    /** 
     * @description 1.1.0 이전 버전의 데이터를 현재 버전에 맞게 변환합니다.
     */
    function convertFromOldBlockList() {
        chrome.storage.local.get(null, function(items) {
            
            if ((typeof items[nid] == "undefined" || items[nid] == null) && (typeof items[keyword] == "undefined" || items[keyword] == null)) { // 차단 목록 생성
                return 0;
            }
        
            if (typeof items[nid] == "undefined" || items[nid] == null) { // 차단 목록 생성
                items[nid] = new Array(); // 새로운 array
            }
            if (typeof items[keyword] == "undefined" || items[keyword] == null) { // 차단 목록 생성
                items[keyword] = new Array(); // 새로운 array
            }

            if (typeof items['version'] == "undefined" || items['version'] < 2) {

                items['version'] = 2;

                var l = items[nid].length;

                for (let i = 0; i < l; i++) {
                    var data = items[nid][i];
                    if (typeof data == 'string') {
                        items[nid][i] = {
                            cafeid: '-', 
                            id: data, 
                            nickname: '-',
                            timestamp: Date.now(),
                        };
                    }

                }

                l = items[keyword].length;

                for (let i = 0; i < l; i++) {
                    var data = items[keyword][i];
                    if (typeof data == 'string') {
                        items[keyword][i] = ({
                            cafeid: '-', 
                            keyword: data,
                            timestamp: Date.now(),
                        });
                    }
                }
                //console.log(items);

                chrome.storage.sync.set(items, function() { 
                });

            }

        });
    }

    /** 
     * @description 설정 데이터 테스트에 사용됩니다.
     */
    function testData(str) {
        items = JSON.parse(str);

        chrome.storage.sync.set(items, function() { 
        });
    }

    var countComment = 0;

    function loopBlockComment(dataBlock) {
        if(document.querySelector("#app .Article .ArticleContentBox .CommentBox ul.comment_list") != null/* &&
           document.querySelectorAll("ul.comment_list > li.CommentItem").length != countComment*/)
            doBlockComment(dataBlock);

        setTimeout(() => {
            loopBlockComment(dataBlock);
        }, 500);
    }

    function doBlockComment(dataBlock) {
        var comments = document.querySelectorAll("ul.comment_list > li.CommentItem");
        var le = comments.length;
        countComment = le;
        
        for(var i = 0; i < le; i++) {
            var writerThumb = comments[i].querySelector("a.comment_thumb");
            var writerName = comments[i].querySelector("a.comment_nickname");
            if (!isEmpty(writerThumb)) {
                var writerId = writerThumb.href.match(/memberid=([a-z0-9_-]+)/gi)[0].replace("memberid=", "");
                var cafeid   = writerThumb.href.match(/clubid=([0-9]+)/g)[0].replace("clubid=", "");
                var nickname = writerName.innerText.replace(/[ \t]/g, "");

                // 유저 차단
                if (indexBlockItem(dataBlock[nid], cafeid, 'nickname', nickname) != -1 || indexBlockItem(dataBlock[nid], cafeid, 'id', writerId) != -1) { 
                    hideComment(comments[i], "차단된 회원의 댓글입니다.");
    
                } else {
                    comments[i].addEventListener("click", function(event) { // 유저 차단 UI 삽입
                        var targetElement = (event.target || event.srcElement);
                        if (!isEmpty(targetElement)) {
                            targetElement = targetElement.parentElement;
                            if (!isEmpty(targetElement.parentElement.parentElement.parentElement.querySelector("a.comment_thumb"))) {
                                var _cafeid = targetElement.parentElement.parentElement.parentElement.querySelector("a.comment_thumb").href.match(/clubid=([0-9_]+)/g)[0].replace("clubid=", "");
                                var _nickname = targetElement.parentElement.parentElement.parentElement.querySelector("a.comment_nickname").innerText.replace(/[ \t]/g, "");
                                var _id = targetElement.parentElement.parentElement.parentElement.querySelector("a.comment_thumb").href.match(/memberid=([a-z0-9_-]+)/gi)[0].replace("memberid=", "");
                                injectBlockUIComment(targetElement.parentElement, _cafeid, _nickname, _id);
                            }
                            
                        }
                    });
    
                }
            }

            var content = comments[i].querySelector(".comment_text_view");
            if (!isEmpty(content)) {
                content = content.innerText;
                // 키워드 차단
                if (!isEmpty(dataBlock.keyword)) { 
                    dataBlock.keyword.forEach(element => {
                        if (content.indexOf(element['keyword']) != -1 && !isEmpty(comments[i].querySelector(".comment_area > .comment_thumb"))) {
                            hideComment(comments[i], "차단된 키워드가 포함된 댓글입니다.");
                            }
                    });
                }

            }

        }
    };

    /** 
     * @description 댓글을 숨깁니다.
     * @param {object} element 숨길 댓글의 element
     * @param {string} message 숨긴 댓글에 표시할 메시지
     */
    function hideComment(element, message = '숨겨진 댓글입니다.') {
        if (element.querySelectorAll(".comment_area").length > 0 &&
            element.querySelector(".comment_area > .comment_box").style.display !== 'none') { // 댓글 element 인지 확인 && 이미 차단되었는지 확인
            //요소 숨김
            element.querySelector(".comment_area > .comment_thumb").style.display = 'none';
            element.querySelector(".comment_area > .comment_box").style.display = 'none';
    
            // 메시지 표시
            var blockedCmt = document.createElement("div");
            blockedCmt.className = "comment_box";
            var blockedP = document.createElement("p");
            blockedP.className = "comment_deleted";
            blockedP.append(message);
            blockedCmt.appendChild(blockedP);
            element.querySelector(".comment_area").appendChild(blockedCmt);

        }
    }

    var target_cafeid = "";
    var target_nickname = "";
    var target_id = "";

    /** 
     * @description 글 목록에 차단하기 UI를 삽입합니다.
     * @param {string} _cafeid 차단 대상 회원의 카페 id
     * @param {string} _nickname 차단 대상 닉네임
     * @param {string} _id 차단 대상 id
     */
    function injectBlockUIArticle(_cafeid, _nickname, _id = '') {
        target_cafeid = _cafeid;
        target_nickname = _nickname;
        target_id = _id;

        if (document.querySelector(".perid-layer") != null)
            document.querySelector(".perid-layer").addEventListener("DOMSubtreeModified", function() {
                if (!isEmpty(document.querySelector(".perid-layer > ul")) && 
                    document.querySelector(".perid-layer > ul").innerHTML.indexOf("blocking") == -1) {
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
                        if(confirm("정말로 " + target_nickname + " 님을 차단하시겠습니까?")) {
                            pushBlockItem(nid, target_cafeid, target_nickname, target_id);
                            //location.reload(true);
                        }
                    });
                }
            });

    }

    /** 
     * @description 댓글 목록에 차단하기 UI를 삽입합니다.
     * @param {string} element 삽입할 요소
     * @param {string} _cafeid 차단 대상 회원의 카페 id
     * @param {string} _nickname 차단 대상 닉네임
     * @param {string} _id 차단 대상 id
     */
    function injectBlockUIComment(element, _cafeid, _nickname, _id = '') {
        target_cafeid = _cafeid;
        target_nickname = _nickname;
        target_id = _id;

        if (!isEmpty(element.querySelector(".LayerMore")) && element.querySelector(".LayerMore").innerHTML.indexOf("blocking") == -1) {
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
                if(confirm("정말로 " + target_nickname + " 님을 차단하시겠습니까?")) {
                    pushBlockItem(nid, target_cafeid, target_nickname, target_id);
                    //location.reload(true);
                }
            });
        }
        element.addEventListener("DOMSubtreeModified", function() {
            if (!isEmpty(element.querySelector(".LayerMore")) && 
                element.querySelector(".LayerMore").innerHTML.indexOf("blocking") == -1) {
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
                    if(confirm("정말로 " + target_nickname + " 님을 차단하시겠습니까?")) {
                        pushBlockItem(nid, target_cafeid, target_nickname, target_id);
                        //location.reload(true);
                    }
                });
            }
        });

    }

});