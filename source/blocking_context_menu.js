/** 
 * @author Wei756 <kjhoon1122@naver.com> 
 * @license MIT
 */

chrome.contextMenus.create({"title": "선택된 키워드가 포함된 글/댓글 차단하기", "contexts":["selection"],
                            "onclick": blockKeyword});


function blockKeyword(info, tab) {
    var str = info.selectionText;
    var iga = "이";
    var lastChar = str.charCodeAt(str.length - 1);
    if (lastChar >= 44032 && lastChar <= 55215 && (lastChar - 44032) % 28 == 0) {
        iga = "가";
    }
    if (confirm("'" + str + "'" + iga + " 포함된 제목, 댓글을 차단하시겠습니까?")) {
        pushBlockItem(keyword, str);
    }
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
                var iga = "이";
                var lastChar = data.charCodeAt(data.length - 1);
                if (lastChar >= 44032 && lastChar <= 55215 && (lastChar - 44032) % 28 == 0) {
                    iga = "가";
                }
                alert("'" + data + "'" + iga + " 포함된 컨텐츠를 차단합니다.");
            } else {
                var iga = "은";
                var lastChar = data.charCodeAt(data.length - 1);
                if (lastChar >= 44032 && lastChar <= 55215 && (lastChar - 44032) % 28 == 0) {
                    iga = "는";
                }
                alert("'" + data + "'" + iga + " 이미 차단한 키워드입니다.");
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