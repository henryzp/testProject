;(function($, undefined) {
    /**
     * todo:
     * 1) 当点击 .ui-select-option-selected 时, 不应触发 change 事件
     * 2) 弹出框位置判断
     * 3) 优化 api 接口
     */

    var iSelect = function(element, config) {
        this.element = $(element);
        config = config || {};

        this.render(config);

        // 监听 <select>
        var _this = this;
        _this.element.on('change', function() {
            if (_this.changeBySelf) {
                _this.changeBySelf = false;
                return;
            }
            if (!_this.TEMPLATE_ITEM) {
                _this.setContent();
            }
            _this.select(_this.element[0].selectedIndex);
        });
    }
    iSelect.prototype = {
        constructor: iSelect

        ,
        defaults: {
            triggerType: 'click',
            maxHeight: 250,
            zIndex: 999,
            scrollEffect: 'http://topcoat.io/topcoat-effeckt/dist/#0'
        }

        ,
        setOptions: function(config) {
            var _this = this;
            if (_this.element.attr('data-maxheight')) {
                config.maxHeight = _this.element.attr('data-maxHeight');
            }
            if (_this.element.attr('triggerType')) {
                config.triggerType = _this.element.attr('data-triggerType');
            }
            if (_this.element.attr('data-zindex')) {
                config.zIndex = _this.element.attr('data-zindex');
            }
            if (_this.element.attr('title')) {
                config.title = _this.element.attr('title');
            }
            if (_this.element.attr('data-change-disable')) {
                config.changeDisable = true;
            }
            if (_this.element.attr('data-position')) {
                config.position = _this.element.attr('data-position');
            }

            _this.opts = $.extend({}, _this.defaults, config);


            return _this;
        }

        ,
        renderDOM: function() {
            var _this = this;
            _this.TEMPLATE_BOX = $(_this.HEAD_TEMPLATE);
            _this.TEMPLATE_HD = $('.ui-select-hd', _this.TEMPLATE_BOX);
            _this.TEMPLATE_TXT = $('.ui-select-txt', _this.TEMPLATE_BOX)
                .css({
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                });
            _this.TEMPLATE_ARROW = $('.ui-select-arrow', _this.TEMPLATE_BOX);

            _this.TEMPLATE_POP = $(_this.POP_TEMPLATE);
            _this.TEMPLATE_BD = $('.ui-select-bd', _this.TEMPLATE_POP);
            _this.TEMPLATE_CONTENT = $('.ui-select-content', _this.TEMPLATE_POP);
            _this.TEMPLATE_FT = $('.ui-select-ft', _this.TEMPLATE_POP);
            _this.TEMPLATE_RESULT = $('.ui-select-result', _this.TEMPLATE_POP);

            _this.element.after(_this.TEMPLATE_BOX);

            // 添加 mini <select>
            if (_this.element.attr('data-select-type')) {
                _this.TEMPLATE_BOX.addClass('ui-select-mini');
                _this.TEMPLATE_POP.addClass('ui-select-mini');
            }
            return _this;
        }

        ,
        renderData: function() {
            var _this = this,
                options = _this.element[0].options,
                children = _this.element.children();

            _this.selected = $('option:selected', _this.element);
            _this.NAME = _this.element.attr('data-name') || _this.element.attr('name');
            _this.MULTIPLE = !!_this.element.prop('multiple');
            _this.DISABLED = !!_this.element.prop('disabled');

            // 在某些情况下无法获取 option:selected. (不确定是那些情况)
            // 2014-06-23 18:13
            if (!_this.selected.length) {
                _this.selected = $('option', _this.element).eq(0);
            }

            if (!_this.MULTIPLE) {
                // 单选的时候, 如果有多个被选中, 取第一个.
                _this.selected = _this.selected.eq(0);
            }
            _this.data = {
                options: options // 类似于 select.options
                    ,
                children: [],
                disabled: _this.DISABLED
            };
            $.each(children, function(i, item) {
                if (item.tagName.toLowerCase() === 'option') {
                    _this.data.children.push(item);
                } else {
                    var optGroup = {
                        label: item.getAttribute('label'),
                        children: []
                    };
                    $.each($(item).children(), function(i, item) {
                        optGroup.children.push(item);
                    });
                    _this.data.children.push(optGroup);
                }
            });
            return _this;
        }

        ,
        renderTrigger: function() {
            var _this = this;

            if (_this.opts.title) {
                var options = _this.data.options,
                    _val = options[0].text;
                options[0].text = _this.opts.title;
            }

            var width = _this.element.outerWidth();
            if (width <= 0) {
                var clone = _this.element.clone();
                clone.css({
                    position: 'absolute',
                    visibility: 'hidden',
                    display: 'inline-block'
                });
                $('body').append(clone);
                width = clone.outerWidth();
                clone.remove();
            }

            _val && (options[0].text = _val);

            _this.TEMPLATE_BOX.addClass('ui-select-' + _this.NAME);
            _this.TEMPLATE_TXT.css('width', width - 15); // 15 为下拉框箭头的宽度

            _this.setTitle(_this.selected[0].text, _this.selected[0].value);
            _this.element.css('display', 'none');
            if (_this.DISABLED) {
                _this.disable();
            }
            return _this;
        }

        ,
        setTitle: function(title, value) {
            var _this = this;
            if (!_this.opts.changeDisable) {
                _this.TEMPLATE_TXT.attr('data-value', value || title)
                    .attr('title', title)
                    .html(title);
            } else {
                _this.TEMPLATE_TXT.attr('title', _this.opts.title)
                    .html(_this.opts.title);
            }
        }

        ,
        setContent: function(data) {
            var _this = this;
            var _children = function() {
                // 按照 <optgroup> 以及  _this.data.children 重新编组.
                var arr = [],
                    temp = [];
                $.each(data || _this.data.children, function(i, item) {
                    if (item.children.length) {
                        if (temp.length) {
                            arr.push(temp);
                            temp = [];
                        }
                        arr.push(item);
                    } else {
                        temp.push(item);
                    }
                });
                if (temp.length) {
                    arr.push(temp);
                }
                return arr;
            }();


            var htmlStr = '',
                index = 0;
            $.each(_children, function(i, items) {
                if (items.length) {
                    // items 只可能是数组 或 对象. 所以, 判断类型时, 可以判断其 length 属性
                    items = {
                        label: '',
                        children: items
                    };
                }
                htmlStr += '<div class="ui-select-group"><dl>';
                if (items.label) {
                    htmlStr += '<dt class="ui-select-group-title">' + items.label + '</dt>';
                }
                $.each(items.children, function(i, item) {
                    var cls = 'ui-select-option';
                    var selected = 0,
                        disabled = 0;
                    if (item.selected) {
                        cls += ' ui-select-option-selected';
                        selected = 1;
                    }
                    if (item.disabled) {
                        cls += ' ui-select-option-disabled';
                        disabled = 1;
                    }
                    htmlStr += '<dd class="' + cls + '"' + ' data-value="' + item.value + '"' + ' data-index="' + item.index + '"' + ' data-selected="' + selected + '"' + ' data-disabled="' + disabled + '"' + '>' + item.text + '</dd>';
                });
                htmlStr += '</dl></div>';
            });
            _this.TEMPLATE_CONTENT.html(htmlStr);
            _this.TEMPLATE_ITEM = $('.ui-select-option', _this.TEMPLATE_CONTENT);

            // <div class="ui-select-result">
            // 及 <div class="ui-select-ft"> 没有理想处理方式.
            // so, 暂时先隐藏掉
            _this.TEMPLATE_RESULT.css('display', 'none');
            _this.TEMPLATE_FT.css('display', 'none');

            $('body').append(_this.TEMPLATE_POP);

            // 重置高度为 auto. 2014-01-14 16:27
            _this.TEMPLATE_POP.css({
                height: 'auto',
                overflowY: 'visible'
            });

            if (_this.opts.maxHeight < _this.TEMPLATE_POP.height()) {
                _this.TEMPLATE_POP.css({
                    height: _this.opts.maxHeight,
                    overflowY: 'scroll'
                });
            }

            var hover_cls = 'ui-select-hover ui-select-' + _this.NAME + '-hover',
                focus_cls = 'ui-select-focus ui-select-' + _this.NAME + '-focus';

            // 如果是 update 时, 需要移除clss名
            _this.TEMPLATE_BOX.removeClass(hover_cls + ' ' + focus_cls);
            _this.TEMPLATE_POP.removeClass(hover_cls + ' ' + focus_cls);

            return _this;
        }

        ,
        render: function(config, callback) {
            var _this = this;

            if (typeof config == 'object') {
                if (!_this.element.data('iSelect')) {
                    _this.setOptions(config)
                        .renderDOM();
                }
            } else {
                switch (config) {
                    case 'disable':
                        _this.disable(callback);
                        return;
                    case 'enable':
                        _this.enable(callback);
                        return;
                    case 'update':
                        break;
                    case 'change':
                        _this.change(callback);
                        return;
                    case 'destroy':
                        _this.destroy(callback);
                        return;
                }
            }
            _this.renderData()
                .renderTrigger();
            /*
             2013-12-27 14:27
             因为 setContent 只会执行一次, 所以执行 _this.update, 可以强制更新下 下拉框内容.
             又因, setContent 需要在 renderData 后执行, 所以, 没有放到 switch 语句中
             */
            if (config === 'update') {
                _this.update(callback)
                    .hide();
            } else {
                _this.bind();
            }
            return _this;
        }

        ,
        show: function() {
            var _this = this;
            if (!_this.TEMPLATE_ITEM) {
                _this.setContent();
            }
            var rect = _this.TEMPLATE_HD[0].getBoundingClientRect(),
                scrollTop = $(window).scrollTop(),
                scrollLeft = $(window).scrollLeft();
            _this.TEMPLATE_POP.css({
                visibility: 'visible',
                display: 'block',
                position: 'absolute',
                width: 'auto' // 重置宽度为 auto. 2014-01-14 16:27
                    ,
                top: rect.bottom + scrollTop,
                left: rect.left + scrollLeft,
                zIndex: _this.opts.zIndex
            }).addClass('ui-select-focus');
            // 显示在触发器上方
            if (_this.opts.position == 'top') {
                _this.TEMPLATE_POP.css({
                    marginTop: -((rect.bottom - rect.top) + _this.TEMPLATE_POP.height())
                });
            }
            _this.TEMPLATE_POP.css({
                width: Math.max(_this.TEMPLATE_HD.width(), _this.TEMPLATE_POP.width())
            });


            // 移除选中样式
            if (_this.opts.changeDisable) {
                _this.TEMPLATE_ITEM.removeClass('ui-select-option-selected');
            }

            _this.TEMPLATE_BOX.addClass('ui-select-focus');

            return _this;
        }

        ,
        hide: function() {
            var _this = this;
            _this.TEMPLATE_POP.css({
                display: 'none',
                visibility: 'hidden'
            }).removeClass('ui-select-focus');
            return _this;
        }

        /**
         * @param string|number
         * 当参数类型为 string 时, 匹配 value, 并选中
         * 当参数类型为 number 时, 匹配 index, 并选中
         * 当参数类型为 object 时, 匹配 option 对象, 并选中
         *
         * 如果无参数, 返回被选中的jQuery对象
         */
        ,
        select: function(item, isTrigger) {
            var _this = this,
                $selected, index;
            if (typeof isTrigger === 'undefined') {
                isTrigger = true;
            }


            if (typeof item == undefined) {
                return _this.selected;
            } else if (typeof item == 'number') {
                // 2014-05-30 10:12
                // 在 .trigger('change') 时, 选择一个不存在的 option 时, 
                // item 值为 -1. 此时会出现bug
                if (item > 0 && item < _this.data.options.length) {
                    $selected = $(_this.data.options[item]);
                }

            } else if (typeof item == 'string') {
                var value = item;
                $.each(_this.data.options, function(i, item) {
                    if (item.getAttribute('value') == value) {
                        $selected = $(item);
                        return;
                    }
                });
            } else {
                $selected = $(item);
            }

            if (!$selected || !$selected.length) {
                $selected = $(_this.data.options[0]);
            }

            index = $selected[0].index;
            if ($selected[0].disabled) {
                return;
            }

            // 如果已选中, 就不再触发.
            if ($selected[0].selected) {
                isTrigger = false;
            }

            if (!_this.TEMPLATE_ITEM) {
                _this.setContent();
            }

            // 选中 <option>          
            if (!_this.MULTIPLE) {
                if ($selected[0].selected && _this.changeBySelf) return;
                _this.TEMPLATE_ITEM.removeClass('ui-select-option-selected')
                    .attr('data-selected', 0);
                _this.TEMPLATE_ITEM.eq(index)
                    .addClass('ui-select-option-selected')
                    .attr('data-selected', 1);
                $selected[0].selected = true;
                _this.hide();
            } else {
                if ($selected[0].selected) {
                    _this.TEMPLATE_ITEM.eq(index)
                        .removeClass('ui-select-option-selected')
                        .attr('data-selected', 0);
                    $selected[0].selected = false;
                } else {
                    _this.TEMPLATE_ITEM.eq(index)
                        .addClass('ui-select-option-selected')
                        .attr('data-selected', 1);
                    $selected[0].selected = true;
                }
            }

            _this.selected = $('option:selected', _this.trigger);
            _this.setTitle($selected[0].text, $selected[0].value);


            // 触发 <select> 的 onchange 事件
            if (isTrigger) {
                _this.changeBySelf = true;
                _this.element.trigger('change');
            }

            if (_this.opts.changeDisable) {
                $selected.trigger('click');
            }

            return _this;
        }

        ,
        update: function(callback) {
            var _this = this
            _this.setContent();
            return _this;
        }

        ,
        change: function(callback) {
            var _this = this;
            if (callback) {
                return;
                _this.element.on('change', function() {
                    callback(_this.element, _this.selected);
                });
            }
            return _this;
        }

        ,
        disable: function(callback) {
            var _this = this;
            _this.DISABLED = true;
            _this.element.prop('disabled', _this.DISABLED);
            _this.TEMPLATE_BOX.addClass('ui-select-disabled');
            if (callback) {
                callback(_this.element);
            }
            return _this;
        }

        ,
        enable: function(callback) {
            var _this = this;
            _this.DISABLED = false;
            _this.element.prop('disabled', _this.DISABLED);
            _this.TEMPLATE_BOX.removeClass('ui-select-disabled');
            if (callback) {
                callback(_this.element);
            }
            return _this;
        }

        ,
        destroy: function() {
            var _this = this;
            _this.element.show();
            _this.TEMPLATE_BOX && _this.TEMPLATE_BOX.remove();
            _this.TEMPLATE_POP && _this.TEMPLATE_POP.remove();
            $.removeData(_this.element, 'iSelect');
        }

        ,
        bind: function() {
            var _this = this,
                NAME = _this.NAME,
                DISABLED = _this.DISABLED,
                timer;

            /*
             2014-05-09 14:43
             多次 iSelect() 会造成事件绑定多次
             */
            if (_this._is_binded) {
                return;
            }
            _this._is_binded = true;

            var hover_cls = 'ui-select-hover ui-select-' + NAME + '-hover',
                focus_cls = 'ui-select-focus ui-select-' + NAME + '-focus';

            // 滑过
            var _hover = function() {
                if (_this.TEMPLATE_BOX.hasClass('ui-select-disabled')) {
                    return;
                }
                timer && (clearTimeout(timer), timer = null);
                _this.TEMPLATE_BOX.addClass(hover_cls);
                _this.TEMPLATE_POP.addClass(hover_cls);
                _this.element.trigger('mouseover');
            }

            // 获取焦点
            var _focus = function() {
                if (_this.TEMPLATE_BOX.hasClass('ui-select-disabled')) {
                    return;
                }
                _this.TEMPLATE_BOX.addClass(focus_cls);
                _this.TEMPLATE_POP.addClass(focus_cls);
                _this.element.trigger('focus');
                _this.show();
            };

            // 失去焦点
            var _blur = function() {
                if (_this.TEMPLATE_BOX.hasClass('ui-select-disabled')) {
                    return;
                }
                timer = setTimeout(function() {
                    _this.TEMPLATE_BOX.removeClass(hover_cls + ' ' + focus_cls);
                    _this.TEMPLATE_POP.removeClass(hover_cls + ' ' + focus_cls);
                    _this.TEMPLATE_ITEM && _this.TEMPLATE_ITEM.removeClass('ui-select-option-hover');
                    _this.hide();
                }, 200);
                _this.element.trigger('blur');
            }

            // <option> 上移动
            var _move = (function() {
                var i = 0;
                return function(e) {
                    // 过滤 80% 无用的移动, 减少 DOM 操作
                    if (++i % 5) return;
                    var $target = $(e.target);
                    if ($target.hasClass('ui-select-option')) {
                        _this.TEMPLATE_ITEM.removeClass('ui-select-option-hover');
                        $target.addClass('ui-select-option-hover');
                    }
                }
            })();

            // 选择
            var _click = function(e) {
                var $target = $(e.target);
                /*
                 if (!$target.hasClass('ui-select-option')) {
                 return;
                 }
                 */
                _this.select(~~$target.attr('data-index'));
            }


            _this.TEMPLATE_BOX.on('mouseenter', function() {
                _hover();
            }).on('click', function() {
                _focus();
            }).on('mouseleave', function() {
                _blur();
            });

            _this.TEMPLATE_POP.on('mouseenter', function() {
                _hover();
            }).on('mouseleave', function() {
                _blur();
            }).on('mousemove', function(e) {
                _move(e);
            }).on('click', function(e) {
                _click(e);
            });

            return _this;
        }

        ,
        HEAD_TEMPLATE: '<div class="ui-select">' +
            '<div class="ui-select-hd">' +
            '<div class="ui-select-txt"></div>' +
            '<div class="ui-select-arrow"><b></b><i></i></div>' +
            '</div>' +
            '</div>'

        ,
        POP_TEMPLATE: '<div class="ui-select-pop">' +
            '<div class="ui-select-bd">' +
            '<div class="ui-select-content"></div>' +
            '<div class="ui-select-ft" style="display: none;"></div>' +
            '<div class="ui-select-result" style="display: none;"></div>' +
            '</div>' +
            '</div>'
    }

    /*

     // 渲染. 如果已经渲染过, 退出
     $('select').iSelect();

     // 禁用
     $('select').iSelect('disable');

     // 更新
     $('select').iSelect('update');

     怎么去更新？？？？
     更新时,
     渲染<select>数据
     渲染标题
     渲染内容
     再次绑定事件（还是事件委托？）




     */

    !(function() {
        var old = $.fn.iSelect;
        $.fn.iSelect = function(config, callback) {
            return this.each(function() {
                var $this = $(this),
                    rect = $this[0].getBoundingClientRect(),
                    data = $this.data('iSelect'),
                    opts = $.extend({}, config);
                opts = typeof config === 'string' ? config : $.extend({}, config);
                if (!data) {
                    if ($this[0].tagName.toLowerCase() !== 'select' || !$this.children().length) {
                        return;
                    }
                    $this.data('iSelect', (data = new iSelect($this, opts)));
                } else {
                    data.render(opts, callback);
                }
            });
        }
        $.fn.iSelect.constructor = iSelect;
        $.fn.iSelect.defaults = {};
        $.fn.iSelect.noConflict = function() {
            $.fn.iSelect = old;
            return this;
        }
    })();

})(jQuery);

jQuery(function($) {
    if ($.fn.iSelect) {
        $('select').iSelect();
    }
})
