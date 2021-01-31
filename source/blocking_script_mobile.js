/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

jQuery(function($){

    /** 
     * @description URL 파라미터를 반환합니다.
     * @return {Array} 파라미터
     */
    function getURLParams() {
        // 파라미터가 담길 배열
        var param = new Array();
     
        // 현재 페이지의 url
        try {
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
        } catch(err) {
            console.error(err);
        }
     
        return param;
    }

    /**
     * 문자열이 빈 문자열인지 체크하여 결과값을 리턴합니다.
     * @param str 체크할 문자열
     */
    function isEmpty(str) {
         
        if (typeof str == "undefined" || str == null || str == "")
            return true;
        else
            return false;
    }
    
    $(document).ready(function() {
        injectBlockListUI();
    });

    /** 
     * @description 차단 목록 UI를 삽입합니다.
     */
    function injectBlockListUI() {
        
        //프로필 페이지
        if (location.href.indexOf("CafeMemberProfile.nhn") != -1) {

            // 차단 목록 링크
            if (document.querySelector("#memberInfo div.info_profile div.info") != null &&
                document.querySelector("#commentListTab") != null) {
                var aBlock = document.createElement("a");
                aBlock.className = "btn_go blocking";
                aBlock.href = "#";
                aBlock.append("차단목록");
                document.querySelector("#memberInfo div.info_profile div.info").appendChild(aBlock);
    
                document.querySelector("#memberInfo div.info_profile div.info .blocking").addEventListener("click", function(event) {
                    location.href = location.href.replace("&blocking.page=true", "")
                                            .replace("&blocking.type=", "&blocking.dump=")
                                            .replace("#", "") + "&blocking.type=nick&blocking.page=true"; // 닉네임 차단 목록 페이지로 이동
                });

                // 차단 목록 페이지 로딩
                var params = getURLParams();
                var isBlocking = params["blocking.page"];
                var pageType = params["blocking.type"];
                var cafeid = params['cafeId'];
                if (!isEmpty(isBlocking)) {
                    isBlocking = isBlocking.replace("#", "");
                }
                if (isBlocking == "true") { // 차단 목록 페이지면
                    if (pageType == "nick") { // 닉네임
                        loadBlocking(nid, cafeid);
                    } else if (pageType == "keyword") { // 키워드
                        loadBlocking(keyword, cafeid);
                    }
                }

            } else if (document.querySelector("#memberInfo div.info_profile div.info") != null &&
                       document.querySelector("#commentListTab") == null) { // 차단하기 UI삽입

                var params = getURLParams();

                var _cafeid = params['cafeId'];
                var _nickname = document.querySelector("#memberInfo strong.nick > span").innerText;
                var _id = params["memberId"].replace('#', '');
                injectBlockUIUser(_cafeid, _nickname, _id);
            }
        }
    }

    /** 
     * @description 차단 목록을 불러옵니다.
     * @param {string} type 종류
     */
    function loadBlocking(type, cafeid) {
        var list_tab = $("#tabContainer > ul");
        var listContainer = $("#itemListContainer");

        var tabs = '<li id="nickTab"><a href="#" class="link_tab link_block_nick _stopDefault" ><span class="inner">닉네임 목록</span></a></li><li id="keywordTab"><a href="#" class="link_tab link_block_keyword _stopDefault" ><span class="inner">키워드 목록</span></a></li>';
        
        // 기존 UI 제거
        list_tab.children("li").remove();
        listContainer.find("#itemList").remove();
        listContainer.children("#itemListContainer .txt_result").remove();

        // 회원/키워드 구분 탭 인젝트
        
        var page = $(tabs);

        list_tab.append(page);
        list_tab.find("#" + (type === nid ? 'nick' : type) + "Tab").addClass("on");
        list_tab.find(".link_tab .inner").width("100px");
        
        $(".link_block_keyword").on("click", function() {
            location.href = location.href.replace("&blocking.page=true", "")
                                        .replace("&blocking.type=", "&blocking.dump=")
                                        .replace("#", "") + "&blocking.type=keyword&blocking.page=true"; // 키워드 차단 목록 페이지로 이동
        });
        $(".link_block_nick").on("click", function() {
            location.href = location.href.replace("&blocking.page=true", "")
                                        .replace("&blocking.type=", "&blocking.dump=")
                                        .replace("#", "") + "&blocking.type=nick&blocking.page=true"; // 회원 차단 목록 페이지로 이동
        });

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
        var listContainer = $('<ul class="list_area"></ul>');

        var list = data["" + type];
        var le = list.length;
        //document.querySelector("#itemCount").innerText = le + " 개의 차단 목록이 있습니다.";
        for(var i = 0; i < le; i++) {
            if (list[i]['cafeid'] !== '-' && cafeid != list[i]['cafeid']) { // 타 카페 차단
                continue;
            }
            var item = $('<li class="board_box"><a href="" class="txt_area _articleListItem"><strong class="tit"></strong><div class="user_area"><span class="nick"><span class="ellip"></span></span></div></a><a href="#" class="link_comment remove"><em class="num">해제</em></a></li>');

            item.attr('data-cafeid', list[i]['cafeid']); // 카페 id

            if (type === nid) {
                item.attr('data-id', list[i]['id']); // 회원 id
                item.attr('data-nickname', list[i]['nickname']); // 회원 닉네임
            } else {
                item.attr('data-keyword', list[i]['keyword']); // 키워드
            }

            if (type === nid) {
                item.find('strong.tit').text(list[i]['nickname'] + '(' + list[i]['id'] +')'); // 회원 id
                item.find('._articleListItem').attr('href', '/CafeMemberProfile.nhn?cafeId=' + cafeid + '&memberId=' + list[i]['id']);
            }
            else {
                item.find('strong.tit').text(list[i]['keyword']); // 키워드
            }

            var now = Date.now();
            var timestamp = new Date(list[i]['timestamp']);
            if (Math.floor(now / (1000 * 60 * 60 * 24)) === Math.floor(timestamp / (1000 * 60 * 60 * 24))) { // 오늘이면
                item.find('.nick').text(timestamp.toLocaleTimeString('it-IT')); // 차단시각
            } else {
                item.find('.nick').text(timestamp.toLocaleDateString('ko-KR')); // 차단날짜
            }
            item.find('.remove').on("click", function(event) {
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
            
            listContainer.append(item);
            
        }
        $('#itemListContainer').append(listContainer);
    }

    /**
     * @description 네이버 아이디
     * @type {string}
     */
    const nid = "nid";
    /**
     * @description 네이버 닉네임
     * @type {string}
     */
    const nick = "nick";
    /**
     * @description 키워드
     * @type {string}
     */
    const keyword = "keyword";

    //doBlock(); // 차단 실행

    /** 
     * @description 회원 아이디/키워드를 차단 목록에 추가합니다.
     * @param {string} type 차단 타입
     * @param {string} keyword 추가할 키워드/닉네임
     * @param {string} cafeid 적용될 카페 id
     * @param {string} id 추가할 아이디
     */
    function pushBlockItem(type, cafeid = '-', keyword = '', id = '') {
        getBlockList(function(items) {

            if (typeof items["" + type] == "undefined" || items["" + type] == null) { // 차단 목록 생성
                items['version'] = 2; // json 버전
                items["" + type] = new Array(); // 새로운 array
            }

            if ((type == nid ? indexBlockItem(items["" + type], cafeid, 'id', id)
                             : indexBlockItem(items["" + type], cafeid, 'keyword', keyword)) === -1) { // 중복 검사
                if (type == nid) { // 사용자
                    items["" + type].push({
                        cafeid: cafeid, 
                        id: id, 
                        nickname: keyword,
                        timestamp: Date.now(),
                    });
                    alert("'" + keyword + "'(" + id + ") 님이 작성한 글과 댓글을 차단합니다.");

                } else { // 키워드
                    items["" + type].push({
                        cafeid: cafeid, 
                        keyword: keyword,
                        timestamp: Date.now(),
                    });
                    alert("'" + keyword + "'가 포함된 글이나 댓글을 차단합니다.");

                }
            } else { // 중복인 경우
                alert("'" + keyword + (type == nid ? "' 님은" : "' 은(는)") + " 이미 차단한 " + (type == nid ? "사용자" : "키워드") + "입니다.");
            }


            chrome.storage.local.set(items, function() { 
            });

        });
    }

    /** 
     * @description 차단 목록에 특정값이 있는지 확인하고 그 인덱스를 반환합니다.
     * @param {Array}} 차단 목록
     * @param {string} cafeid 찾는 값의 카페 id
     * @param {string} key 찾는 값의 key
     * @param {string} value 찾는 값
     */
    function indexBlockItem(arr, cafeid, key, value) {
        var le = arr.length;
        for (let i = 0; i < le; i++) {
            if (arr[i]['' + key] != null && (arr[i]['cafeid'] === '-' || arr[i]['cafeid'] === cafeid) && arr[i][key] === value) {
                return i;
            }
        }
        return -1;
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
     * @param {string} cafeid 제거할 데이터의 카페 id
     * @param {string} key 제거할 데이터 키
     * @param {string} value 제거할 데이터 값
     */
    function removeBlockItem(type, cafeid, key, value) {
        getBlockList(function(items) {
            if (typeof items["" + type] == "undefined" || items["" + type] == null) {
                alert("차단하지 않은 " + (type == nid ? "사용자" : "키워드") + "입니다. (" + data + ")");
            } else {
                var ind = indexBlockItem(items["" + type], cafeid, key, value)
                if (ind != -1) { // 존재하는지 여부 검사
                    items["" + type].splice(ind, 1);

                    var msgStr = " 님을 차단 해제하였습니다.";
                    if (type == keyword) {
                        var iga = "을";
                        var lastChar = value.charCodeAt(value.length - 1);
                        if (lastChar >= 44032 && lastChar <= 55215 && (lastChar - 44032) % 28 == 0) {
                            iga = "를";
                        }
                        msgStr = iga + " 차단 해제하였습니다.";
                    }
                    alert(value + msgStr);
                    
                    chrome.storage.local.set(items, function() { 
                        //alert(value + " pushed!");
                    });
                } else {
                    alert("차단하지 않은 " + (type == nid ? "사용자" : "키워드") + "입니다. (" + value + ")");
                }
            }
        });
    }

    var countArticle = 0;
    var countComment = 0;

    function loopBlockComment(dataBlock) {
        if(document.querySelector(".CommentComponent  ul.CommentList") != null/* &&
           document.querySelectorAll(".CommentComponent  ul.CommentList > li.CommentListItem").length != countComment*/)
            doBlockComment(dataBlock);

        setTimeout(() => {
            loopBlockComment(dataBlock);
        }, 1000);
    }

    function loopBlock(dataBlock) {
        if(document.querySelector("#app #ct .list_board ul.list_area") != null/* &&
           document.querySelectorAll("#app #ct .list_board ul.list_area").length != countArticle*/)
            doBlock(dataBlock);

        setTimeout(() => {
            loopBlock(dataBlock);
        }, 1500);
    }

    getBlockList(function(dataBlock) {

        // 글 차단 루프
        $("#app #ct .list_board ul.list_area").ready(function () {
            loopBlock(dataBlock);
        })

        // 댓글 차단 루프
        $(".CommentComponent  ul.CommentList").ready(function () {
            loopBlockComment(dataBlock);
        })
    });
    
    /** 
     * @description 사용자/키워드 차단을 실행합니다.
     */
    function doBlock(dataBlock) {

        // 글 차단
        if (document.querySelectorAll("#app #ct .list_board ul.list_area").length != 0)
            $("#app #ct .list_board ul.list_area").ready(function() {
                var articles = document.querySelectorAll("#app #ct .list_board ul.list_area > li.board_box");
                var le = articles.length;
                countArticle = le;

                for(var i = 0; i < le; i++) {
                    var writer = articles[i].querySelector(".user_area .nick span");
                    var article = articles[i].querySelector("a.txt_area");
                    if (!isEmpty(writer)) {
                        var nickname = writer.innerText;
                        var cafeid = article.href.match(/clubid=([0-9]+)/g)[0].replace("clubid=", "");
                        // 유저 차단
                        if (indexBlockItem(dataBlock["" + nid], cafeid, 'nickname', nickname) != -1 ) { 
                            articles[i].style.display = "none";
                        }
                    }

                    var title = articles[i].querySelector(".txt_area strong.tit");
                    if (!isEmpty(title)) {
                        title = title.innerText;

                        // 키워드 차단
                        if (!isEmpty(dataBlock.keyword)) { 
                            dataBlock.keyword.forEach(element => {
                                if (title.indexOf(element['keyword']) != -1) {
                                    articles[i].style.display = "none";
                                }
                            });
                        }
                    }

                }
            });

    }

    function doBlockComment(dataBlock) {
        var comments = document.querySelectorAll(".CommentComponent  ul.CommentList > li.CommentListItem");
        var le = comments.length;
        countComment = le;
        
        for(var i = 0; i < le; i++) {
            var writer = comments[i].querySelector("a.nick");
            if (!isEmpty(writer)) {
                var cafeid = window.location.href.match(/cafes\/([0-9]+)/g)[0].replace("cafes\/", "");
                var nickname = writer.querySelector("span.name").innerText;

                // 유저 차단
                if (indexBlockItem(dataBlock["" + nid], cafeid, 'nickname', nickname) != -1) { 
                    comments[i].querySelector(".lst_wp > .thumb_area").style.display = 'none';
                    comments[i].querySelector(".lst_wp > .date_area").style.display = 'none';
                    comments[i].querySelector(".lst_wp > .txt").style.display = 'none';
                    if (comments[i].querySelector(".lst_wp > .image_section") != null)
                        comments[i].querySelector(".lst_wp > .image_section").style.display = 'none';
                    if (comments[i].querySelector(".lst_wp > .u_cbox_sticker_section") != null)
                        comments[i].querySelector(".lst_wp > .u_cbox_sticker_section").style.display = 'none';
                    comments[i].querySelector(".CommentListItemMenuLayer").style.display = 'none';
                    var blockedP = document.createElement("p");
                    blockedP.className = "txt del blocked";
                    blockedP.append("차단된 회원의 댓글입니다.");
                    comments[i].querySelector(".lst_wp").appendChild(blockedP);
    
                }
            }

            var content = comments[i].querySelector(".comment_text_view");
            if (!isEmpty(content)) {
                content = content.innerText;
                // 키워드 차단
                if (!isEmpty(dataBlock.keyword)) { 
                    dataBlock.keyword.forEach(element => {
                        if (content.indexOf(element['keyword']) != -1 && !isEmpty(comments[i].querySelector(".comment_area > .comment_thumb"))) {
                            comments[i].querySelector(".comment_area").removeChild(comments[i].querySelector(".comment_area > .comment_thumb"));
                            comments[i].querySelector(".comment_area").removeChild(comments[i].querySelector(".comment_area > .comment_box"));
                            var blockedCmt = document.createElement("div");
                            blockedCmt.className = "comment_box";
                            var blockedP = document.createElement("p");
                            blockedP.className = "comment_deleted";
                            blockedP.append("차단된 키워드가 포함된 댓글입니다.");
                            blockedCmt.appendChild(blockedP);
                            comments[i].querySelector(".comment_area").appendChild(blockedCmt);
                        }
                    });
                }

            }

        }
    };

    /** 
     * @description 프로필 페이지에 차단하기 UI를 삽입합니다.
     * @param {string} _cafeid 차단 대상 회원의 카페 id
     * @param {string} _nickname 차단 대상 닉네임
     * @param {string} _id 차단 대상 id
     */
    function injectBlockUIUser(_cafeid, _nickname, _id = '') {

        var aBlock = document.createElement("a");
        aBlock.className = "btn_go blocking";
        aBlock.href = "#";
        aBlock.append("차단하기");
        document.querySelector("#memberInfo div.info_profile div.info").appendChild(aBlock);

        document.querySelector("#memberInfo div.info_profile div.info .blocking").addEventListener("click", function(event) {
            if(confirm("정말로 " + _nickname + " 님을 차단하시겠습니까?")) {
                pushBlockItem(nid, _cafeid, _nickname, _id);
                //location.reload(true);
            }
        });
    }

    initBlockList();
    
    /** 
     * @description 차단 목록 배열을 생성합니다.
     */
    function initBlockList() {
        getBlockList(function(items) {
        
            if (typeof items[nid] == "undefined" || items[nid] == null) { // 차단 목록 생성
                items[nid] = new Array(); // 새로운 array
            }
            if (typeof items[keyword] == "undefined" || items[keyword] == null) { // 차단 목록 생성
                items[keyword] = new Array(); // 새로운 array
            }
            chrome.storage.local.set(items, function() { 
            });

        });
    }

});