;(function($){

    var wSlide = function(ele, cfg){
        var _cfg = {
            "speed": 800,
            "delay": 5000
        };
        $.extend(_cfg, (cfg || {}));

        var $this = $(ele),
            flag = false,
            hover_flag = false,
            li_width = $this.find(".J_slide-item>li").width(),
            li_margin_h = parseInt($this.find(".J_slide-item>li").css("margin-left")) + parseInt($this.find(".J_slide-item>li").css("margin-right")) - 0,
            _now_left = $this.find(".J_slide-box").position().left,
            slide_width = (li_width + li_margin_h) * 3,
            _width = $this.find(".J_slide-item").width();

        var _slide_next = function(){
            if(flag){
                $this.find(".J_slide-box").stop(true, true);
                //return ;
            }

            flag = true;
            if(Math.abs(_now_left) < (_width - slide_width)){
                _now_left = _now_left - slide_width;

                $this.find(".J_slide-box").animate({
                    "left": _now_left
                }, (_cfg["speed"] || 800), function(){
                    flag = false;
                });
            }else{
                _now_left = 0;
                $this.find(".J_slide-box").animate({
                    "left": _now_left
                }, (_cfg["speed"] || 800), function(){
                    flag = false;
                });
                console.log("最后一个了");
            }
        };

        var _slide_prev = function(){
            if(flag){
                $this.find(".J_slide-box").stop();
                //return ;
            }

            flag = true;
            if(_now_left < 0){
                _now_left = _now_left + slide_width;

                $this.find(".J_slide-box").animate({
                    "left": _now_left
                }, (_cfg["speed"] || 800), function(){
                    flag = false;
                });
            }else{
                console.log("已经第一个了~~");
            }
        };

        $this.on("mouseenter", function(){
            hover_flag = true;
        });

        $this.on("mouseleave", function(){
            hover_flag = false;
        });

        $this.on("click", ".J_slide-prev", function(){
            _slide_prev();
        });

        $this.on("click", ".J_slide-next", function(){
            _slide_next();
        });

        var _auto = function(){
            console.log(hover_flag);
            if(!hover_flag){
                _slide_next();
            }
        };

        var _interval = function(){
            setInterval(function(){
                _auto();
            }, (_cfg["delay"] || 5000));
        }

        _interval();
    };

    $.fn.wSlide = function (cfg) {
        return $.each($(this), function (key, val) {
            var $this = $(this)
                , data = $this.data('wSlide');

            if (!data) {
                $(val).data('wSlide', (data = new wSlide($(val), cfg)));
            }
        });
    }

    $(function(){
        $(".J_slide-wrap").wSlide({
            "speed": 800,
            "delay": 5000
        });

    });

})(jQuery);