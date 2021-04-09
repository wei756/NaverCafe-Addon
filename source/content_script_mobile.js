/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

jQuery(function($){
    $(document).ready(() => {
        checkActivityStop();
    });

    /**
     * @description 현재 보고 있는 회원이 활동정지 상태인지 확인하고 그 상태를 프로필에 표시합니다.
     */
    function checkActivityStop() {
        if (location.href.indexOf('CafeMemberProfile.nhn') !== -1) { // 프로필 페이지
            const script = `
            <script type="text/javascript">
            // injected by NaverCafe-Addon
            // for checkActivityStop
            function getURLParams() {
                const params = [];
                try {
                    const url = decodeURIComponent(decodeURIComponent(location.href));
                    const paramsStr = url.substring( url.indexOf('?')+1, url.length ).split("&");
                    paramsStr.map(param => {
                        const [k, v] = param.split("=");
                        params[k] = v;
                    });
                } catch(err) {
                    console.error(err);
                }
                
                return params;
            }
            function getActivityStopMobile({ cafeid, memberid, callback }) {
                jQuery.ajax({
                    type: 'POST',
                    url: 'https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberStatus?cafeId=' + cafeid + '&memberId=' + memberid,
                    dataType: 'json',
                    xhrFields: {
                        withCredentials: true
                    },
                    crossDomain: true,
                    success: data => {
                        callback(data.message.status == '200' && data.message.result.activityStop);
                    },
                    error: xhr => {
                        callback(false);
                    }
                });
            }
            jQuery(document).ready(() => {
                const params = getURLParams();
                const { cafeId, memberId } = params;
                getActivityStopMobile({
                    cafeid: cafeId, 
                    memberid: memberId,
                    callback: stopped => {
                        if (stopped) {
                            document.querySelector('.profile_head strong.nick').innerHTML += '<span class="id">(활동 정지됨)</span>';
                        }
                    }
                });
            });
            </script>`;
            $('body').append($(script));
            // CORS 문제로 html에 삽입하여 실행되는 형태로 구현함
        }
    }

});