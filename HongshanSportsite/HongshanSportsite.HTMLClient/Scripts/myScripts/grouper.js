/**
 * 仿京东配送地址的jqgrid分组依据选择框
 * @authors tony (you@example.org)
 * @date    2015-03-17 09:11:49
 * @version $id$
 */

var jqGridGrouper = (function ($) {
    var module = {
        exceptionary: [], //当前tab页选中的项目,用于排除下个tab页中过滤掉之前tab页选中项
        groupdata: null, //s数组，存放对象形式为{id:xxx,name:xxx}
        pNode:null,
        //配置当前module中的参数
        config: function (config) {
            module.groupdata = config.groupdata;
            module.pNode = config.pNode;
        },

        /* 获取当前tab的选项集合 */
        getgrouplist: function (result) {
            var html = ["<ul class='groupBy-list'>"];
            var longhtml = [];
            var longerhtml = [];
            if (result && result.length > 0) {
                for (var i = 0, j = result.length; i < j; i++) {
                    if (module.exceptionary.indexOf(result[i].id) != -1) continue;
                    result[i].name = result[i].name.replace(" ", "");
                    if (result[i].name.length > 12) {
                        longerhtml.push("<li class='longer-area'><a href='#1' data-value='" + result[i].id + "'>" + result[i].name + "</a></li>");
                    } else if (result[i].name.length > 5) {
                        longhtml.push("<li class='long-area'><a href='#1' data-value='" + result[i].id + "'>" + result[i].name + "</a></li>");
                    } else {
                        html.push("<li><a href='#1' data-value='" + result[i].id + "'>" + result[i].name + "</a></li>");
                    }
                }
            };

            html.push(longhtml.join(""));
            html.push(longerhtml.join(""));
            html.push("</ul>");
            return html.join("");
        },

        onItemsClick: function (clickitem) {
            var tabs = $('ul.tab > li');

            var that = clickitem;
            var tabindex = parseInt($(that).parent().parent().hide().attr("data-area")); //隐藏当前点击的选项表，并获取当前选择项目的序号

            var nexttabindex = tabindex + 1;
            // var curtabstr =  "#grouttab_" + tabindex;
            var curtab = $('.tab li[data-index =' + tabindex + ']');
            //tab页大于3个时，不允许继续添加tab
            if (tabs.length > 2) {
                curtab.removeClass('curr').find('em').html($(that).text());
                module.changeSummaryText();
                return;
            };

            var nexttab = $('.tab li[data-index = ' + nexttabindex + ']');
            module.exceptionary.push(parseInt($(that).find('a').attr('data-value')));

            if (nexttab.length > 0) {
                nexttab.addClass('curr').show();
            } else {
                var newtabhtml = '<li data-index="' + nexttabindex + '" data-widget="tab-item" class="curr"><a href="#1" class="hover"><em>请选择</em><i></i></a></li>';
                var newitemshtml = '<div class="mc curr" data-area="' + nexttabindex + '" data-widget="tab-content"></div>';
                // $(curtabstr).removeClass('curr').after(newtabhtml);
                curtab.removeClass('curr').after(newtabhtml);
                //给新添加的tab页添加事件
                $('.tab li[data-index = ' + nexttabindex + ']').click(function (e) {
                    module.onTabClick(this);
                });

                $(that).parent().parent().removeClass('curr').after(newitemshtml);

                $(".curr").show();

            }

            $('.mc[data-area=' + nexttabindex + ']').html(module.getgrouplist(module.groupdata)).show();
            //给新添加的表头添加点击
            $('.mc[data-area = ' + nexttabindex + '] ul li').click(function (e) {
                module.onItemsClick(this);
            });

            curtab.removeClass('curr').find('em').html($(that).text());
            module.changeSummaryText();
        },

        /* 用户点击tab页时的事件 */
        onTabClick: function (tabitem) {
            //若用户点击当前选中的节点不做操作
            if ($(tabitem).attr('class') != 'curr') {
                $(tabitem).addClass('curr');
                $(tabitem).find('em').html('请选择');
                var nextall = $(tabitem).nextAll(); //当前tab之后的所有tab数组
                for (var i = 0, len = nextall.length; i < len; i++) module.exceptionary.pop(); //删除当前tab之后选中的项目
                nextall.remove(); //移除当前节点之后的所有兄弟节点
                var curitemnode = $('.mc[data-area=' + $(tabitem).attr("data-index") + ']');
                curitemnode.nextAll().remove(); //移除当前tab之后所有tab的选择面板
                curitemnode.addClass('curr').show(); //显示当前选中tab的选择面板
                module.changeSummaryText();
            }
        },

        /* 更改顶部结果文本显示 */
        changeSummaryText: function () {
            var tabs = $('.tab em');
            var tabstrs = $(tabs[0]).text();
            for (var i = 1, len = tabs.length; i < len; i++) {
                if ($(tabs[i]).text() == '请选择') {
                    continue;
                };
                tabstrs += '>' + $(tabs[i]).text();
            }
            //$("#result-stock .text div").html(tabstrs);
            module.resultStock.find('.text div').html(tabstrs);
        },

        init: function (conf) {
            module.config(conf);
            if (!module.groupdata ||!module.pNode|| module.groupdata.length === 0) {
                return;
            }
            module.resultStock = module.pNode.find('.resultStock');

            var grouphtml = '<div class="content"><div data-widget="tabs" class="m tabs-stock" id="tabs-stock">' + '<div class="mt">' + '    <ul class="tab">' + '        <li data-index="0" data-widget="tab-item" class="curr"><a href="#1" class="hover"><em>请选择</em></a></li>' + '    </ul>' + '    <div class="stock-line"></div>' + '</div>' + '<div class="mc curr" data-area="0" data-widget="tab-content" id="groupItems_0"></div>' + '</div></div>';
            //var resultStockTxt = $("#result-stock .text");
            var resultStockTxt = module.resultStock.find('.text');
            //resultStockTxt.after(grouphtml); //构建最初始html页面
            resultStockTxt.after(grouphtml);

            //绑定点击事件
            resultStockTxt.unbind("click").bind("click", function () {
                //$('#result-stock').addClass('hover');
                module.resultStock.addClass('hover');
                //$("#result-stock .content").show();
                module.resultStock.find('.content').show();
            });

            ////点击关闭按钮事件
            //$('#groupBy-closeBtn').click(function (e) {
            //    $('#result-stock').removeClass('hover');
            //    e.stopPropagation(); //防止冒泡事件
            //});

            //为第一个tab页添加数据项
            var firstPanel = module.pNode.find('.mc.curr');
            //$('#groupItems_0').html(module.getgrouplist(module.groupdata));
            firstPanel.html(module.getgrouplist(module.groupdata));
            firstPanel.find('ul li').click(function(e) {
                module.onItemsClick(this);
            });
            //$("#groupItems_0 ul li").click(function (e) {
            //    module.onItemsClick(this);
            //});

            //第一个tab的点击事件
            //$("#tabs-stock .mt .tab li").click(function (e) {
            //    module.onTabClick(this);
            //});
            module.pNode.find('.m.tabs-stock .mt .tab li').click(function(e) {
                module.onTabClick(this);
            });
        }
    };

    var groupMgr = (function () {
        var groupModule = {
            groupCols: null, //从数据库中读取的用户可见列
            pNode: null, //html页面中包含选择器的父节点
            jqGridId:null,
            config: function (conf) {
                groupModule.groupCols = conf.groupCols;
                groupModule.pNode = conf.pNode;
                groupModule.jqGridId = conf.jqGridId;
            },
            init: function (conf) {
                groupModule.config(conf);
                if (!groupModule.groupCols || !groupModule.pNode || !groupModule.jqGridId || groupModule.groupCols.length === 0) {
                    return;
                };
                var groupItems = groupModule.getGroupData();
                groupModule.pNode.append("<div id='groupBy-ul' style='margin:5px auto 10px auto;'><div id='summary-stock'><div class='dt'>分组依据：</div><div class='dd'><div class = 'resultStock' id='result-stock'><div class='text'><div>请选择</div></div><div class='close'></div></div></div></div></div>");

                //点击关闭按钮事件
                groupModule.pNode.find('.close').click(function (e) {
                    groupModule.pNode.find('.resultStock').removeClass('hover');
                    e.stopPropagation(); //防止冒泡事件
                });

                module.init({
                    'groupdata': groupItems,
                    'pNode':groupModule.pNode
                });
            },
            getGroupData: function () {
                var groupItems = [];
                for (var i = 0; i < groupModule.groupCols.length; i++) {
                    var temp = {};
                    temp.id = i;
                    temp.name = groupModule.groupCols[i];
                    groupItems.push(temp);
                };

                return groupItems;
            }
        };
        return {
            init: groupModule.init
        };
    })();

    return groupMgr;
})(jQuery);
