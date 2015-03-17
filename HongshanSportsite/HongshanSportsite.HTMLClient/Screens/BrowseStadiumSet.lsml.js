/// <reference path="../GeneratedArtifacts/viewModel.js" />

myapp.BrowseStadiumSet.Group_render = function (element, contentItem) {
    // Write code here.
    function callGetUserPermissions(operation) {
        $.ajax({
            type: 'post',
            data: {},
            url: '../handlers/GetUserPermissions.ashx',
            success: operation.code(function ajaxSuccess(ajaxResult) {
                operation.complete(ajaxResult);
            })
        });
    }
    window.initialWelcomePage();

    msls.promiseOperation(callGetUserPermissions).then(function(promiseRst) {
        try {
            var mainManager = window.mainManager.create(element, contentItem);
            mainManager.run(promiseRst);
        } catch (e) {
            console.log(e.message);
        }
    });

    //try {
    //    var mainManager = window.mainManager.create(element, contentItem);
    //    mainManager.run();
    //} catch (e) {
    //    console.log(e.message);
    //}

};