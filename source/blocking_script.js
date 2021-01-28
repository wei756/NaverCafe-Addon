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
            if (!isEmpty(isBlocking)) {
                isBlocking = isBlocking.replace("#", "");
            }
            if (isBlocking == "true") { // 차단 목록 페이지면
                if (pageType == "nid") { // 회원 id
                    loadBlocking("nid");
                } else if (pageType == "keyword") { // 키워드
                    loadBlocking("keyword");
                }

            }
        });

        //프로필 페이지
        if (location.href.indexOf("CafeMemberNetworkView.nhn") != -1) {
            var params = getURLParams();
            var memberId = params["memberid"];
            document.querySelector(".pers_nick_area .p-nick a.m-tcol-c").addEventListener("click", function(event) { // 유저 차단 UI 삽입
                injectBlockUIArticle(memberId); 
            });
        }
    }

    /** 
     * @description 차단 목록을 불러옵니다.
     * @param {string} type 종류
     */
    function loadBlocking(type) {
        var main_area = $("#main-area");
        var section = main_area.children(".article-board.article_profile");

        var table = '<table><caption><span class="blind">차단 목록</span></caption><colgroup><col><col style="width:120px"><col style="width:100px"><col style="width:80px"></colgroup><thead><tr><th scope="col" class="type"></th><th scope="col"></th><th scope="col"></th><th scope="col"></th></tr></thead><tbody></tbody></table>';
        
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
                var key = targetElement.parentElement.querySelector(".title_txt").innerText;
                var msgStr = " 님을 차단 해제하시겠습니까?";
                if (type == keyword) {
                    var iga = "을";
                    var lastChar = key.charCodeAt(key.length - 1);
                    if (lastChar >= 44032 && lastChar <= 55215 && (lastChar - 44032) % 28 == 0) {
                        iga = "를";
                    }
                    msgStr = iga + " 차단 해제하시겠습니까?";
                }
                if(confirm(key + msgStr)) {
                    removeBlockItem(type, key);
                    location.reload(true);
                }
            });
            
        }
        table.querySelector("#data").remove();
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
                    alert("'" + data + "' 님을 차단하였습니다.");
                } else {
                    alert("이미 차단한 " + (type == nid ? "사용자" : "키워드") + "입니다. (" + data + ")");
                }
            }
            chrome.storage.local.set(items, function() { 
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

                    var msgStr = " 님을 차단 해제하였습니다.";
                    if (type == keyword) {
                        var iga = "을";
                        var lastChar = data.charCodeAt(data.length - 1);
                        if (lastChar >= 44032 && lastChar <= 55215 && (lastChar - 44032) % 28 == 0) {
                            iga = "를";
                        }
                        msgStr = iga + " 차단 해제하였습니다.";
                    }
                    alert(data + msgStr);
                    
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
                            var writerId = articles[i].querySelector(".p-nick > a");
                            if (!isEmpty(writerId)) {
                                writerId = writerId.getAttribute("onclick").match(/'([^'])+'/g)[0].replace("'", "").replace("'", "");

                                // 유저 차단
                                if (!isEmpty(dataBlock.nid) && dataBlock.nid.indexOf(writerId) != -1) { 
                                    articles[i].innerHTML = "";
                                } else {
                                    articles[i].addEventListener("click", function(event) { // 유저 차단 UI 삽입
                                        var targetElement = (event.target || event.srcElement);
                                        if (!isEmpty(targetElement)) {
                                            var targetElement = targetElement.parentElement;
                                            if (!isEmpty(targetElement.querySelector(".p-nick > a"))) {
                                                injectBlockUIArticle(targetElement.querySelector(".p-nick > a").getAttribute("onclick").match(/'([^'])+'/g)[0].replace("'", "").replace("'", "")); 
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
                                        if (title.indexOf(element) != -1) {
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

    var countComment = 0;

    function loopBlockComment(dataBlock) {
        if(document.querySelector("#app .Article .ArticleContentBox .CommentBox ul.comment_list") != null &&
           document.querySelectorAll("ul.comment_list > li.CommentItem").length != countComment)
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
            var writerId = comments[i].querySelector("a.comment_thumb");
            if (!isEmpty(writerId)) {
                writerId = writerId.href.match(/memberid=([a-z0-9_]+)/gi)[0].replace("memberid=", "");

                // 유저 차단
                if (!isEmpty(dataBlock.nid) && dataBlock.nid.indexOf(writerId) != -1) { 
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
                        var targetElement = (event.target || event.srcElement);
                        if (!isEmpty(targetElement)) {
                            targetElement = targetElement.parentElement;
                            if (!isEmpty(targetElement.parentElement.parentElement.parentElement.querySelector("a.comment_thumb"))) {
                                injectBlockUIComment(targetElement.parentElement, 
                                                targetElement.parentElement.parentElement.parentElement.querySelector("a.comment_thumb").href.match(/memberid=([a-z0-9_]+)/gi)[0].replace("memberid=", ""));
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
                        if (content.indexOf(element) != -1 && !isEmpty(comments[i].querySelector(".comment_area > .comment_thumb"))) {
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

    var target_id = "";

    /** 
     * @description 글 목록에 차단하기 UI를 삽입합니다.
     * @param {string} _id 차단 대상 id
     */
    function injectBlockUIArticle(_id) {
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
                        if(confirm("정말로 " + target_id + " 님을 차단하시겠습니까?")) {
                            pushBlockItem(nid, target_id);
                            //location.reload(true);
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
                if(confirm("정말로 " + target_id + " 님을 차단하시겠습니까?")) {
                    pushBlockItem(nid, target_id);
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
                    if(confirm("정말로 " + target_id + " 님을 차단하시겠습니까?")) {
                        pushBlockItem(nid, target_id);
                        //location.reload(true);
                    }
                });
            }
        });

    }

});