sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend(
        "asset.lifecycle.dashboard.admindashboard.controller.View1",
        {

            onInit: function () {

                this._loadKPIs();
                this._loadStatusChart();
                this._loadCategoryChart();
                this._loadDepartmentChart();

            },

            _loadKPIs: async function () {

                const response = await fetch(
                    "/odata/v4/asset-admin/AssetKPIs"
                );

                const data = await response.json();

                if (data.value && data.value.length > 0) {

                    const oModel = new JSONModel(
                        data.value[0]
                    );

                    this.getView().setModel(
                        oModel,
                        "kpi"
                    );
                }
            },

            _loadStatusChart: async function () {

                const response = await fetch(
                    "/odata/v4/asset-admin/AssetStatusChart"
                );

                const data = await response.json();

                const oModel = new JSONModel(
                    data.value
                );

                this.getView().setModel(
                    oModel,
                    "status"
                );

                this.byId("statusChart").setVizProperties({
                    title: {
                        visible: true,
                        text: "Asset Status Distribution"
                    },
                    legend: {
                        visible: true
                    }
                });

            },

            _loadCategoryChart: async function () {

                const response = await fetch(
                    "/odata/v4/asset-admin/AssetCategoryChart"
                );

                const data = await response.json();

                const model = new JSONModel(
                    data.value
                );

                this.getView().setModel(
                    model,
                    "category"
                );

                this.byId("categoryChart").setVizProperties({
                    title: {
                        visible: true,
                        text: "Assets By Category"
                    },
                    legend: {
                        visible: true
                    }
                });

            },

            _loadDepartmentChart: async function () {

                const response = await fetch(
                    "/odata/v4/asset-admin/DepartmentAssetChart"
                );

                const data = await response.json();

                const model = new JSONModel(
                    data.value
                );

                this.getView().setModel(
                    model,
                    "department"
                );

                this.byId("departmentChart").setVizProperties({
                    title: {
                        visible: true,
                        text: "Assets By Department"
                    },
                    legend: {
                        visible: true
                    }
                });

            }

        }
    );
});