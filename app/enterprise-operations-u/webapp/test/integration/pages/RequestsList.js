sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'enterprise.operations.enterpriseoperationsu',
            componentId: 'RequestsList',
            contextPath: '/Requests'
        },
        CustomPageDefinitions
    );
});