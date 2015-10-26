jQuery(function($){

	var $YearSelector = $(".sel-year"),
		$MonthSelector = $(".sel-month"),
		$DaySelector = $(".sel-day");

	var register = {
		init: function(){
			this.initBirth(); //初始化日期
		},
		initBirth: function(){
			var _this = this;
				
			$YearSelector.html('<option value="0">年</option>'); 
		   	$MonthSelector.html('<option value="0">月</option>'); 
		   	$DaySelector.html('<option value="0">日</option>'); 

		   	// 年份列表 
		   	var yearNow = new Date().getFullYear(); 
		   	var yearSel = $YearSelector.attr("rel"); 
		   	for (var i = yearNow; i >= 1900; i--) { 
		        var sed = yearSel==i?"selected":""; 
		        var yearStr = "<option value=\"" + i + "\" " + sed+">"+i+"</option>"; 
		        $YearSelector.append(yearStr); 
		   	} 

		   	$YearSelector.iSelect("update");
		 
		    // 月份列表 
		    var monthSel = $MonthSelector.attr("rel"); 
		    for (var i = 1; i <= 12; i++) { 
		        var sed = monthSel==i?"selected":""; 
		        if(String(i).length == 1){
		        	i = "0" + i;
		        }
		        var monthStr = "<option value=\"" + i + "\" "+sed+">"+i+"</option>"; 
		        $MonthSelector.append(monthStr); 
		    } 

		    $MonthSelector.iSelect("update");

		    $MonthSelector.change(function(){ 
		        _this._buildDay(); 
		    }); 
	      	$YearSelector.change(function(){ 
	         	_this._buildDay(); 
	      	}); 
	      	if($DaySelector.attr("rel")!=""){ 
	         	_this._buildDay(); 
	      	} 
		},
		_buildDay: function(){
			if ($YearSelector.val() == 0 || $MonthSelector.val() == 0) { 
	            // 未选择年份或者月份 
	            $DaySelector.html("日"); 
	        } else { 
	            $DaySelector.html("日"); 
	            var year = parseInt($YearSelector.val()); 
	            var month = parseInt($MonthSelector.val()); 
	            var dayCount = 0; 
	            switch (month) { 
	                 case 1: 
	                 case 3: 
	                 case 5: 
	                 case 7: 
	                 case 8: 
	                 case 10: 
	                 case 12: 
	                      dayCount = 31; 
	                      break; 
	                 case 4: 
	                 case 6: 
	                 case 9: 
	                 case 11: 
	                      dayCount = 30; 
	                      break; 
	                 case 2: 
	                      dayCount = 28; 
	                      if ((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) { 
	                          dayCount = 29; 
	                      } 
	                      break; 
	                 default: 
	                      break; 
	            } 
	                     
	            var daySel = $DaySelector.attr("rel"); 
	            for (var i = 1; i <= dayCount; i++) { 
	                var sed = daySel==i?"selected":""; 
	                if(String(i).length == 1){
			        	i = "0" + i;
			        }
	                var dayStr = "<option value=\"" + i + "\" "+sed+">" + i + "</option>"; 
	                $DaySelector.append(dayStr); 
	            }
	            $DaySelector.iSelect("update"); 
	        } 
	    }
	}

	register.init();

});