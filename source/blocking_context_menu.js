/** 
 * @author Wei756 <wei756fg@gmail.com> 
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
        pushBlockItem(keyword, '-', str);
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
        });

    });
}

function indexBlockItem(arr, cafeid, key, value) {
    var le = arr.length;
    for (let i = 0; i < le; i++) {
        if (arr[i]['' + key] != null && arr[i]['cafeid'] === cafeid && arr[i]['' + key] === value) {
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
    chrome.storage.sync.get(null, function(items) {
        //console.log("items: " + JSON.stringify(items));
        callback(items);
    });
}