sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"project5/test/integration/pages/AssetRequestsList.gen",
	"project5/test/integration/pages/AssetRequestsObjectPage.gen"
], function (JourneyRunner, AssetRequestsListGenerated, AssetRequestsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('project5') + '/test/flp.html#app-preview',
        pages: {
			onTheAssetRequestsListGenerated: AssetRequestsListGenerated,
			onTheAssetRequestsObjectPageGenerated: AssetRequestsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

