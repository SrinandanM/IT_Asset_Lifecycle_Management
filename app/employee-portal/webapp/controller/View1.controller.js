sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    JSONModel
) {
    "use strict";

    return Controller.extend(
        "employeeportal.controller.View1",
        {

            onInit: function () {
            },
            _loadAssets: async function () {

    const response = await fetch(
        "/odata/v4/asset-employee/Assets"
    );

    const data = await response.json();

    const oModel =
new JSONModel(
                data.value
        );

    this.getView().setModel(
        oModel,
        "assets"
    );
},

_loadRequests: async function () {

    const response = await fetch(
        "/odata/v4/asset-employee/AssetRequests"
    );

    const data = await response.json();

    const oModel =
new JSONModel(
                data.value
        );

    this.getView().setModel(
        oModel,
        "requests"
    );

},

_loadProfile: async function () {

    const response = await fetch(
        "/odata/v4/asset-employee/Employees"
    );

    const data = await response.json();

    if (
        data.value &&
        data.value.length > 0
    ) {

        const oModel =
            new JSONModel(
                data.value[0]
            );

        this.getView().setModel(
            oModel,
            "profile"
        );

    }

},

            onMenuSelect: function (oEvent) {

                const sTitle =
                    oEvent.getParameter("listItem")
                        .getTitle();

                this.byId("dashboardContainer")
                    .setVisible(false);

                this.byId("assetsContainer")
                    .setVisible(false);

                this.byId("requestsContainer")
                    .setVisible(false);

                this.byId("profileContainer")
                    .setVisible(false);

                this.byId("contentTitle")
                    .setText(sTitle);

                switch (sTitle) {

                    case "Dashboard":

                        this.byId("contentText")
                            .setText(
                                "Employee Self Service Dashboard"
                            );

                        this.byId("dashboardContainer")
                            .setVisible(true);

                        break;

case "My Assets":

    this._loadAssets();

    this.byId("assetsContainer")
        .setVisible(true);

    break;

case "My Requests":

    this._loadRequests();

    this.byId("requestsContainer")
        .setVisible(true);

    break;

case "My Profile":

    this._loadProfile();

    this.byId("profileContainer")
        .setVisible(true);

    break;
                }
            }

        }
    );
});