sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"enterprise/operations/enterpriseoperationsui/test/integration/pages/RequestsList",
	"enterprise/operations/enterpriseoperationsui/test/integration/pages/RequestsObjectPage"
], function (JourneyRunner, RequestsList, RequestsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('enterprise/operations/enterpriseoperationsui') + '/test/flpSandbox.html#enterpriseoperationsenterprise-tile',
        pages: {
			onTheRequestsList: RequestsList,
			onTheRequestsObjectPage: RequestsObjectPage
        },
        async: true
    });

    return runner;
});

