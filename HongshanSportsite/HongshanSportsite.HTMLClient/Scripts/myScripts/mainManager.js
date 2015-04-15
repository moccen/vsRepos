(function (name, context, factory) {
    context[name] = factory();
})('mainManager', this, function () {
    window.__pivotHash__ = {};
    var util = {
        eachAry: function (ary, func) {
            for (var i = 0, len = ary.length; i < len; i++) {
                func(ary[i]);
            }
        },
        //修改自requireJs 中的eachProp
        eachProp: function (obj, func) {
            var prop;
            for (prop in obj) {
                if (util.hasProp(obj, prop)) {
                    func(obj[prop]);
                }
            }
        },

        hasProp: function (obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        },

        resizeLayout: function () {
            var width = $(window).width() - 30; //减去10与body中margin:5px共同作用:为body留的边距  
            var height = $(window).height() * 0.88;
            $('#layout').layout('resize', {
                width: width,
                height: height
            });
        },

        buildTree: function (array) {
            try {
                var roots = [], children = {};

                // find the top level nodes and hash the children based on parent
                //先循环把父节点构建起来，这里只找父节点
                for (var i = 0, len = array.length; i < len; ++i) {
                    var item = array[i], p = item.Parent;
                    //var nodeIcon = this.getNodeIcon(item.Name);
                    //var node = { id: item.Id, text: item.Name, iconCls: nodeIcon },
                    var node = { id: item.Id, text: item.Name },

                        //如果没有父节点，那就是根节点roots，如果有，执行后面的
                        target = !p ? roots : (children[p.Id] || (children[p.Id] = []));

                    target.push(node);
                }

                // function to recursively build the tree
                var findChildren = function (parent) {
                    if (children[parent.id]) {
                        parent.children = children[parent.id];
                        for (var i = 0, len = parent.children.length; i < len; ++i) {
                            findChildren(parent.children[i]);
                        }
                    }
                };

                // enumerate through to handle the case where there are multiple roots
                for (var i = 0, len = roots.length; i < len; ++i) {
                    findChildren(roots[i]);
                }
                return roots;
                //$('#treeID').tree({ data: roots });
            } catch (e) {
                console.log(e);
            }

        },

        //nodeType可以是 id或者 text
        getCheckedTreeNode: function (treeId, nodeType) {
            try {
                if (treeId) {
                    //var id = '#' + treeId;
                    nodeType = nodeType || 'id';
                    var nodes = $(treeId).tree('getChecked');

                    var s = '';
                    for (var i = 0; i < nodes.length; i++) {

                        if (nodes[i].checked) {
                            if (s != '') s += ',';
                            s += nodes[i][nodeType];
                        }
                    }
                    return s;

                }
            } catch (e) {
                console.log(e.message);
            }
        },

        resizJqGrid: function () {
            try {
                var width = $('#regioncenter').width() - 12;
                $("#stadiumInfo").setGridWidth(width, true);
                $("#ecoStatusInfo").setGridWidth(width, true);

            } catch (e) {
                console.log(e);
            }
        },

        resizePiovt: function () {
            try {
                var width = $('#regioncenter').width() - 150;
                $('#stadiumPivot').width(width);
                $("#ecoPivot").width(width);
                //$('.highcharts-container').width(width);
            } catch (e) {
                console.log(e);
            }
        },

        onRegionCentrChange: function () {
            var resizer = document.getElementById('regioncenter');
            window.addResizeListener(resizer, util.resizJqGrid);
            //window.addResizeListener(resizer, util.resizePiovt);
        },

        upDatePivot: function (pivotName, pData) {
            try {
                if (window.__pivotHash__[pivotName]) {
                    $(pivotName).pivotUI(pData);
                } else if (pData.length > 0) {
                    //var render = $.extend($.pivotUtilities.renderers, $.pivotUtilities.highChart_renderers);
                    //var render = $.extend($.pivotUtilities.locales.zh.renderers, $.pivotUtilities.highChart_renderers);
                    window.__pivotHash__[pivotName] = $(pivotName).pivotUI(
                        pData,
                        { renderers: $.pivotUtilities.locales.zh.renderers },
                        true,
                        'zh'
                        );
                    $(window).bind('resize', function () {
                        $(pivotName).width(($('#regioncenter').width() * 0.9));
                    });
                };

            } catch (e) {
                console.log(e.message);
            }
        },

        getPermissionAry: function (permissionStr) {
            return permissionStr.split(',');
        }
    };

    //监听窗体中控件size变化
    (function () {
        var attachEvent = document.attachEvent;
        var isIE = navigator.userAgent.match(/Trident/);
        //console.log(isIE);
        var requestFrame = (function () {
            var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                function (fn) { return window.setTimeout(fn, 20); };
            return function (fn) { return raf(fn); };
        })();

        var cancelFrame = (function () {
            var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
                   window.clearTimeout;
            return function (id) { return cancel(id); };
        })();

        function resizeListener(e) {
            var win = e.target || e.srcElement;
            if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
            win.__resizeRAF__ = requestFrame(function () {
                var trigger = win.__resizeTrigger__;
                trigger.__resizeListeners__.forEach(function (fn) {
                    fn.call(trigger, e);
                });
            });
        }

        function objectLoad(e) {
            this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
            this.contentDocument.defaultView.addEventListener('resize', resizeListener);
        }

        window.addResizeListener = function (element, fn) {
            if (!element.__resizeListeners__) {
                element.__resizeListeners__ = [];
                if (attachEvent) {
                    element.__resizeTrigger__ = element;
                    element.attachEvent('onresize', resizeListener);
                }
                else {
                    if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
                    var obj = element.__resizeTrigger__ = document.createElement('object');
                    obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
                    obj.__resizeElement__ = element;
                    obj.onload = objectLoad;
                    obj.type = 'text/html';
                    if (isIE) element.appendChild(obj);
                    obj.data = 'about:blank';
                    if (!isIE) element.appendChild(obj);
                }
            }
            element.__resizeListeners__.push(fn);
        };

        window.removeResizeListener = function (element, fn) {
            element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
            if (!element.__resizeListeners__.length) {
                if (attachEvent) element.detachEvent('onresize', resizeListener);
                else {
                    element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
                    element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
                }
            }
        }
    })();

    var permissionChecker = {
        getIntersect: function (a, b) {
            var t;
            if (b.length > a.length) {
                t = b, b = a, a = t;
            } // indexOf to loop over shorter
            return a.filter(function (e) {
                if (b.indexOf(e) !== -1) return true;
                return false;
            });
        },

        getSpecElPermission: function (elId) {
            if (!elId) {
                return undefined;
            }
            var permissions = this.getPermissionDic();
            return permissions[elId];
        },

        getPermissionDic: function () {
            var elPermission = {};
            elPermission['stadiumPivot'] = ['CanVisitStastics'];
            elPermission['ecoPivot'] = ['CanVisitStastics'];

            return elPermission;
        },

        hasPermission: function (userPermissions, elId) {
            var elPermissions = this.getSpecElPermission(elId);
            if (!elPermissions) {
                return true; //如果在getElPermissions()中没有找到对应的permissions，说明不需要验证
            }
            if (!userPermissions || userPermissions['length'] < 1) return false; //用户传入权限为空，返回假
            var intersect = this.getIntersect(userPermissions, elPermissions);
            if (intersect.length > 0) {
                return true;
            }
            return false;
        }
    };

    var eleId = 1;//对于没有id的元素，自动分配一个全局id
    var uiBuilder = (function () {
        var builder = {};
        builder.buildLayout = function () {
            var permissions = arguments[0];
            var layoutConf = getLayoutConf(permissions);
            //var layout = createCombinedElement(layoutConf);
            var layout = createTreeEle(layoutConf);
            return layout;

        };
        //function UiBuilder() { };
        //UiBuilder.prototype = {
        //    buildLayout: function () {
        //        var permissions = arguments[0];
        //        var layoutConf = getLayoutConf(permissions);
        //        //var layout = createCombinedElement(layoutConf);
        //        var layout = createTreeEle(layoutConf);
        //        return layout;
        //    }
        //}

        function getLayoutConf() {
            var layoutConf = {};
            layoutConf['parent'] = { 'id': 'layout', 'class': 'easyui-layout', 'data-role': 'none', 'elType': 'div' };
            var regionsConf = getRegionsConfig(arguments[0]);//arguments[0]默认为用户权限
            layoutConf['children'] = getChildrenConf(regionsConf);
            return layoutConf;
            //return { 'parent': { 'id': 'layout', 'class': 'easyui-layout', 'data-role': 'none', 'elType': 'div' } };
        }

        //将各个region的配文件添加到layoutConf['children']上
        function getChildrenConf(childrenConfs) {
            var children = {};
            util.eachProp(childrenConfs, function (confVal) {
                if (confVal.id) {
                    children[confVal.id] = confVal;
                } else if (confVal['parent'] && confVal['parent'].id) {
                    children[confVal.parent.id] = confVal;
                }
                else {
                    children[confVal.elType + eleId++] = confVal;
                }
            });
            return children;
        }

        function getRegionsConfig(permissions) {
            var regionConfig = {};
            if (permissionChecker.hasPermission(permissions, 'regionwest')) {

                //regionConfig['regionWest'] = getRegionConf('west', '查询面板');
                var accordConf = getAccordConf(permissions);
                var menuConf = getMenuConf(permissions);
                regionConfig['regionWest'] = {};
                regionConfig['regionWest']['parent'] = getRegionConf('west', '查询面板');
                regionConfig['regionWest']['children'] = { menuConf: menuConf, accordConf: accordConf };
                //regionConfig['regionWest'] = {
                //    'parent': getRegionConf('west', '查询面板'),
                //    'children': getAccordConf(permissions)
                //};
            };
            //if (permissionChecker.hasPermission(permissions, 'regioneast')) {
            //    regionConfig['regionEast'] = getRegionConf('east', '属性面板');
            //};

            //regionConfig['regionCenter'] = getRegionConf('center', '内容面板');
            regionConfig['regionCenter'] = {
                'parent': getRegionConf('center', '内容面板'),
                'children': getTabsConf(permissions)
            };
            return regionConfig;
        }

        function getRegionConf(regionPos, regionTitle, regionWidth) {
            var regionConfig = {
                'id': 'region' + regionPos,
                'title': regionTitle,
                'data-role': 'none',
                'data-options': "region:'" + regionPos + "',split:true"
            };
            if (regionPos !== 'center') {
                regionConfig.width = regionWidth || $(window).width() * 0.2;
            }
            //regionConfig.width = (regionPos !== "center") && (regionWidth || $(window).width() * 0.2);
            return regionConfig;

        }

        //查询面板
        function getAccordConf(permissions) {
            var accordionConfig = {};
            var children = {};
            accordionConfig['parent'] = { id: 'accordionID', 'class': 'easyui-accordion', 'data-options': 'fit:true,border:true,multiple:false', elType: 'accordion' };
            accordionConfig['children'] = children;
            if (permissionChecker.hasPermission(permissions, 'streetPanel')) {
                children['streetPanel'] = getPanelConf({ 'parent': { 'Id': 'streetPanel', 'title': '所属街道' }, 'children': { 'Id': 'streetTree' } });
            }
            if (permissionChecker.hasPermission(permissions, 'catePanel')) {
                children['catePanel'] = getPanelConf({ parent: { Id: 'catePanel', title: '场地代码' }, children: { Id: 'cateTree' } });
            }
            if (permissionChecker.hasPermission(permissions, 'placePanel')) {
                //场地分布查询面板
                children['placePanel'] = getPanelConf({ 'parent': { 'Id': 'placePanel', 'title': '场地分布' }, 'children': { 'Id': 'placeTree' } });
            }
            if (permissionChecker.hasPermission(permissions, 'ownerPanel')) {
                children['ownerPanel'] = getPanelConf({ 'parent': { 'Id': 'ownerPanel', 'title': '场地归属' }, 'children': { 'Id': 'ownerTree' } });
            }
            if (permissionChecker.hasPermission(permissions, 'openingPanel')) {
                children['openingPanel'] = getPanelConf({ 'parent': { 'Id': 'openingPanel', 'title': '对外开放情况' }, 'children': { 'Id': 'openingTree' } });
            }
            if (permissionChecker.hasPermission(permissions, 'recievePanel')) {
                children['recivePanel'] = getPanelConf({ 'parent': { 'Id': 'recievePanel', 'title': '平均每周接待人次' }, 'children': { 'Id': 'recieveTree' } });
            }
            if (permissionChecker.hasPermission(permissions, 'operModePanel')) {
                children['operModePanel'] = getPanelConf({ 'parent': { 'Id': 'operModePanel', 'title': '运营模式' }, 'children': { 'Id': 'operModeTree' } });
            }

            return accordionConfig;
        }

        function getMenuConf(permissions) {
            var menuConf = {};
            var children = {};
            menuConf['parent'] = { style: "padding:5px;background-color:menu", elType: 'div' };
            menuConf['children'] = children;
            children['search'] = { id: 'lbSeachID', showText: '查询', iconCls: 'icon-search', elType: 'button' };
            children['expandID'] = { id: 'expandID', showText: '展开', iconCls: 'icon-add', elType: 'button' };
            children['collapseID'] = { id: 'collapseID', showText: '折叠', iconCls: 'icon-remove', elType: 'button' };

            return menuConf;
        }

        function getPanelConf(configObj) {
            var panelConf = {};
            var children = {};
            panelConf['parent'] = { 'id': configObj.parent.Id, 'title': configObj.parent.title, style: 'padding:10px', elType: 'div' };
            children[configObj.children.Id] = getTreeConf(configObj.children.Id);
            panelConf['children'] = children;

            return panelConf;
        }

        function getTreeConf(elId) {
            return { 'id': elId, 'style': "padding:5px", 'class': "easyui-tree", 'data-options': "animate:true,checkbox:true", elType: 'ul' };
        }

        //主面板
        function getTabsConf(permissions) {
            var tabsConfigs = {};
            var children = {};

            var getMapConf = function () {
                var mapIdConfig = {};
                var child = {};
                mapIdConfig['parent'] = { id: 'mapTab', title: '地图', style: 'padding:10px', elType: 'div' };
                mapIdConfig['children'] = child;
                child['mapID'] = { id: 'mapID', style: 'width:100%; height:100%;', elType: 'div' };

                return mapIdConfig;
            }
            var getStadiumInfo = function () {
                var tabConfig = {};
                var child = {};
                tabConfig['parent'] = { id: 'stadiumTab', title: '场馆信息', style: 'padding:5px', elType: 'tabs' };
                tabConfig['children'] = child;
                //child['label1'] = { text: '分组依据', elType: 'div' };
                //child['groupSelecter'] = { id: 'stadiumCombo', 'class': 'easyui-combobox', style: 'width:200px', 'data-options': "valueField:'id',textField:'text'", elType: 'input' };
                child['groupBy-ul'] = { id: 'groupBySelector', elType: 'div' };
                child['stadiumInfo'] = { id: 'stadiumInfo', elType: 'table' };
                child['stadiumPager'] = { id: 'stadiumPager', elType: 'div' };

                return tabConfig;
            };

            var getEcoInfo = function () {
                var tabConfig = {};
                var child = {};
                tabConfig['parent'] = { id: 'ecoStatusTab', title: '运营情况', style: 'padding:5px', elType: 'tabs' };
                tabConfig['children'] = child;
                //child['label1'] = { text: '分组依据', elType: 'div' };
                //child['groupSelecter'] = { id: 'ecoCombo', 'class': 'easyui-combobox', style: 'width:200px', 'data-options': "valueField:'id',textField:'text'", elType: 'input' };
                child['groupByEco'] = { id: 'EcoGroupByer', elType: 'div' };
                child['jqGridTable'] = { id: 'ecoStatusInfo', elType: 'table' };
                child['jqPager'] = { id: 'ecoStatusPager', elType: 'div' };

                return tabConfig;
            }

            var getPivotConf = function (configs) {
                var pivotConf = {};
                var child = {};
                var parentId = configs.pivotId + 'tab';
                pivotConf['parent'] = { id: parentId, title: configs.tabTitle, style: 'padding:10px', 'class': 'pivottable-master', elType: 'div' };
                pivotConf['children'] = child;
                child[configs.pivotId] = { id: configs.pivotId, style: 'margin: 10px;width: 100%', elType: 'div' };

                return pivotConf;

            }

            tabsConfigs['parent'] = { 'class': "easyui-tabs", 'data-options': "fit:true,border:false,plain:true", elType: 'tabs' };
            tabsConfigs['children'] = children;
            if (permissionChecker.hasPermission(permissions, 'mapID')) {
                children['mapID'] = getMapConf();
            }
            if (permissionChecker.hasPermission(permissions, 'stadiumInfo')) {
                children['stadiumInfo'] = getStadiumInfo();
            }
            if (permissionChecker.hasPermission(permissions, 'ecoStatusInfo')) {
                children['ecoStatusInfo'] = getEcoInfo();
            }
            if (permissionChecker.hasPermission(permissions, 'stadiumPivot')) {
                children['stadiumPivot'] = getPivotConf({ tabTitle: '场馆信息统计', pivotId: 'stadiumPivot' });
            }
            if (permissionChecker.hasPermission(permissions, 'ecoPivot')) {
                children['ecoPivot'] = getPivotConf({ tabTitle: '运营情况统计', pivotId: 'ecoPivot' });
            }
            return tabsConfigs;
        }

        function elFactory(elConfig, elType) {
            var tagType = elType;
            if (elConfig.elType) {
                delete elConfig.elType;
            };//若配置文件中带有tag type属性删除掉
            //elConfig.id = elConfig.id || elType + globeIndex++;
            if (tagType) {
                switch (tagType.toLowerCase()) {
                    case 'layout':
                    case 'region':
                    case 'accordion':
                    case 'menu':
                    case 'panel':
                    case 'tabs':
                    case 'tabpage':
                        {
                            return $('<div></div>', elConfig);
                            break;
                        };
                    case 'button':
                        {
                            return createBtnEasy(elConfig);
                            break;
                        };
                    case 'tree':
                        {
                            return createElement('ul', elConfig);
                            break;
                        };
                    default:
                        return createElement(elType, elConfig);
                }
            } else {
                return $('<div></div>', elConfig);
            }

        }

        function createElement(eleType, eleConfig) {
            switch (eleType) {
                case 'a':
                    {
                        if (eleConfig) {
                            return $('<a></a>', eleConfig);
                        } else {
                            return $('<a></a>');
                        }
                        break;
                    };
                case 'ul':
                    {
                        if (eleConfig) {
                            return $('<ul></ul>', eleConfig);
                        } else {
                            return $('<ul></ul>');
                        }
                        break;
                    };
                case 'input':
                    {
                        if (eleConfig) {
                            return $('<input></input>', eleConfig);
                        } else {
                            return $('<input></input>');
                        }
                        break;
                    };
                case 'table':
                    {
                        if (eleConfig) {
                            return $('<table></table>', eleConfig);
                        } else {
                            return $('<table></table>');
                        }
                        break;
                    };
                case 'span':
                    {
                        if (eleConfig) {
                            return $('<span></span>', eleConfig);
                        } else {
                            return $('<span></span>');
                        }
                        break;
                    };
                default:
                    {
                        if (eleConfig) {
                            return $('<div></div>', eleConfig);
                        } else {
                            return $('<div></div>');
                        }
                        break;
                    }
            }
        }

        function createBtnEasy(btnConfig) {
            var btn = $('<a></a>', {
                id: btnConfig.id
            });
            btn.linkbutton({
                iconCls: btnConfig.iconCls,
                text: btnConfig.showText,
                plain: true
            });
            return btn;

        }

        function createTreeEle(configs) {
            var parent = arguments[1];
            if (configs['parent']) {
                var subParent = elFactory(configs.parent, configs.parent.elType);
                if (parent) {
                    parent.append(subParent);
                } else {
                    parent = subParent;
                }
                util.eachProp(configs.children, function (conf) {
                    if (conf['parent']) {
                        var son = elFactory(conf.parent, conf.parent.elType);
                        subParent.append(son);
                        createTreeEle(conf.children, son);
                    } else {
                        var child = elFactory(conf, conf.elType);
                        subParent.append(child);
                    }
                });
            } else {
                util.eachProp(configs, function (conf) {
                    if (conf['parent']) {
                        createTreeEle(conf, parent);
                    } else {
                        var child = elFactory(conf, conf.elType);
                        parent.append(child);
                    }
                });
            }
            return parent;
        }

        return builder;
    })();

    //载入查询树，设置jqgrid参数
    var dataManager = {
        loadTree: function (treeId, dataSet) {
            var treeData = [];
            var appData = myapp.activeDataWorkspace.ApplicationData;
            if (appData[dataSet]) {
                appData[dataSet].load().then(function (promiseItem) {
                    var results = promiseItem.results;
                    for (var i = 0, len = results.length; i < len; i++) {
                        var val = {};
                        val['id'] = results[i].Id;
                        val['text'] = results[i].Name;
                        //_enterList.push(val);
                        treeData[i] = val;
                    }
                    $(treeId).tree({ data: treeData });
                });
                //$(treeId).tree({
                //    onCheck: function (node, checked) {
                //        treeData[node.id - 1].checked = checked;
                //    }
                //});
            }
        },

        loadCateTree: function (treeId) {
            var cateTree = [];
            myapp.activeDataWorkspace.ApplicationData.CategorySet.expand('Parent').execute().then(function (promiseItem) {
                cateTree = util.buildTree(promiseItem.results);
                $(treeId).tree({ data: cateTree });
            });
        },

        loadStaticTree: function (treeId, treeData) {
            $(treeId).tree({ data: treeData });
            //$(treeId).tree({
            //    onCheck: function (node, checked) {
            //        treeData[node.id - 1].checked = checked;
            //    }
            //});
        },

        getPlaceTreeData: function () {
            var dataSet = [{ text: '广场' }, { text: '公园' }, { text: '校园' }, { text: '工矿' }, { text: '机关企事业单位楼院' }, { text: '宾馆商场饭店' }, { text: '居住小区/街道' }, { text: '乡镇/村' }, { text: '军营' }, { text: '其他' }];
            return dataSet;
        },

        getOpenTreeData: function () {
            var dataSet = [{ text: '不开放' }, { text: '部分时段开放' }, { text: '全天开放' }];
            return dataSet;
        },

        //接待人员树
        getRecvTreeData: function () {
            var dataSet = [{ text: '500人次以下/周' }, { text: '501-2500人次/周' }, { text: '2501-5000人次/周' }, { text: '5001-10000人次/周' }, { text: '10000人次以上/周' }];
            return dataSet;
        },

        getOperModeTreeData: function () {
            var dataSet = [{ text: '自主运营' }, { text: '合作运营' }, { text: '委托运营' }];
            return dataSet;
        },

        getNavBtnConfig: function () {
            var tbName = arguments[0], fileName = arguments[1] || '体育场馆信息表.xlsx';

            return {
                caption: "导出excel",
                buttonicon: "ui-icon-disk",
                onClickButton: function () {
                    if (tbName) {
                        //ExportJQGridDataToExcel(tbName, fileName);
                    }
                },
                position: "last",
            }
        },

        getStadiumJqConf: function (tbName, pager) {
            var config = {};
            config.jqGridConfig = {
                colNames: ['所属街道', '组织机构代码', '场地代码', '场地名称', '场地分布', '场地归属', '建成年份', '用地面积（㎡）', '建筑面积（㎡）', '场地面积（㎡）', '投资金额（合计）', '财政拨款', '体彩公益金', '单位自筹', '社会捐赠', '其他'],
                colModel: [
                    { name: '所属街道', index: '所属街道', width: 60, sorttype: "text" },
                    { name: '组织机构代码', index: '组织机构代码', width: 60, sorttype: "text" },
                    { name: '场地代码', index: '场地代码', width: 80, sorttype: "text" },
                    { name: '场地名称', index: '场地名称', width: 120, sorttype: 'text' },
                    { name: '场地分布', index: '场地分布', width: 80 },
                    { name: '场地归属', index: '场地归属', width: 80 },
                    { name: '建成年份', index: '建成年份', width: 60, sorttype: 'int' },
                    { name: '用地面积（㎡）', index: '用地面积（㎡）', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' },
                    { name: '建筑面积（㎡）', index: '建筑面积（㎡）', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' },
                    { name: '场地面积（㎡）', index: '场地面积（㎡）', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' },
                    { name: '投资金额（合计）', index: '投资金额（合计）', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' },
                    { name: '财政拨款', index: '财政拨款', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' },
                    { name: '体彩公益金', index: '体彩公益金', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' },
                    { name: '单位自筹', index: '单位自筹', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' },
                    { name: '社会捐赠', index: '社会捐赠', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' },
                    { name: '其他', index: '其他', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' }
                ],
                pager: pager,
                sortname: '场地名称',
                caption: "场地信息",
                grouping: true,
                groupingView: {
                    groupField: ['所属街道', '场地代码'],
                    groupColumnShow: [true, true],
                    groupText: ['<b>{0}<b> 总计: {1}', '{0} 小计: {1}'],
                    groupCollapse: true,
                    groupSummary: [false, true]
                },

            };
            var navConfigs = [];
            config.navConfig = navConfigs;
            navConfigs.push(dataManager.getNavBtnConfig(tbName, '场馆信息.xlsx'));
            navConfigs.push(dataManager.getExpandBtnConfig());
            navConfigs.push(dataManager.getColaspeBtnConfig());
            return config;
        },

        getStadiumJqConfTest: function (tbName, pager, colConf) {
            var config = {};
            config.jqGridConfig = {
                colNames: colConf.colNames,
                colModel: colConf.colModel,
                pager: pager,
                sortname: '场地名称',
                caption: "场地信息",
                grouping: true,
                groupingView: {
                    //groupField: ['所属街道', '场地代码'],
                    groupColumnShow: [true, true],
                    groupText: ['<b>{0}<b> 总计: {1}', '{0} 小计: {1}'],
                    groupCollapse: true,
                    groupSummary: [false, true]
                },

            };
            var navConfigs = [];
            config.navConfig = navConfigs;
            navConfigs.push(dataManager.getNavBtnConfig(tbName, '场馆信息.xlsx'));
            navConfigs.push(dataManager.getExpandBtnConfig());
            navConfigs.push(dataManager.getColaspeBtnConfig());
            return config;
        },

        getEcoStatusConf: function (tbName, pager) {
            var config = {};
            config.jqGridConfig = {
                colNames: ['年份', '场地名称', '场地从业人员人数', '运营模式', '对外开放情况', '年开放天数', '平均每周接待健身人次', '收入合计（千元）', '支出合计（千元）'],
                colModel: [
                    { name: '年份', index: '年份', width: 60, sorttype: "text" },
                    { name: '场地名称', index: '场地名称', width: 120, sorttype: "text" },
                    { name: '场地从业人员人数', index: '场地从业人员人数', width: 80, sorttype: "int" },
                    { name: '运营模式', index: '运营模式', width: 80, sorttype: 'text' },
                    { name: '对外开放情况', index: '对外开放情况', width: 80 },
                    { name: '年开放天数', index: '年开放天数', width: 80, sorttype: 'int' },
                    { name: '平均每周接待健身人次', index: '平均每周接待健身人次', width: 60 },
                    { name: '收入合计（千元）', index: '收入合计（千元）', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' },
                    { name: '支出合计（千元）', index: '支出合计（千元）', width: 80, sorttype: 'float', summaryType: 'sum', summaryTpl: '∑:{0}' },
                ],
                pager: pager,
                sortname: '年份',
                caption: "运营情况",
                grouping: true,
                groupingView: {
                    groupField: ['年份', '场地名称'],
                    groupColumnShow: [true, true],
                    groupText: ['<b>{0}<b> 总计: {1}', '{0} 小计: {1}'],
                    groupCollapse: true,
                    groupSummary: [false, true]
                },
            };
            var navConfigs = [];
            navConfigs.push(dataManager.getNavBtnConfig(tbName, '运营情况.xlsx'));
            navConfigs.push(dataManager.getExpandBtnConfig());
            navConfigs.push(dataManager.getColaspeBtnConfig());
            config.navConfig = navConfigs;

            return config;
        },

        getExpandBtnConfig: function () {
            return {
                caption: "展开",
                buttonicon: "ui-icon-zoomin",
                onClickButton: function () {
                    $('#' + this.id + ' .ui-icon-circlesmall-plus').trigger("click");
                },
                position: "last",
            }
        },

        getColaspeBtnConfig: function () {
            return {
                caption: "折叠",
                buttonicon: "ui-icon-zoomout",
                onClickButton: function () {
                    $('#' + this.id + ' .ui-icon-circlesmall-minus').trigger("click");
                },
                position: "last",
            }
        },

    };

    var jqGridMgr = (function () {
        var defaultConfig = {
            autowidth: true,
            datatype: "local",
            height: "auto",
            rowNum: 100,
            rowList: [50, 100, 200, 400],
            viewrecords: true,
            shrinkToFit: true,
            rownumbers: true,
        };

        var jqgridMgr = {};
        jqgridMgr.setJqGrid = function (jqGridId, colConfigs) {
            var config = arguments[2] || defaultConfig;
            mergeProps(config, colConfigs);
            $(jqGridId).jqGrid(config);
        };

        jqgridMgr.setJqGridWithNavBtn = function (jqGridId, pagerId, jqConfig) {
            this.setJqGrid(jqGridId, jqConfig.jqGridConfig);
            $(jqGridId).jqGrid('navGrid', pagerId, { edit: false, add: false, del: false, search: false, refresh: false }).jqGrid('navButtonAdd', pagerId, jqConfig.navConfig);

        };

        jqgridMgr.setJqGridWithCustomBtns = function (jqGridId, pagerId, jqConfig) {
            this.setJqGrid(jqGridId, jqConfig.jqGridConfig);

            util.eachProp(jqConfig.navConfig, function (config) {
                $(jqGridId).jqGrid('navGrid', pagerId, { edit: false, add: false, del: false, search: false, refresh: false }).jqGrid('navButtonAdd', pagerId, config);
            });

        };

        jqgridMgr.setData = function (jqGridId, gridData) {
            var theJqGrid = $(jqGridId);
            theJqGrid.clearGridData();
            theJqGrid.jqGrid('setGridParam', {
                data: gridData,
                localReader: {
                    repeatitems: true,
                    cell: "",
                    id: 0
                }
            }).trigger('reloadGrid');
            //for (var i = 0; i <= gridData.length; i++)
            //    $(jqGridId).jqGrid('addRowData', i + 1, gridData[i]);
            //$(jqGridId).jqGrid('setGridParam', { url: '', postData: '' }).trigger('reloadGrid'); //刷新一下表格
        };

        //将默认的jqgrid属性和每个表单独的属性结合
        function mergeProps(formerconfig, colConfigs) {
            for (var prop in colConfigs) {
                if (formerconfig.hasOwnProperty[prop]) continue;
                formerconfig[prop] = colConfigs[prop];
            }
        };

        return jqgridMgr;
    })();

    var queryManager = (function () {
        var queryMgr = {};
        var panel2Tree = { '#streetPanel': '#streetTree', '#catePanel': '#cateTree', '#placePanel': '#placeTree', '#ownerPanel': '#ownerTree', '#openingPanel': '#openingTree', '#recievePanel': '#recieveTree', '#operModePanel': '#operModeTree' };
        var treeNodeType = { '#streetTree': 'id', '#cateTree': 'id', '#placeTree': 'text', '#ownerTree': 'id', '#openingTree': 'text', '#recieveTree': 'text', '#operModeTree': 'text' };
        var screenPara = { '#streetTree': 'streetPara', '#cateTree': 'catePara', '#placeTree': 'placePara', '#ownerTree': 'ownerPara', '#openingTree': 'openPara', '#recieveTree': 'recievePara', '#operModeTree': 'operModePara' };

        //panel为单项查询项目
        queryMgr.doQuery = function (screen, panelId) {
            try {
                if (panelId) {
                    var treeId = panel2Tree[panelId];
                    if (treeId) {
                        var ids = util.getCheckedTreeNode(treeId, treeNodeType[treeId]);
                        var para = screenPara[treeId];
                        screen[para] = ids;
                        util.eachProp(screenPara, function (val) {
                            if (val !== para) {
                                screen[val] = undefined;
                            }
                        });
                    }
                } else {
                    //var streetIds = util.getCheckedTreeNode('#streetTree', 'id');
                    var streetIds = util.getCheckedTreeNode('#streetTree', 'text');

                    //var cateIds = util.getCheckedTreeNode('#cateTree', 'id');
                    var cateIds = util.getCheckedTreeNode('#cateTree', 'text');

                    var placeStrs = util.getCheckedTreeNode('#placeTree', 'text');
                    //var ownerIds = util.getCheckedTreeNode('#ownerTree', 'id');
                    var ownerIds = util.getCheckedTreeNode('#ownerTree', 'text');

                    var openIds = util.getCheckedTreeNode('#openingTree', 'text');
                    var recvIds = util.getCheckedTreeNode('#recieveTree', 'text');
                    var operIds = util.getCheckedTreeNode('#operModeTree', 'text');
                    //myapp.activeDataWorkspace.ApplicationData.StadiumQueryWithOwner(placeStrs, streetIds, ownerIds, cateIds, openIds, recvIds, operIds)
                    //    .expand('Stadium,Owner')
                    //    .execute()
                    //    .then(function(proItems) {
                    //        var test = proItems;
                    //    });
                    screen.streetPara = streetIds;
                    screen.catePara = cateIds;
                    screen.placePara = placeStrs;
                    screen.ownerPara = ownerIds;
                    screen.openPara = openIds;
                    screen.recievePara = recvIds;
                    screen.operModePara = operIds;
                    myapp.activeDataWorkspace.WCF_RIA_ServiceData
                        .CombindedStadiumQuery(placeStrs, streetIds, ownerIds, cateIds, openIds, recvIds, operIds)
                        .execute()
                        .then(function (proItems) {
                            //var test = screen.CombinedStadium.array;
                            var test = proItems.results;
                            addPin2Map(test);
                            loadStadiumInfoGrid(test);
                            //var ecoData = lsDataOrger.setData(test);
                            //jqGridMgr.setData('#ecoStatusInfo', ecoData);
                            //util.upDatePivot('#ecoPivot', ecoData);

                        });

                    myapp.activeDataWorkspace.WCF_RIA_ServiceData
                        .RiaEcostatusQuery(placeStrs, streetIds, ownerIds, cateIds, openIds, recvIds, operIds)
                        .execute()
                        .then(function(proItems) {
                            var test = proItems.results;
                            var ecoData = lsDataOrger.setData(test);
                            jqGridMgr.setData('#ecoStatusInfo', ecoData);
                            util.upDatePivot('#ecoPivot', ecoData);
                        });
                }

                //screen.StadiumQuery.load().then(function (promiseItems) {
                //    //var ids = getSelectedIDs(promiseItems);
                //    //myapp.activeDataWorkspace.ApplicationData.Owner2StaduimQuery(ids).expand('Owner,Stadium').execute().then(function(proItems) {
                //    //    var test = screen.StadiumQuery;
                //    //});
                //    //screen.StadiumQuery.selectedItem = screen.StadiumQuery.data[0];
                //    //screen.Owner2StadiumMediatorCollection.load().then(function(items) {
                //    //    var test = screen.StadiumQuery;
                //    //});
                //    itemsLoaded(screen.StadiumQuery);
                //});

                //screen.CombinedStadiumQuery.load().then(function(e) {
                //    var test = screen.CombinedStadiumQuery.data;
                //    addPin2Map(test);
                //    loadStadiumInfoGrid(test);
                //});

                //screen.CombinedStadium.load().then(function (e) {
                //    var test = screen.CombinedStadium.data;
                //    addPin2Map(test);
                //    loadStadiumInfoGrid(test);
                //});


                //screen.StadiumQueryWithEcoStatus.load().then(function (e) {
                //    var ecoData = lsDataOrger.setData(screen.StadiumQueryWithEcoStatus.data);
                //    jqGridMgr.setData('#ecoStatusInfo', ecoData);
                //    util.upDatePivot('#ecoPivot', ecoData);

                //});

                //screen.StadiumQueryWithOwner.load().then(function (e) {
                //    //itemsLoaded(screen.StadiumQueryWithOwner);
                //    var stadiumItems = o2SGroupByStadium(screen.StadiumQueryWithOwner.data);
                //    addPin2Map(stadiumItems);
                //    loadStadiumInfoGrid(stadiumItems);
                //});
                //////////////////////////////////////////////////////////////////////////
                //var that = screen.StadiumQuery;
                //screen.getStadiumQuery().then(function(pro) {
                //    pro.data.forEach(function(subPro) {
                //        subPro.getOwner2StadiumMediatorCollection().then(function (items) {
                //            items.array.forEach(function (o2s) {
                //                o2s.getOwner().then(function(owner) {
                //                    var test = owner;
                //                    var test2 = that;
                //                });
                //            });
                //        });
                //    });
                //});
            } catch (e) {
                console.log(e.message);
            }
        }

        //function itemsLoaded(promiseItems) {
        //    var stadiumItems = o2SGroupByStadium(promiseItems);
        //    addPin2Map(stadiumItems);
        //    //loadGridData(stadiumItems);
        //}

        function addPin2Map(promiseItems) {
            if (baiduMap.bmap) {
                //baiduMap.bmap.clearOverlays();
                var markers = [];
                util.eachProp(promiseItems, function (pStadium) {
                    var marker = baiduMap.addPin2Map(pStadium);
                    markers.push(marker);
                });
                //for (var index in promiseItems.data) {
                //    var stadiumItem = promiseItems.data[index];
                //    if (stadiumItem) {
                //        var marker = baiduMap.addPin2Map(stadiumItem);
                //        markers.push(marker);
                //    }
                //};

                //最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
                if (baiduMap.markerClusterer) {
                    baiduMap.markerClusterer.clearMarkers();
                    baiduMap.markerClusterer.addMarkers(markers);
                } else {
                    baiduMap.markerClusterer = new window.BMapLib.MarkerClusterer(baiduMap.bmap, { markers: markers });
                    //baiduMap.markerClusterer.setMaxZoom(16);
                    //baiduMap.markerClusterer.setGridSize(20);
                    baiduMap.markerClusterer.isAverangeCenter = true;
                }
            }
        }

        //载入场馆基本信息
        function loadStadiumInfoGrid(stadiumItems) {
            var stadiumData = lsDataOrger.setData(stadiumItems);
            jqGridMgr.setData('#stadiumInfo', stadiumData);
            util.upDatePivot('#stadiumPivot', stadiumData);
        }

        //function loadGridData(promiseItems) {
        //    var ids = getSelectedIDs(promiseItems);
        //    //if (promiseItems.count == 1) {
        //    //    ids += ',' + '';
        //    //}

        //    //myapp.activeDataWorkspace.ApplicationData.Owner2StaduimQuery(ids)
        //    //    .expand('Owner,Stadium')
        //    //    .execute()
        //    //    .then(function (o2sItems) {
        //    //        var groupVals = groupByStadium(o2sItems);
        //    //        var stadiumData = lsDataOrger.setData(groupVals);
        //    //        jqGridMgr.setData('#stadiumInfo', stadiumData);
        //    //        util.upDatePivot('#stadiumPivot', stadiumData);
        //    //    });
        //    myapp.activeDataWorkspace.ApplicationData.StadiumQueryByIds(ids)
        //        .expand('Owner2StadiumMediatorCollection')
        //        .execute()
        //        .then(function (stadiumItems) {
        //            myapp.activeDataWorkspace.ApplicationData.Owner2StaduimQuery(ids)
        //                .expand('Owner,Stadium')
        //                .execute()
        //                .then(function (o2sItems) {
        //                    //var groupVals = groupByStadium(o2sItems);
        //                    var stadiumData = lsDataOrger.setData(stadiumItems.results);
        //                    jqGridMgr.setData('#stadiumInfo', stadiumData);
        //                    util.upDatePivot('#stadiumPivot', stadiumData);
        //                    //$('#stadiumPivot').pivotUI(stadiumData);
        //                });
        //        });


        //    myapp.activeDataWorkspace.ApplicationData.EcoStatusQuery(ids)
        //        .expand('StadiumEco')
        //        .execute()
        //        .then(function (ecoItems) {
        //            var ecoData = lsDataOrger.setData(ecoItems.results);
        //            jqGridMgr.setData('#ecoStatusInfo', ecoData);
        //            util.upDatePivot('#ecoPivot', ecoData);
        //            //$('#ecoPivot').pivotUI(ecoData);
        //        });
        //}

        //将owner2stadium转化为stadium的集合
        function o2SGroupByStadium(o2sItems) {
            try {
                var grouped = {};
                //var unGroupedItems = o2sItems.results || o2sItems.data;
                var unGroupedItems = o2sItems;
                // 对owner2stadium以stadium进行归类
                util.eachProp(unGroupedItems, function (o2sItem) {
                    var stadiumId = o2sItem.Stadium.Id;
                    if (grouped[stadiumId]) {
                        grouped[stadiumId].Owner = grouped[stadiumId].Owner + ',' + o2sItem.Owner.Name;
                    } else {
                        grouped[stadiumId] = o2sItem.Stadium;
                        grouped[stadiumId].Owner = o2sItem.Owner.Name;
                    }
                });
                return grouped;
            } catch (e) {
                console.log(e.message);
            }
        }


        //从数据库返回值中拿到选择场馆的id值
        function getSelectedIDs(promiseDatas) {
            var ids;
            for (var i = 0; i < promiseDatas.count; i++) {

                if (!ids)
                    ids = promiseDatas.data[i].Id;
                else
                    ids += "," + promiseDatas.data[i].Id;
            }
            if (promiseDatas.count == 1) {
                ids += ',' + '';
            }
            return ids;
        }


        return queryMgr;
    })();

    var lsDataOrger = (function () {
        var resvDic = {};
        var dataOrger = {};
        var resvDict = {
            //stadium
            'Name': '场地名称',
            'Category': '场地代码',
            'Owner': '场地归属',
            'Street': '所属街道',
            'StadiumBase': '基本信息',
            //stadiumbase
            'OrgCode': '组织机构代码',
            'Place': '场地分布',
            'FoundYear': '建成年份',
            'LandArea': '用地面积（㎡）',
            'BuildingArea': '建筑面积（㎡）',
            'SiteArea': '场地面积（㎡）',
            'Investment': '投资金额（合计）',
            'Fiscal': '财政拨款',
            'CommonWeal': '体彩公益金',
            'SelfRaised': '单位自筹',
            'SocialDonate': '社会捐赠',
            'Other': '其他',
            //'Owner2StadiumMediatorCollection': '场地归属',
            //'Owner2StadiumMediator': '场地归属',
            //ecostatus
            'StadiumEco': '场地名称',
            'Year': '年份',
            'Employee': '场地从业人员人数',
            'OperateMode': '运营模式',
            'OpenStatus': '对外开放情况',
            'OpeningDays': '年开放天数',
            'ClientCount': '平均每周接待健身人次',
            'Income': '收入合计（千元）',
            'Expend': '支出合计（千元）',
            'StatdiumName': '场地名称',
            'StreetStr': '所属街道'
            //jqGridColumnsConfigs
        };

        dataOrger.setData = function (data, intrinsicDict) {
            var orgedData = [];
            resvDic = intrinsicDict || resvDict;//若用户传入自定义字典则替换保留字典
            util.eachProp(data, function (item) {
                orgedData.push(iterateProp(item));
            });

            return orgedData;
        }

        //迭代读取从服务器发回的数据
        function iterateProp(item, parentTemp) {
            var temp = parentTemp || {};
            for (var prop in item) {
                if (resvDic[prop] && resvDic.hasOwnProperty(prop)) {
                    if (prop === 'StadiumBase') {
                        iterateProp(item[prop], temp);
                        continue;
                    }
                    if (prop === 'EcoStatus') {
                        iterateAry(item[prop].array, temp);
                        continue;
                    }
                    switch (typeof (item[prop])) {
                        case 'object':
                            {
                                if (item[prop]) {
                                    temp[resvDic[prop]] = item[prop]['Name'] || item[prop];
                                } else {
                                    temp[resvDic[prop]] = '';
                                }
                                break;
                            }
                        case 'boolean':
                            {
                                temp[resvDic[prop]] = item[prop] ? '是' : '否';
                                break;
                            }
                            //将null和undefined转换为string.empty
                        case 'undefined':
                            {
                                temp[resvDic[prop]] = '';
                                break;
                            }
                        default:
                            temp[resvDic[prop]] = item[prop];
                    }
                }
            }
            return temp;
        }

        function iterateAry(ary, temp) {
            if (ary && ary.length > 0) {
                for (var index in ary) {
                    //iterateProp(ary[index], temp);
                    if (temp['场地归属']) {
                        temp['场地归属'] = temp['场地归属'] + ',' + ary[index]['Owner'].Name;
                    } else {
                        temp['场地归属'] = ary[index]['Owner'].Name;
                    }
                }
            } else {
                temp['场地归属'] = '';
            }
        }

        return dataOrger;
    })();

    var baiduMap = (function () {
        var bMap;

        var baiduapi = {};
        // ReSharper disable once WrongExpressionStatement
        baiduapi.markerClusterer;
        baiduapi.initialMapCtrls = function () {
            baiduapi.bmap = new window.BMap.Map('mapID');
            bMap = baiduapi.bmap;
            bMap.centerAndZoom('武汉 洪山区', 12);
            bMap.addControl(new window.BMap.NavigationControl()); // 添加平移缩放控件
            bMap.addControl(new window.BMap.ScaleControl()); // 添加比例尺控件
            bMap.addControl(new window.BMap.OverviewMapControl()); //添加缩略地图控件
            bMap.enableScrollWheelZoom(); //启用滚轮放大缩小
            bMap.addControl(new window.BMap.MapTypeControl()); //添加地图类型控件
            initialPanorama(bMap);
            showTraffic();
            addContextMenu();
        }

        function initialPanorama(map) {
            var stCtrl = new window.BMap.PanoramaControl(); //构造全景控件
            stCtrl.setOffset(new window.BMap.Size(20, 45));
            map.addControl(stCtrl);//添加全景控件
        }

        //这里传入stadium对象
        baiduapi.addPin2Map = function (stadiumItem) {
            try {
                //如果存储百度地图才运行下面代码
                var x = stadiumItem.Longitude, y = stadiumItem.Latitude;
                var siteName = stadiumItem.Name;
                if (bMap) {
                    var marker;//点聚合

                    var stadiumName = stadiumItem.Name;
                    if (x && y) {
                        var point = new window.BMap.Point(x, y);
                        marker = new window.BMap.Marker(point, { title: stadiumName });
                        marker.addEventListener("click", function () { showInfoWindow(stadiumItem, marker); });
                        //bMap.addOverlay(marker);
                        //setPanoramaLabel(_baiduMap, point, enterpriseName);
                    } else {
                        // 将地址解析结果显示在地图上,并调整地图视野
                        if (siteName) {
                            // 创建地址解析器实例
                            var myGeo = new window.BMap.Geocoder();

                            myGeo.getPoint(siteName, function (pt) {
                                if (pt) {
                                    //_baiduMap.centerAndZoom(point, 12);
                                    marker = new window.BMap.Marker(pt, { title: stadiumName });
                                    marker.addEventListener("click", function () { showInfoWindow(stadiumItem, marker); });
                                    //bMap.addOverlay(marker);
                                    //setPanoramaLabel(_baiduMap, point, enterpriseName);
                                }
                            }, "武汉市 洪山区");
                        }
                    }
                    return marker;
                }
            } catch (e) {
                console.log(e.message);
            }

        }

        function getInfoWindowPara(stadiumItem) {
            var para = {};
            para.title = stadiumItem.Name;
            para.width = 300;
            para.height = 180;
            para.panel = 'panel';
            para.enableAutoPan = true;
            para.searchTypes = [];
            para.enableSendToPhone = false;
            return para;
        }

        function getContent(stadiumItem) {
            //var baseInfo = stadiumItem.StadiumBase;
            var orgCode = stadiumItem.OrgCode || '未填报';
            var place = stadiumItem.Place || '未填报';
            var foundYear = stadiumItem.FoundYear || '未填报';
            var cate = stadiumItem.Category.Name || '未填报';
            var street = stadiumItem.Street.Name || '未填报';
            var noteInfo = stadiumItem.Note || '未填报';
            var stadiumId = stadiumItem.Id;
            //var content = '<div style=\"margin:0;line-height:20px;padding:2px;\">' +
            //              '<img src=' + imageStr + 'alt=\"\" style=\"float:right;zoom:1;overflow:hidden;width:100px;height:100px;margin-left:3px;\"/>' +
            //              '<b>地址:</b>' + addrStr + '<br/>' +
            //              '<b>电话:</b>' + phoneStr + '<br/>' +
            //              '<b>公司名称:</b>' + nameStr + '<br/>' +
            //              '<b>网址:</b>' + '<a href=' + websiteStr + 'target="_blank">' + website + '</a>' +
            //              '</div>';

            var content;
            if (stadiumItem.Photo) {
                var imageSrc = 'data:image/svg;base64,' + stadiumItem.Photo;
                var imageStr = '\"' + imageSrc.toString() + '\"';

                content = '<div style=\"margin:0;line-height:20px;padding:2px;\">' +
                    '<img src=' + imageStr + 'alt=\"\" style=\"float:right;zoom:1;overflow:hidden;width:100px;height:100px;margin-left:3px;\"/>' +
                    '<b>场地代码   ：</b>' + cate + '<br/>' +
                    '<b>组织机构代码：</b>' + orgCode + '<br/>' +
                    '<b>场地分布   ：</b>' + place + '<br/>' +
                    '<b>建成年份   ：</b>' + foundYear + '<br/>' +
                    '<b>所属街道   ：</b>' + street + '<br/>' +
                    '<b>相册       :</b>' + '<a data-para = ' + stadiumId + ' href = \'#\' onclick = "window.albumMgr.init(this);">点击查看场地图片</a>' + '<br/>' +
                    '<b>备注信息   ：</b>' + noteInfo + '<br/>' +
                    '</div>';
            } else {
                content = '<div style=\"margin:0;line-height:20px;padding:2px;\">' +
                    '<b>场地代码   ：</b>' + cate + '<br/>' +
                    '<b>组织机构代码：</b>' + orgCode + '<br/>' +
                    '<b>场地分布   ：</b>' + place + '<br/>' +
                    '<b>建成年份   ：</b>' + foundYear + '<br/>' +
                    '<b>所属街道   ：</b>' + street + '<br/>' +
                    '<b>相册       :</b>' + '<a data-para = ' + stadiumId + ' href = \'#\' onclick = "window.albumMgr.init(this);">点击查看场地图片</a>' + '<br/>' +
                    '<b>备注信息   ：</b>' + noteInfo + '<br/>' +
                    '</div>';
            }

            return content;
        }

        function showInfoWindow(stadiumItem, pMarker) {
            var searchInfoWindow = null;
            var winPara = getInfoWindowPara(stadiumItem);
            var content = getContent(stadiumItem);
            searchInfoWindow = new window.BMapLib.SearchInfoWindow(bMap, content, winPara);
            searchInfoWindow.open(pMarker);
        }

        function showTraffic() {
            var trafficCtrl = new window.BMapLib.TrafficControl({ showPanel: false });
            bMap.addControl(trafficCtrl);
            trafficCtrl.setAnchor(BMAP_ANCHOR_BOTTOM_RIGHT);
        }

        function addContextMenu() {
            try {
                var menu = new window.BMap.ContextMenu();
                var txtMenuItem = [
                {
                    text: '回到初始位置',
                    callback: function () { bMap.centerAndZoom('武汉 洪山区', 12); }
                },
                {
                    text: '地图测距',
                    callback: function () {
                        var disTool = new window.BMapLib.DistanceTool(bMap);
                        disTool.open();
                    }
                }
                ];
                for (var i = 0, len = txtMenuItem.length; i < len; i++) {
                    menu.addItem(new window.BMap.MenuItem(txtMenuItem[i].text, txtMenuItem[i].callback, 100));
                }
                bMap.addContextMenu(menu);
            } catch (e) {
                console.log(e.message);
            }
        }

        return baiduapi;
    })();

    var uiManager = (function () {
        var contentItem, element, screen;
        // ReSharper disable once InconsistentNaming
        function UiManager(config) {
            try {
                //this._jqManager = config.jqGridManager || jqGridManager.create();
                //this._dataOrger = config.dataOrganizer || dataOrganizer.create();
                contentItem = config.contentItem;
                screen = contentItem.screen;
                element = config.element;
            } catch (e) {
                console.log(e.message);
            }
        };

        function addPanelSearch(panelId) {
            $(panelId).panel({
                tools: [
                    {
                        iconCls: 'icon-search',
                        handler: function () {
                            queryManager.doQuery(screen, panelId);
                        }
                    }
                ]
            });
        };

        function initJqGrid() {
            var stadiumConf = dataManager.getStadiumJqConf('#stadiumInfo', '#stadiumPager');
            jqGridMgr.setJqGridWithCustomBtns('#stadiumInfo', '#stadiumPager', stadiumConf);

            var ecoStatusConf = dataManager.getEcoStatusConf('#ecoStatusInfo', '#ecoStatusPager');
            jqGridMgr.setJqGridWithCustomBtns('#ecoStatusInfo', '#ecoStatusPager', ecoStatusConf);

            util.resizJqGrid();
        };

        function initJqGridTest(permissions) {
            myapp.activeDataWorkspace.ApplicationData.JqgridColConfQuery(permissions)
                .execute()
                .then(function (colConfigs) {
                    var propDict = {
                        'Name': 'name',
                        'Index': 'index',
                        'Width': 'width',
                        'Sorttype': 'sorttype',
                        'SummaryTpl': 'summaryTpl',
                        'SummaryType': 'summaryType',
                        'JqGrid': 'JqGrid'
                    };
                    var colConf = lsDataOrger.setData(colConfigs.results, propDict);
                    var colNamesStadium = [];
                    var colNamesEconomy = [];
                    var colConfStatdium = $.grep(colConf, function (e) {
                        return e.JqGrid === 'Stadium';
                    });
                    var colConfEconomy = $.grep(colConf, function (e) {
                        return e.jqGrid === 'Ecostatus';
                    });
                    util.eachAry(colConf, function (aryItem) {
                        if (aryItem.JqGrid === 'Ecostatus') {
                            colNamesEconomy.push(aryItem.name);
                        } else {
                            colNamesStadium.push(aryItem.name);
                        }
                        //colNames.push(aryItem.name);
                    });
                    var stadiumConf2 = dataManager.getStadiumJqConf('#stadiumInfo', '#stadiumPager');
                    var stadiumConf = dataManager.getStadiumJqConfTest('#stadiumInfo', '#stadiumPager', { colNames: colNamesStadium, colModel: colConfStatdium });
                    jqGridMgr.setJqGridWithCustomBtns('#stadiumInfo', '#stadiumPager', stadiumConf);

                    var ecoStatusConf = dataManager.getEcoStatusConf('#ecoStatusInfo', '#ecoStatusPager');
                    jqGridMgr.setJqGridWithCustomBtns('#ecoStatusInfo', '#ecoStatusPager', ecoStatusConf);

                    util.resizJqGrid();
                    //初始化分组依据
                    var groupByStock = $('#groupBySelector');
                    var ecoGroupByer = $('#EcoGroupByer');

                    var grouperStadium = JqGridGrouper.createNew({ 'pNode': groupByStock, 'groupCols': colNamesStadium, 'jqGridId': '#stadiumInfo' });
                    grouperStadium.init();
                    var grouperEco = JqGridGrouper.createNew({ 'pNode': ecoGroupByer, 'groupCols': colNamesEconomy, 'jqGridId': '#ecoStatusInfo' });
                    grouperEco.init();
                    //grouperStadium.init({ 'pNode': groupByStock, 'groupCols': colNamesStadium, 'jqGridId': '#stadiumInfo' });
                    //grouperEco.init({ 'pNode': ecoGroupByer, 'groupCols': colNamesEconomy, 'jqGridId': '#ecoStatusInfo' });
                    //bindComboEvent();
                });
        };

        function initPivot(pivotId) {
            try {
                window.__pivotHash__[pivotId] = $(pivotId).pivotUI(
                    [],
                    { renderers: $.pivotUtilities.locales.zh.renderers },
                    true,
                    'zh'
                );
                $(window).bind('resize', function () {
                    $(pivotId).width(($('#regioncenter').width() * 0.9));
                });

            } catch (e) {
                console.log(e);
            }
        }

        function bindComboEvent() {
            //get the jqGrid groupField array
            var getGpFields = function (tbName) {
                var gpField = $(tbName).jqGrid('getGridParam', 'groupingView');
                return gpField.groupField;
            };
            //对groupField进行排列，返回排列结果
            var getGroupIdentify = function (gpField) {
                //排列所有的分组依据，返回所有的排列结果
                var queue = function (arr, size) {
                    if (size > arr.length) {
                        return null;
                    }
                    var allResult = [];

                    (function (arr, size, result) {
                        if (result.length == size) {
                            allResult.push(result);
                        } else {
                            for (var i = 0, len = arr.length; i < len; i++) {
                                var newArr = [].concat(arr), //work as deepcopy
                                    curItem = newArr.splice(i, 1);
                                arguments.callee(newArr, size, [].concat(result, curItem));
                            }
                        }
                    })(arr, size, []);

                    return allResult;
                };
                return queue(gpField, gpField.length);
            };
            //对排列结果建立索引（字典）
            var getGroupDic = function (comboData) {
                var obj = {};
                var disArr = [];
                var hash = [];
                var id = 0;
                comboData.forEach(function (subArr) {
                    var disStr;
                    //construct combobox display strings
                    subArr.forEach(function (str) {
                        if (!disStr) {
                            disStr = str;
                        } else {
                            disStr += '-' + str;
                        }
                    });
                    var option = {};
                    option.id = id++;
                    option.text = disStr;
                    disArr.push(option);
                    hash[disStr] = subArr;
                });
                disArr.push({ id: id++, text: '无' });
                obj.disArr = disArr;
                obj.hash = hash;

                return obj;

            };

            var applyGroup = function (comboName, tbName, gpField) {
                var select = $(comboName).combobox('getText');
                if (select == '无') {
                    disableGroup(tbName);
                } else {
                    $(tbName).setGridParam({
                        groupingView: {
                            groupField: gpField[select]
                        },
                        grouping: true
                    }).trigger('reloadGrid');
                }
            };

            var disableGroup = function (tbName) {
                $(tbName).setGridParam({
                    grouping: false
                }).trigger('reloadGrid');
            }

            var comboOnSelect = function (tbName, combo) {
                //var userPermission = arguments[2];
                //if (userPermission && permissionChecker.hasPermission(userPermission, combo)) {
                //}
                var combData = getGroupIdentify(getGpFields(tbName));
                var combObj = getGroupDic(combData);
                $(combo).combobox({ data: combObj.disArr });
                $(combo).combobox({ onSelect: function () { applyGroup(combo, tbName, combObj.hash); } });

            };

            comboOnSelect('#ecoStatusInfo', '#ecoCombo');
            comboOnSelect('#stadiumInfo', '#stadiumCombo');
        };

        UiManager.prototype = {
            initialEasyUi: function () {
                var userPermissions = util.getPermissionAry(arguments[0]);//arguments[0]默认为用户权限，未转换为数组
                $(element).append(uiBuilder.buildLayout(userPermissions));//构建界面

                $('#layout').layout();
                $(".easyui-tabs").tabs();
                $('.easyui-linkbutton').linkbutton();
                $('#accordionID').accordion();
                //var groupByStock = $('#groupBySelector');
                //if (groupByStock) {
                //    groupByStock.append("<div id='groupBy-ul' style='margin:5px auto 10px auto;'><div id='summary-stock'><div class='dt'>分组依据：</div><div class='dd'><div id='result-stock'><div class='text'><div>...</div></div><div id='groupBy-closeBtn' class='close'></div></div></div></div></div>");
                //}


                dataManager.loadCateTree('#cateTree');
                dataManager.loadTree('#streetTree', 'StreetSet');
                dataManager.loadTree('#ownerTree', 'OwnerSet');
                dataManager.loadStaticTree('#placeTree', dataManager.getPlaceTreeData());
                dataManager.loadStaticTree('#openingTree', dataManager.getOpenTreeData());
                dataManager.loadStaticTree('#recieveTree', dataManager.getRecvTreeData());
                dataManager.loadStaticTree('#operModeTree', dataManager.getOperModeTreeData());

                $('#lbSeachID').bind('click', function (e) {
                    queryManager.doQuery(screen);
                });
                $('#expandID').bind('click', function (e) {
                    $('#cateTree').tree('expandAll');
                });
                $('#collapseID').bind('click', function (e) {
                    $('#cateTree').tree('collapseAll');
                });

                addPanelSearch('#streetPanel');
                addPanelSearch('#catePanel');
                addPanelSearch('#placePanel');
                addPanelSearch('#ownerPanel');
                addPanelSearch('#openingPanel');
                addPanelSearch('#recievePanel');
                addPanelSearch('#operModePanel');

                //initJqGrid();
                initJqGridTest(arguments[0]);//arguments[0]默认为用户权限
                //bindComboEvent();

                //initPivot('#ecoPivot');
                //initPivot('#stadiumPivot');

                $(window).resize(function () {
                    util.resizeLayout();
                });
                util.onRegionCentrChange();

                util.resizeLayout();
                baiduMap.initialMapCtrls();
            },

        }

        return UiManager;
    })();

    var mainManager = (function () {
        var easyUiManager;
        function MainManager(element, contentItem) {
            this._element = element;
            this._contentItem = contentItem;
            easyUiManager = new uiManager({ contentItem: contentItem, element: element });
        }

        MainManager.prototype = {
            run: function () {
                try {
                    easyUiManager.initialEasyUi(arguments[0]);

                } catch (e) {
                    console.log(e.message);
                }
            }
        }

        return MainManager;
    })();

    var managerFactory = {
        create: function (element, contentItem) {
            return new mainManager(element, contentItem);
        }
    };

    return managerFactory;
});