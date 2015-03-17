/**
 * Created by chopic on 2014/11/6.
 */
(function () {
    var frFmt, frFmtInt, frFmtPct, nf, tpl;

    nf = $.pivotUtilities.numberFormat;

    tpl = $.pivotUtilities.aggregatorTemplates;

    frFmt = nf({
        thousandsSep: " ",
        decimalSep: "."
    });

    frFmtInt = nf({
        digitsAfterDecimal: 0,
        thousandsSep: " ",
        decimalSep: "."
    });

    frFmtPct = nf({
        digitsAfterDecimal: 1,
        scaler: 100,
        suffix: "%",
        thousandsSep: " ",
        decimalSep: "."
    });

    $.pivotUtilities.locales.zh = {
        localeStrings: {
            renderError: "渲染时发生未知错误.",
            computeError: "计算时发生未知错误.",
            uiRenderError: "渲染界面时发生未知错误.",
            selectAll: "全选",
            selectNone: "全部不选",
            tooMany: "数据过多未能列出",
            filterResults: "筛选结果",
            totals: "总计",
            vs: "对比",
            by: "依据"
        },
        aggregators: {
            "个数": tpl.count(frFmtInt),
            "个数(唯一值)": tpl.countUnique(frFmtInt),
            "列表(唯一值)": tpl.listUnique(", "),
            "总数": tpl.sum(frFmt),
            "总数(取整)": tpl.sum(frFmtInt)
        },
        renderers: {
            "表": $.pivotUtilities.renderers["Table"],
            "条线图": $.pivotUtilities.renderers["Table Barchart"],
            "热力表": $.pivotUtilities.renderers["Heatmap"],
            "热力表(行)": $.pivotUtilities.renderers["Row Heatmap"],
            "热力表(列)": $.pivotUtilities.renderers["Col Heatmap"],
            '饼图': $.pivotUtilities.highChart_renderers['pie'],
            //'线画图': $.pivotUtilities.highChart_renderers['LineChart'],
            '条状图': $.pivotUtilities.highChart_renderers['bar'],
            '直方图': $.pivotUtilities.highChart_renderers['column'],
            '直方图（层叠）': $.pivotUtilities.highChart_renderers['stackedcolumn'],
            '线状图': $.pivotUtilities.highChart_renderers['line'],
            '区域图': $.pivotUtilities.highChart_renderers['area'],
            '散点图': $.pivotUtilities.highChart_renderers['scatter'],
            '气泡图': $.pivotUtilities.highChart_renderers['bubbles'],
            //'盒状图': $.pivotUtilities.highChart_renderers['box'],
        }
    };

}).call(this);