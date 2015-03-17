/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-03-15 18:39:14
 * @version $Id$
 */
/**
 *
 * @authors Your Name (you@example.org)
 * @date    2015-03-12 10:12:31
 * @version $Id$
 */

$(function() {
    //构建选择框最基本的html元素,mt:tab,mc:选择项
    var groupHtml = '<div class="content"><div data-widget="tabs" class="m tabs-stock" id="tabs-stock">' + '<div class="mt">' + '    <ul class="tab">' + '        <li data-index="0" data-widget="tab-item" class="curr" id="groutTab_0"><a href="#none" class="hover"><em>请选择</em></a></li>' + '    </ul>' + '    <div class="stock-line"></div>' + '</div>' + '<div class="mc curr" data-area="0" data-widget="tab-content" id="groupItems_0"></div>' + '</div></div>';
    var exceptionAry = [];

    $("#result-stock .text").after(groupHtml);

    // var areaTabContainer = $("#JD-stock .tab li");

    //绑定mouseover事件，激活窗口
    // $("#store-selector").unbind("mouseover").bind("mouseover", function() {
    //     $('#store-selector').addClass('hover');
    //     $("#store-selector .content").show();
    // });
    $("#result-stock").unbind("click").bind("click", function() {
        $('#result-stock').addClass('hover');
        $("#result-stock .content").show();
    });

    $('#groupBy-closeBtn').click(function(e) {
        $('#result-stock').removeClass('hover');
        e.stopPropagation();
    })


    var groupData = [{
        "id": 1,
        "name": "所属街道"
    }, {
        "id": 2,
        "name": "组织机构代码"
    }, {
        "id": 3,
        "name": "场地代码"
    }, {
        "id": 4,
        "name": "场地分布"
    }, {
        "id": 5,
        "name": "场地归属"
    }, {
        "id": 6,
        "name": "建成年份"
    }, {
        "id": 7,
        "name": "用地面积（㎡）"
    }]

    function getGroupList(result) {
        var html = ["<ul class='groupBy-list'>"];
        var longhtml = [];
        var longerhtml = [];
        if (result && result.length > 0) {
            for (var i = 0, j = result.length; i < j; i++) {
                if (exceptionAry.indexOf(result[i].id) != -1) continue;
                result[i].name = result[i].name.replace(" ", "");
                if (result[i].name.length > 12) {
                    longerhtml.push("<li class='longer-area'><a href='#none' data-value='" + result[i].id + "'>" + result[i].name + "</a></li>");
                } else if (result[i].name.length > 5) {
                    longhtml.push("<li class='long-area'><a href='#none' data-value='" + result[i].id + "'>" + result[i].name + "</a></li>");
                } else {
                    html.push("<li><a href='#none' data-value='" + result[i].id + "'>" + result[i].name + "</a></li>");
                }
            }
        } else {
            html.push("<li><a href='#none' data-value='" + currentAreaInfo.currentFid + "'> </a></li>");
        }
        html.push(longhtml.join(""));
        html.push(longerhtml.join(""));
        html.push("</ul>");
        return html.join("");
    };

    (function init() {
        $('#groupItems_0').html(getGroupList(groupData));
        $("#groupItems_0 ul li").click(function(e) {
            onItemsClidk(this);
        });

        function onItemsClidk(clickItem) {
            var tabs = $('ul.tab > li');

            var that = clickItem;
            var tabIndex = parseInt($(that).parent().parent().hide().attr("data-area")); //隐藏当前点击的选项表，并获取当前选择项目的序号

            var nextTabIndex = tabIndex + 1;
            // var curTabStr =  "#groutTab_" + tabIndex;
            var curTab = $('.tab li[data-index =' + tabIndex + ']');
            //tab页大于3个时，不允许继续添加tab
            if (tabs.length > 2) {
                curTab.removeClass('curr').find('em').html($(that).text());
                changeSummaryText();
                return;
            };

            var nextTab = $('.tab li[data-index = ' + nextTabIndex + ']');
            exceptionAry.push(parseInt($(that).find('a').attr('data-value')));

            if (nextTab.length > 0) {
                nextTab.addClass('curr').show();
                //$('.mc[data-area='+nextTabIndex+']').show();
                //$(curTabStr).removeClass('curr');
            } else {
                var newTabHtml = '<li data-index="' + nextTabIndex + '" data-widget="tab-item" class="curr"><a href="#none" class="hover"><em>请选择</em><i></i></a></li>';
                var newItemsHtml = '<div class="mc curr" data-area="' + nextTabIndex + '" data-widget="tab-content"></div>'
                    // $(curTabStr).removeClass('curr').after(newTabHtml);
                curTab.removeClass('curr').after(newTabHtml);
                //给新添加的tab页添加事件
                $('.tab li[data-index = ' + nextTabIndex + ']').click(function(e) {
                    onTabClick2(this);
                });

                $(that).parent().parent().removeClass('curr').after(newItemsHtml);

                $(".curr").show();

            }

            $('.mc[data-area=' + nextTabIndex + ']').html(getGroupList(groupData)).show();
            //给新添加的表头添加点击
            $('.mc[data-area = ' + nextTabIndex + '] ul li').click(function(e) {
                onItemsClidk(this)
            });

            curTab.removeClass('curr').find('em').html($(that).text());
            changeSummaryText();
        }

        $("#tabs-stock .mt .tab li").click(function(e) {
            onTabClick2(this);
        })

        function onTabClick(tabItem) {
            var that = tabItem;
            if ($(that).attr("class") !== 'curr') {
                $("#tabs-stock .mt .tab li").removeClass('curr').hide();
                $(that).addClass('curr').show();
                $(".mc").hide();
                var groupItemsStr = '.mc[data-area=' + $(that).attr("data-index") + ']';
                $(groupItemsStr).addClass("curr").show();
            };
        }

        function onTabClick2(tabItem) {
            //若用户点击当前选中的节点不做操作
            if ($(tabItem).attr('class') != 'curr') {
                $(tabItem).addClass('curr');
                $(tabItem).find('em').html('请选择');
                var nextAll = $(tabItem).nextAll(); //当前tab之后的所有tab数组
                for (var i = 0, len = nextAll.length; i < len; i++) exceptionAry.pop(); //删除当前tab之后选中的项目
                nextAll.remove(); //移除当前节点之后的所有兄弟节点
                var curItemNode = $('.mc[data-area=' + $(tabItem).attr("data-index") + ']');
                curItemNode.nextAll().remove(); //移除当前Tab之后所有tab的选择面板
                curItemNode.addClass('curr').show(); //显示当前选中tab的选择面板
                changeSummaryText();
            };
        }

        function changeSummaryText() {
            //$("#store-selector .text div").html($('.tab em').text());
            var tabs = $('.tab em');
            var tabStrs = $(tabs[0]).text();
            for (var i = 1, len = tabs.length; i < len; i++) {
                if ($(tabs[i]).text() == '请选择') {
                    continue;
                };
                tabStrs += '>' + $(tabs[i]).text();
            }
            $("#result-stock .text div").html(tabStrs);
        }
    })();

});


