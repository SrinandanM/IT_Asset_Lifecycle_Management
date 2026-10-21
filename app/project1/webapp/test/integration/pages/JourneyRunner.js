sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"project1/test/integration/pages/AssetKPIsList.gen",
	"project1/test/integration/pages/AssetKPIsObjectPage.gen"
], function (JourneyRunner, AssetKPIsListGenerated, AssetKPIsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('project1') + '/test/flp.html#app-preview',
        pages: {
			onTheAssetKPIsListGenerated: AssetKPIsListGenerated,
			onTheAssetKPIsObjectPageGenerated: AssetKPIsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

