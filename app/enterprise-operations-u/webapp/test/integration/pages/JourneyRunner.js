sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"enterprise/operations/enterpriseoperationsu/test/integration/pages/RequestsList",
	"enterprise/operations/enterpriseoperationsu/test/integration/pages/RequestsObjectPage",
	"enterprise/operations/enterpriseoperationsu/test/integration/pages/ApprovalsObjectPage"
], function (JourneyRunner, RequestsList, RequestsObjectPage, ApprovalsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('enterprise/operations/enterpriseoperationsu') + '/test/flp.html#app-preview',
        pages: {
			onTheRequestsList: RequestsList,
			onTheRequestsObjectPage: RequestsObjectPage,
			onTheApprovalsObjectPage: ApprovalsObjectPage
        },
        async: true
    });

    return runner;
});

