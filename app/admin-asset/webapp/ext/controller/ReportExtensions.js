sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Button",
    "sap/m/Select",
    "sap/ui/core/Item"
], function (
    ControllerExtension,
    MessageBox,
    Dialog,
    VBox,
    Label,
    Input,
    Button,
    Select,
    Item
) {
    "use strict";

    return ControllerExtension.extend(
        "sap.suite.ui.generic.template.ListReport.view.ListReport",
        {
            onDownloadReport: async function () {
                try {
                    const oModel = this.getView().getModel();
                    const reportType = "assetInventory";

                    console.log("Starting download for:", reportType);

                    // Show loading
                    sap.ui.core.BusyIndicator.show(0);

                    const response = await new Promise((resolve, reject) => {
                        oModel.callFunction("/DownloadReport", {
                            method: "GET",
                            urlParameters: {
                                reportType: reportType
                            },
                            success: resolve,
                            error: reject
                        });
                    });

                    sap.ui.core.BusyIndicator.hide();

                    console.log("Download response received");

                    // Decode base64 to binary
                    const binaryString = atob(response.content);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    // Create blob and download
                    const blob = new Blob([bytes], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = response.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    MessageBox.success(
                        'Report downloaded successfully: ' + response.filename
                    );
                } catch (error) {
                    console.error("Download error:", error);
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(
                        'Download failed: ' + (error.message || error.responseText)
                    );
                }
            },

            onShareReport: async function () {
                try {
                    const oModel = this.getView().getModel();
                    const self = this;

                    // Create email input
                    const oEmailInput = new Input({
                        id: "shareEmailInput",
                        placeholder: "user@company.com",
                        type: "Email"
                    });

                    // Create report type select
                    const oReportSelect = new Select({
                        id: "shareReportSelect",
                        items: [
                            new Item({
                                key: "assetInventory",
                                text: "Asset Inventory Report"
                            }),
                            new Item({
                                key: "employees",
                                text: "Employee Report"
                            }),
                            new Item({
                                key: "requests",
                                text: "Asset Request Report"
                            })
                        ]
                    });
                    oReportSelect.setSelectedKey("assetInventory");

                    // Create dialog
                    const oDialog = new Dialog({
                        title: "Share Report via Email",
                        type: "Message",
                        contentWidth: "500px",
                        content: [
                            new VBox({
                                items: [
                                    new Label({ text: "Report Type" }),
                                    oReportSelect,
                                    new Label({ text: "Email Address" }),
                                    oEmailInput
                                ]
                            }).addStyleClass("sapUiMediumMargin")
                        ],
                        buttons: [
                            new Button({
                                text: "Send",
                                type: "Emphasized",
                                press: async () => {
                                    const email = oEmailInput.getValue();
                                    const reportType = oReportSelect.getSelectedKey();

                                    if (!email) {
                                        MessageBox.error("Please enter an email address");
                                        return;
                                    }

                                    if (!email.includes('@')) {
                                        MessageBox.error("Please enter a valid email address");
                                        return;
                                    }

                                    try {
                                        sap.ui.core.BusyIndicator.show(0);

                                        console.log("Sharing report to:", email, "Type:", reportType);

                                        const result = await new Promise((resolve, reject) => {
                                            oModel.create("/ShareReport", {
                                                email: email,
                                                reportType: reportType
                                            }, {
                                                success: resolve,
                                                error: reject
                                            });
                                        });

                                        sap.ui.core.BusyIndicator.hide();

                                        console.log("Share successful:", result);

                                        MessageBox.success(
                                            `Report has been sent to ${email}`,
                                            {
                                                title: "Success",
                                                onClose: () => {
                                                    oDialog.close();
                                                    oDialog.destroy();
                                                }
                                            }
                                        );
                                    } catch (error) {
                                        console.error("Share error:", error);
                                        sap.ui.core.BusyIndicator.hide();
                                        MessageBox.error(
                                            'Failed to send: ' + (error.message || 'Unknown error')
                                        );
                                    }
                                }
                            }),
                            new Button({
                                text: "Cancel",
                                press: () => {
                                    oDialog.close();
                                    oDialog.destroy();
                                }
                            })
                        ]
                    });

                    oDialog.open();
                } catch (error) {
                    console.error("Dialog error:", error);
                    MessageBox.error("Failed to open share dialog: " + error.message);
                }
            }
        }
    );
});
