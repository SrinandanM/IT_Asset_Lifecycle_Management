sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend(
        "asset.lifecycle.dashboard.managerdashboard.controller.View1",
        {

onInit: function () {

    this._loadKPIs();

    this._loadStatusChart();

    this._loadCategoryChart();

    this._loadDepartmentChart();

},

_loadKPIs: async function () {

    const employeesResponse =
        await fetch(
            "/odata/v4/asset-manager/Employees"
        );

    const employeesData =
        await employeesResponse.json();

    const requestsResponse =
        await fetch(
            "/odata/v4/asset-manager/AssetRequests"
        );

    const requestsData =
        await requestsResponse.json();

    const assetsResponse =
        await fetch(
            "/odata/v4/asset-manager/Assets"
        );

    const assetsData =
        await assetsResponse.json();

    const pending =
        requestsData.value.filter(
            r => r.status === "PENDING"
        ).length;

    const approved =
        requestsData.value.filter(
            r => r.status === "APPROVED"
        ).length;

    const rejected =
        requestsData.value.filter(
            r => r.status === "REJECTED"
        ).length;

    const availableAssets =
        assetsData.value.filter(
            a => a.status === "AVAILABLE"
        ).length;

    const assignedAssets =
        assetsData.value.filter(
            a => a.status === "ASSIGNED"
        ).length;

    const oModel = new JSONModel({

        totalAssets:
            employeesData.value.length,

        availableAssets:
            pending,

        assignedAssets:
            approved,

        maintenanceAssets:
            rejected,

        retiredAssets:
            availableAssets,

        archivedAssets:
            assignedAssets

    });

    this.getView().setModel(
        oModel,
        "kpi"
    );

},


_loadStatusChart: async function () {

    const response = await fetch(
        "/odata/v4/asset-manager/AssetRequests"
    );

    const data = await response.json();

    const requests = data.value;

    const chartData = [

        {
            status: "PENDING",
            assetCount:
                requests.filter(
                    r => r.status === "PENDING"
                ).length
        },

        {
            status: "APPROVED",
            assetCount:
                requests.filter(
                    r => r.status === "APPROVED"
                ).length
        },

        {
            status: "REJECTED",
            assetCount:
                requests.filter(
                    r => r.status === "REJECTED"
                ).length
        }

    ];

    const oModel =
        new JSONModel(chartData);

    this.getView().setModel(
        oModel,
        "status"
    );

    this.byId("statusChart").setVizProperties({
        title: {
            visible: true,
            text: "Requests By Status"
        },
        legend: {
            visible: true
        }
    });

},

_loadCategoryChart: async function () {

    const response = await fetch(
        "/odata/v4/asset-manager/AssetRequests"
    );

    const data = await response.json();

    const requests = data.value;

    const categoryMap = {};

    requests.forEach(req => {

        if (!categoryMap[req.categoryName]) {

            categoryMap[
                req.categoryName
            ] = 0;

        }

        categoryMap[
            req.categoryName
        ]++;

    });

    const chartData =
        Object.keys(categoryMap)
            .map(key => ({

                categoryName: key,

                assetCount:
                    categoryMap[key]

            }));

    const model =
        new JSONModel(
            chartData
        );

    this.getView().setModel(
        model,
        "category"
    );

    this.byId("categoryChart").setVizProperties({
        title: {
            visible: true,
            text: "Requests By Category"
        },
        legend: {
            visible: true
        }
    });

},
_loadDepartmentChart: async function () {

    const deptResponse =
        await fetch(
            "/odata/v4/asset-manager/Departments"
        );

    const deptData =
        await deptResponse.json();

    const empResponse =
        await fetch(
            "/odata/v4/asset-manager/Employees"
        );

    const empData =
        await empResponse.json();

    const reqResponse =
        await fetch(
            "/odata/v4/asset-manager/AssetRequests"
        );

    const reqData =
        await reqResponse.json();

    const departments =
        deptData.value;

    const employees =
        empData.value;

    const requests =
        reqData.value;

    const result = [];

    departments.forEach(dept => {

        const deptEmployees =
            employees.filter(
                e =>
                    e.department_ID ===
                    dept.ID
            );

        let count = 0;

        deptEmployees.forEach(emp => {

            count += requests.filter(
                req =>
                    req.employee_ID ===
                    emp.ID
            ).length;

        });

        result.push({

            departmentName:
                dept.departmentName,

            assetCount: count

        });

    });

    const model =
        new JSONModel(result);

    this.getView().setModel(
        model,
        "department"
    );

    this.byId("departmentChart").setVizProperties({
        title: {
            visible: true,
            text: "Requests By Department"
        },
        legend: {
            visible: true
        }
    });

},
onEmployeesTilePress: async function () {

    const response =
        await fetch(
            "/odata/v4/asset-manager/Employees"
        );

    const data =
        await response.json();

    const names =
        data.value
            .map(e => e.fullName)
            .join("\n");

    MessageBox.information(
        names,
        {
            title: "Employees"
        }
    );

},

onPendingTilePress: function () {

    MessageBox.information(
        "Pending Requests Clicked"
    );

},

onApprovedTilePress: function () {

    MessageBox.information(
        "Approved Requests Clicked"
    );

},

onRejectedTilePress: function () {

    MessageBox.information(
        "Rejected Requests Clicked"
    );

},

        }
    );
});