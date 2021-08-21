/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

jQuery(function($){
    
    let prevUrl = '';
    function loopCheckUrl() {
        if (prevUrl != location.href) {
            prevUrl = location.href;
            onReady();
        }
    }
    setInterval(loopCheckUrl, 500);

    function onReady() {
        setTimeout(injectBlockListUI, 300);
    };

    /** 
     * @description 차단 목록 UI를 삽입합니다.
     */
    function injectBlockListUI() {
        
        //프로필 페이지
        if (location.href.indexOf('/members/') != -1 && location.href.indexOf('/ca-fe/web/cafes/') != -1) {

            const memberInfoHead = $('#app div.CafeMemberProfile div.profile_head_info');
            const memberInfoHeadTabList = $('ul.HeaderTabList.HeaderTabList--between > li');
            const cafeid = location.href.replace('https://m.cafe.naver.com/ca-fe/web/cafes/', '').split('/')[0];
            
            if (memberInfoHead.find('.blocking').length) { // already injected
                return;
            }

            if (memberInfoHead && memberInfoHeadTabList.length == 4) {

                // 차단 목록 링크
                const blockUI = $(`<div class="profile_button"><a href="#" role="button" class="ButtonBase ButtonBase--gray blocking"><span class="ButtonBase__txt">차단 목록</span></a></div>`)
                memberInfoHead.append(blockUI);
                memberInfoHead.find('.blocking').bind('click', e => {

                    // 차단 목록 페이지 로딩
                    loadBlocking(nid, cafeid);
                });

            } else if (memberInfoHead && memberInfoHeadTabList.length == 3) { // 차단하기 UI삽입

                console.log('fff');
                const _nickname = memberInfoHead.find('.info_area .nickname').text().trim();
                //const _id = params["memberId"].replace('#', '');

                console.log(memberInfoHead)
                // 차단 목록 링크
                const blockUI = $(`<div class="profile_button"><a href="#" role="button" class="ButtonBase ButtonBase--gray blocking"><span class="ButtonBase__txt">차단하기</span></a></div>`)
                memberInfoHead.append(blockUI);
                memberInfoHead.find('.blocking').bind('click', e => {
                    if(confirm("정말로 " + _nickname + " 님을 차단하시겠습니까?")) {
                        pushBlockItem(nid, cafeid, _nickname, '');
                        //location.reload(true);
                    }
                });
            }
        }
    }

    /** 
     * @description 차단 목록을 불러옵니다.
     * @param {string} type 종류
     */
    function loadBlocking(type, cafeid) {

        const list_tab = $('.CafeMemberContentsTabContainer .HeaderTab ul.HeaderTabList');
        const listContainer = $('.CafeMemberContentsTabContainer .my_board_wrap');
        
        const tabs = `<li role="presentation" class="tab_item"><a href="#" role="tab" class="tab_link link_block_nick"><span class="tab_menu">닉네임 목록</span></a></li><li role="presentation" class="tab_item"><a href="#" role="tab" class="tab_link link_block_keyword"><span class="tab_menu">키워드 목록</span></a></li>`;
        
        // 기존 UI 제거
        list_tab.children('li').remove();
        listContainer.find('.nested_route_area').remove();
        listContainer.find('.board_header .num').remove();
        if (listContainer.find('.txt_result')) {
            listContainer.find('.txt_result').remove();
        }

        // 회원/키워드 구분 탭 인젝트
        
        const page = $(tabs);

        list_tab.append(page);
        list_tab.find(`.link_block_${type === nid ? 'nick' : type}`).attr('aria-selected', true);
        //list_tab.find(".link_tab .inner").width("100px");
        
        $('.link_block_keyword').bind('click', e => {
            loadBlocking(keyword, cafeid);
        });
        $('.link_block_nick').bind('click', e => {
            loadBlocking(nid, cafeid);
        });

        // 키워드 입력 창 인젝트
        if (type === keyword) {
            var inputForm = $('<div class="txt_result" style=""><input type="text" id="inputKeyword" placeholder="차단할 키워드 입력"><button id="addKeyword">추가</button></div>');
            var inputKeyword = inputForm.find('#inputKeyword');
            var btnKeyword = inputForm.find('#addKeyword');
    
            inputForm.css('display', 'flex');
            inputForm.css('flex-direction', 'row');
            inputForm.css('padding', '17px 16px');
    
            inputKeyword.css('border', 'none');
            inputKeyword.css('border-radius', '8px');
            inputKeyword.css('background', '#f0f0f0');
            inputKeyword.css('flex', '1');
            inputKeyword.css('padding', '8px');
    
            btnKeyword.css('background', '#03c75a');
            btnKeyword.css('color', '#fff');
            btnKeyword.css('padding', '8px 10px');
            btnKeyword.css('border-radius', '8px');
            btnKeyword.css('margin-left', '8px');

            btnKeyword.on('click', function(event) {
                pushBlockItem(keyword, cafeid, inputKeyword.val());
                setTimeout(() => {
                    location.reload(true);
                }, 500);
            });
    
            listContainer.prepend(inputForm);

        }

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

        var list = data[type];
        var le = list.length;
        //document.querySelector("#itemCount").innerText = le + " 개의 차단 목록이 있습니다.";
        for(var i = 0; i < le; i++) {
            if (list[i]['cafeid'] !== '-' && cafeid != list[i]['cafeid']) { // 타 카페 차단
                continue;
            }
            var item = $(`
            <li class="CafeMemberArticleItem board_box">
                <a href="" class="txt_area">
                    <strong class="tit" style="padding-top: 8px;display: inline-block;"></strong>
                    <div class="user_area">
                        <span class="nick">
                            <span class="ellip"></span>
                        </span>
                    </div>
                </a>
                <a href="#" class="link_comment remove"><div class="comment_inner" style="box-sizing: border-box;height: 56px;padding-top: 20px;"><em class="num">해제</em></div></a>
            </li>`);

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
                const targetElement = event.currentTarget.parentElement;
                
                const cafeid = targetElement.dataset.cafeid;
                const id = targetElement.dataset.id;
                const nickname = targetElement.dataset.nickname;
                const _keyword = targetElement.dataset.keyword;

                let key = '', value;
                if (type == keyword) {
                    key = 'keyword';
                    value = _keyword;
                } else {
                    if (nickname && nickname !== '-') {
                        key = 'nickname';
                        value = nickname;
                    }
                    else {
                        key = 'id';
                        value = id;
                    }
                }
                const msgStr = 
                    type == keyword && value ? 
                    getEul(value) + " 차단 해제하시겠습니까?" : 
                    " 님을 차단 해제하시겠습니까?";
                if(confirm(value + msgStr)) {
                    removeBlockItem(type, cafeid, key, value);
                    setTimeout(() => {
                        location.reload(true);
                    }, 500);
                }
            });
            
            listContainer.append(item);
            
        }
        $('.my_board_wrap .list_board').append($('<div class="nested_route_area"><div class="CafeMemberArticleContentsTab"></div></div>'));
        $('.my_board_wrap .list_board .nested_route_area .CafeMemberArticleContentsTab').append(listContainer);
    }

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
            });

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
                    if (writer) {
                        var nickname = writer.innerText;
                        var cafeid = article.href.match(/clubid=([0-9]+)/g)[0].replace("clubid=", "");
                        // 유저 차단
                        if (indexBlockItem(dataBlock[nid], cafeid, 'nickname', nickname) != -1 ) { 
                            articles[i].style.display = "none";
                        }
                    }

                    var title = articles[i].querySelector(".txt_area strong.tit");
                    if (title) {
                        title = title.innerText;

                        // 키워드 차단
                        if (dataBlock.keyword) { 
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
            if (writer) {
                var cafeid = window.location.href.match(/cafes\/([0-9]+)/g)[0].replace("cafes\/", "");
                var nickname = writer.querySelector("span.name").innerText;

                // 유저 차단
                if (indexBlockItem(dataBlock[nid], cafeid, 'nickname', nickname) != -1) { 
                    hideComment(comments[i], "차단된 회원의 댓글입니다.");
    
                }
            }

            var content = comments[i].querySelector("p.txt");
            if (content && content.style.display !== 'none') {
                content = content.innerText;
                // 키워드 차단
                if (dataBlock.keyword) { 
                    dataBlock.keyword.forEach(element => {
                        if (content.indexOf(element['keyword']) != -1) {
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
        if (element.querySelectorAll(".lst_wp").length > 0 &&
            element.querySelectorAll(".txt.blocked").length === 0) { // 댓글 element 인지 확인 && 이미 차단되었는지 확인
            //요소 숨김
            element.querySelector(".lst_wp > .thumb_area").style.display = 'none';
            element.querySelector(".lst_wp > .date_area").style.display = 'none';
            element.querySelector(".lst_wp > .txt").style.display = 'none';
            if (element.querySelector(".lst_wp > .image_section") != null)
                element.querySelector(".lst_wp > .image_section").style.display = 'none';
            if (element.querySelector(".lst_wp > .u_cbox_sticker_section") != null)
                element.querySelector(".lst_wp > .u_cbox_sticker_section").style.display = 'none';
            element.querySelector(".CommentListItemMenuLayer").style.display = 'none';
    
            // 메시지 표시
            var blockedMsg = $('<p class="txt del blocked"><span></span> <a href="#" style="color: #25a723;">내용 보기</a></p>');
            
            blockedMsg.find('a').on('click', function(event) {
                event.preventDefault();
                var targetElement = (event.target || event.srcElement);
                    targetElement = targetElement.parentElement.parentElement.parentElement;

                    targetElement.querySelector(".lst_wp > .thumb_area").style.display = '';
                    targetElement.querySelector(".lst_wp > .date_area").style.display = '';
                    targetElement.querySelector(".lst_wp > .txt").style.display = '';
                    if (targetElement.querySelector(".lst_wp > .image_section") != null)
                        targetElement.querySelector(".lst_wp > .image_section").style.display = '';
                    if (targetElement.querySelector(".lst_wp > .u_cbox_sticker_section") != null)
                        targetElement.querySelector(".lst_wp > .u_cbox_sticker_section").style.display = '';
                    targetElement.querySelector(".CommentListItemMenuLayer").style.display = '';
                    
                    targetElement.querySelector(".txt.blocked").style.display = 'none';
            });

            blockedMsg.find('span').text(message);
            $(element).find('.lst_wp').append(blockedMsg);

        }
    }

});