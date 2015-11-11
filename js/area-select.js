if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp*/ ) {
        var len = this.length;

        if (typeof fun != "function")
            throw new TypeError();

        var res = new Array();
        var thisp = arguments[1];

        for (var i = 0; i < len; i++) {
            if (i in this) {
                var val = this[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, this))
                    res.push(val);
            }
        }
        return res;
    };
}

jQuery(function($) {

    var $province = $('select[name="province"]'),
        $city = $('select[name="city"]'),
        $downtown = $('select[name="downtown"]');

    var provinceSel = $province.attr("rel"),
    	citySel = $city.attr("rel"),
    	downtownSel = $downtown.attr("rel");

    var data = _arrSort(_get_areaFilter(area_json, 1));

    $province.append(_get_html(data)).iSelect("update");


    $province.on("change", function() {
        _provinceChange($(this).val());
    })

    $city.on('change', function() {
        _cityChange($(this).val());
    });

    if(provinceSel){
 		$province.val(provinceSel).iSelect('update');
        _provinceChange(provinceSel);
    }

    if(provinceSel && citySel){
		_cityChange(citySel);
		$city.val(citySel).iSelect("update");
    }

	if(provinceSel && citySel && downtownSel){
		$downtown.val(downtownSel).iSelect("update");
	}


    function _get_html(data) {
        var html = '';
        $(data).each(function() {
            html += '<option value="' + this.id + '">' + this.name + '</option>'
        });
        return html;
    }

    function _arrSort(data) {
        data.sort(function(obj1, obj2) {
            return obj1.id - obj2.id;
        });
        return data;
    }

    function _get_areaFilter(list, _index) {
        function getChina(element, index, array) {
            return (element.parentId == _index);
        }
        var china = list.filter(getChina);
        return china;
    }

    function _provinceChange(id) {
        var data = _arrSort(_get_areaFilter(area_json, id));
        $city.html('<option value="-1">请选择市</option>' + _get_html(data)).val('-1').iSelect("update");
        $downtown.html('<option value="-1">请选择区</option>').iSelect("update");
    }

    function _cityChange(id) {
        var data = _arrSort(_get_areaFilter(area_json, id));
        $downtown.html('<option value="-1">请选择区</option>' + _get_html(data)).val('-1').iSelect("update");
    }


});
