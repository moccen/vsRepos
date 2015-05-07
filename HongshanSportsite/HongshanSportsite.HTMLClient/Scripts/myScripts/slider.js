/*
SliderJS - jQuery Slider with CSS Transitions
*/
var supports = (function () {
    //'use strict';
    var style = document.createElement('div').style,
        vendors = ['', 'Moz', 'Webkit', 'Khtml', 'O', 'ms'],
        prefix, i, l;
    return function (prop) {
        if (typeof style[prop] === 'string') {
            return true;
        }
        prop = prop.replace(/^[a-z]/, function (val) {
            return val.toUpperCase();
        });
        for (i = 0, l = vendors.length; i < l; i += 1) {
            prefix = vendors[i] + prop;
            if (typeof style[prefix] === 'string') {
                return true;
            }
        }
        return false;
    };
})();
var slider = (function ($) {
    //'use strict';
    /*global jQuery, setTimeout, clearTimeout*/
    var module = {
        npos: 0,
        timer: null,
        config: function (config) {
            module.target = config.target;
            module.container = module.target.find('.slider-wrapper');
            module.sWidth = module.container.find('.slide').outerWidth(true);
            module.max = module.container.find('.slide').length;
            module.tWidth = module.sWidth * module.max;
            module.time = config.time || 5000;
        },
        early: function () {
            var self = this,
                slider = self.target,
                i, l;
            self.container.css({
                width: self.tWidth
            });
            slider.append(self.pager());
            for (i = 0, l = self.max; i < l; i += 1) {
                self.items(i + 1).insertBefore($('.slider-nav .next').parents('li'));
            }
            slider.find('.bullet:first').addClass('active');
        },
        events: function () {
            var self = this,
                slider = self.target;
            slider.on('click', '.slider-nav a', function (e) {
                e.preventDefault();
                var $this = $(this),
                    index = $this.html();
                if ($this.hasClass('next')) {
                    self.next();
                }
                if ($this.hasClass('prev')) {
                    self.prev();
                }
                if ($this.hasClass('bullet')) {
                    self.bullets(index);
                    self.update();
                }
            });
            self.container.on({
                mouseenter: function () {
                    clearTimeout(self.timer);
                },
                mouseleave: function () {
                    module.auto();
                }
            });
        },
        slip: function () {
            if (supports('transition')) {
                module.container.css({
                    left: -module.npos * module.sWidth
                });
            } else {
                module.container.animate({
                    left: -module.npos * module.sWidth
                }, 800);
            }
        },
        bullets: function (index) {
            clearTimeout(module.timer);
            module.auto();
            module.npos = parseInt(index, null) - 1;
            module.slip();
        },
        prev: function () {
            clearTimeout(module.timer);
            module.auto();
            module.npos -= 1;
            if (module.npos < 0) {
                module.npos = module.max - 1;
            }
            module.slip();
            module.update();
        },
        next: function () {
            clearTimeout(module.timer);
            module.auto();
            module.npos += 1;
            if (module.npos > (module.max - 1)) {
                module.npos = 0;
            }
            module.slip();
            module.update();
        },
        update: function () {
            var self = this,
                slider = self.target;
            slider.find('.bullet').removeClass('active');
            slider.find('.bullet').eq(self.npos).addClass('active');
        },
        auto: function () {
            var self = this;
            self.timer = setTimeout(self.next, self.time);
        },
        pager: function () {
            var nav = $('<ul class="slider-nav"><li><a href="#" class="control prev">Prev</a></li><li><a href="#" class="control next">Next</a></li></ul>');
            return nav;
        },
        items: function (i) {
            var item = $('<li><a class="bullet" href="#">' + i + '</a></li>');
            return item;
        },
        init: function (config) {
            module.config(config);
            if (!module.max || module.max === 1) {
                return;
            }
            module.auto();
            module.events();
            module.early();
        },
        clearAll: function () {
            var self = module;
            if (self.timer) {
                clearTimeout(self.timer);
            };
            if (self.container) {
                self.container.off();
                self.container.removeAttr('style');
            };
            if (self.target) {
                self.target.off();
            }
        }
    };
    return {
        init: module.init,
        clear: module.clearAll
    };
}(jQuery));

var albumMgr = (function () {
    var module = {
        //e是点击的相册连接
        init: function (e) {
            var stadiumId = e.getAttribute('data-para');
            //$('#albumMask').css({ 'display': 'block' });
            //$('#backgroundMask').css({ 'opacity': 0.8 });
            //$('#backgroundMask').fadeTo(500, 0.8);
            if (stadiumId == 'undefined') {
                windows.alert("can not get stadium ID!");
                return;
            }

            $('#albumMask').fadeIn(500);
            $('#loadingAlbum').css({ 'display': 'block' });
            myapp.activeDataWorkspace.ApplicationData.StadiumQueryByIds(stadiumId)
                .expand('StadiumPhotoCollection')
                .execute()
                .then(function (stadiumItem) {
                    var rslt = stadiumItem.results[0];
                    if (rslt && rslt.StadiumPhotoCollection && rslt.StadiumPhotoCollection.array.length > 0) {
                        $('#loadingAlbum').hide();
                        module.showpic(stadiumItem.results[0].StadiumPhotoCollection.array);
                    } else {
                        $('#albumMask').css({ 'display': 'none' });
                        $('#loadingAlbum').css({ 'display': 'none' });
                        //module.close();
                        window.alert("no photo now !");
                    }
                });
            //window.alert(stadiumName);
        },
        showpic: function (imgdata) {
            if (!imgdata) {
                return;
            }
            var pichtml = '';
            for (var i in imgdata) {
                if (i.Photo) {
                    pichtml += "<img src=\'data:image/svg;base64," + i.Photo + "\' class = \'slide\'/>";
                } else {
                    pichtml += "<img src=\'data:image/svg;base64," + imgdata[i].Photo + "\' class = \'slide\'/>";
                }
            }
            $('#picWrapper').html(pichtml);
            slider.init({
                target: $('.slider'),
                time: 6000
            });
            // var maskzindex = parseint($('#mask').css('z-index')) + 1;
            // $('.slider').css('z-index', maskzindex);
            // $('.slider').css('position', 'absolute');
            // 
            // $('#picwrapper').css('z-index', maskzindex);
            // $('ul.slider-nav > li').css('z-index', maskzindex);
            // $('ul.slider-nav > li').css('position', 'absolute');
        },
        close: function () {
            $('#albumMask').fadeOut(500);
            slider.clear();
            $('#picWrapper img').remove();
            $('.slider-nav').remove();
        }
    };
    return {
        init: module.init,
        show: module.showpic,
        close: module.close
    };
})();