;(function($){
    var slide = function($elm,new_idx,flag){
        $elm.find(".Slide-ul-small li").removeClass("active");
        $elm.find(".Slide-ul-small li").eq(new_idx).addClass("active");
        $elm.find(".Slide-ul-big li").fadeOut(1500);
        $elm.find(".Slide-ul-big li").eq(new_idx).fadeIn(1500);

        if(flag){
            timer($elm);
        }
    };

    var timer = function($elm){
        setTimeout(function(){
            var _len = $elm.find(".Slide-ul-small li").length,
                old_idx = parseInt($elm.find(".Slide-ul-small li.active").attr("data-index")) || 0,
                new_idx = old_idx + 1;
            new_idx = new_idx >= _len ? 0 : new_idx;

            slide($elm, new_idx, true);
        },5000);
    };

    $.fn.bannerSlide = function(cfg){
        var _this  = this;

        timer(_this);

        _this.off("click.bannerSlideClick");

        _this.on("click.bannerSlideClick", ".Slide-ul-small li", function(){
            slide(_this, $(this).index());
        });

        return this;
    }

    $(function () {
        var a = $(".slide-demo").bannerSlide();
    });


})(jQuery);