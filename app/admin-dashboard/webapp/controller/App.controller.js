sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend(
        "asset.lifecycle.dashboard.admindashboard.controller.App",
        {
            onInit: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .initialize();

            }
        }
    );
});