/** 
 * @author Wei756 <wei756fg@gmail.com> 
 * @license MIT
 */

jQuery(function($){
    $(document).ready(function() {
        checkActivityStop();
    });

    /**
     * 회원이 활동정지 상태인지 확인하고 그 상태를 출력합니다.
     */
    function checkActivityStop() {
        if (location.href.indexOf("CafeMemberProfile.nhn") != -1) {
            // 프로필 페이지 로딩
            var params = getURLParams();
            var cafeId = params["cafeId"];
            var memberId = params["memberId"];
            if (memberId) {
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
                            stoppedElement.append(" (활동 정지됨)");
                            document.querySelector(".profile_head strong.nick").appendChild(stoppedElement);
                        }
                    },
                    error: function (xhr) {
                    }
                })
            }
        }
    }

});