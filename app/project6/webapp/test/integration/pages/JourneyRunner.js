sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"project6/test/integration/pages/AssetRequestsList.gen",
	"project6/test/integration/pages/AssetRequestsObjectPage.gen"
], function (JourneyRunner, AssetRequestsListGenerated, AssetRequestsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('project6') + '/test/flp.html#app-preview',
        pages: {
			onTheAssetRequestsListGenerated: AssetRequestsListGenerated,
			onTheAssetRequestsObjectPageGenerated: AssetRequestsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

