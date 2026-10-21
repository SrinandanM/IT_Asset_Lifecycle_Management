sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend(
        "asset.lifecycle.portal.adminportal.controller.View1",
        {

            onMenuSelect: function (oEvent) {

                const sTitle =
                    oEvent.getParameter("listItem").getTitle();

                switch (sTitle) {

                    case "Dashboard":
                        window.open(
                            "/asset.lifecycle.dashboard.admindashboard/index.html",
                            "_blank"
                        );
                        break;

                    case "Assets":
                        window.open(
                            "/adminasset/index.html",
                            "_blank"
                        );
                        break;

                    case "Asset Requests":
                        window.open(
                            "/project6/index.html",
                            "_blank"
                        );
                        break;

                    case "Employees":
                        alert("Employees Module");
                        break;

                    case "Departments":
                        alert("Departments Module");
                        break;

                    case "Vendors":
                        alert("Vendors Module");
                        break;

                    case "Categories":
                        alert("Categories Module");
                        break;
                }
            }

        }
    );
});