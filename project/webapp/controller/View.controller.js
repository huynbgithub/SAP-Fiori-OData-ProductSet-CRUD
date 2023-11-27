sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/BindingMode",
    "sap/ui/model/json/JSONModel",
    "sap/m/ColumnListItem",
    "sap/m/Input",
    "sap/ui/core/Icon",
],

    function (Controller,
        MessageToast,
        BindingMode,
        JSONModel,
        ColumnListItem,
        Input,
        Icon,
    ) {
        "use strict";

        return Controller.extend("project.project.controller.View", {
            onInit: function () {
            },

            /**
             * @override
             */
            onBeforeRendering: function () {
                this.getView().byId('idSmartTable').getModel().setDefaultBindingMode(BindingMode.TwoWay);
            },

            onReset: function () {
                var oTable = this.getView().byId("idResponsiveTable");
                var oTableModel = oTable.getModel();
                var aItems = oTable.getItems();

                aItems.forEach(function (item) {
                    item.getCells()[0].setSrc("");
                });

                oTable.removeSelections();
                this.getView().byId("idGenericTag").setStatus("Success")
                this.getView().byId("idGenericTag").setText("Not Update")

                if (this.addItems && this.addItems.length > 0) {
                    this.addItems.forEach(function (item) {
                        oTable.removeItem(item);
                    });
                    this.addItems = [];
                }

                this.deletedIDList = [];

                oTableModel.resetChanges();
            },
            onChange: function (oEvent) {
                this.onGenericChange();

                var numbersInId = oEvent.getParameters().changeEvent.getParameters().id.match(/-([0-9]+)$/);
                var oChangedRowId = numbersInId[numbersInId.length - 1];

                var oTable = this.getView().byId("idResponsiveTable");
                oTable.getItems()[oChangedRowId].getCells()[0].setSrc("sap-icon://edit");
                oTable.getItems()[oChangedRowId].getCells()[0].setColor("blue");
            },
            onGenericChange: function () {
                var oGenericTag = this.getView().byId("idGenericTag");
                oGenericTag.setText("Updated");
                oGenericTag.setStatus("Warning");
            },
            deletedIDList: [],
            onDelete: function () {
                var oTable = this.getView().byId("idResponsiveTable");
                var selectedItems = oTable.getSelectedItems();

                if (selectedItems.length === 0) {
                    MessageToast.show("Please select rows!");
                    return;
                }
                if (selectedItems.length > 0) {
                    this.deletedIDList = selectedItems.map(function (item) {
                        item.getCells()[0].setSrc("sap-icon://delete")
                        item.getCells()[0].setColor("red")
                        let deletedID = item.getBindingContext().getProperty("ProductID")
                        return deletedID;
                    });
                    this.onGenericChange();
                } else {
                    console.warn("No products selected.");
                }
            },
            onSend: function () {
                if (this.addItems && this.addItems.length > 0) {
                    for (let i = 0; i < this.addItems.length; i++) {
                        var aNew = this.addItems[i].getCells();
                        let newRecord = {
                            ProductID: aNew[1]._lastValue,
                            TypeCode: aNew[2]._lastValue,
                            SupplierID: aNew[3]._lastValue,
                            CurrencyCode: aNew[4]._lastValue,
                            Name: aNew[5]._lastValue,
                            Category: aNew[6]._lastValue,
                            Price: aNew[7]._lastValue,
                            TaxTarifCode: Number(aNew[8]._lastValue),
                            MeasureUnit: aNew[9]._lastValue
                        };
                        var oModelAdd = this.getView().byId("idSmartTable").getModel();
                        oModelAdd.setUseBatch(false);
                        oModelAdd.create("/ProductSet", newRecord);
                    }
                }

                var oModel = this.getView().byId("idSmartTable").getModel();
                oModel.setUseBatch(false);
                oModel.submitChanges();

                if (this.deletedIDList && this.deletedIDList.length > 0) {
                this.deletedIDList.forEach(function (productID) {
                    var sPath = "/ProductSet('" + productID + "')";
                    oModel.remove(sPath, {
                        success: function () {
                            console.log("Deleted product with ID: " + productID);
                        },
                        error: function (e) {
                            console.error("Error deleting product with ID: " + productID, e);
                        },
                    });
                }
                );}

                this.onReset();
            },
            addItems: [],
            onAdd: function (oEvent) {
                this.onGenericChange();

                let oNew = new ColumnListItem(
                    {
                        cells: [
                            new Icon({ src: "sap-icon://add-document", color: "green" }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 1 }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 2 }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 3 }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 4 }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 5 }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 6 }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 7 }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 8 }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 9 }),
                        ],
                    }
                );
                var oTable = this.getView().byId("idResponsiveTable")
                oTable.insertItem(oNew, 0);
                this.addItems.push(oNew);
            },

            onLiveChange: function (oEvent) {
                this.addItems[this.addItems.length - 1].getCells()[oEvent.getParameter(position)]._lastValue = oEvent.getParameter(value);
            },

            onEditModeSwitch: function (oEvent) {
                var oSwitch = oEvent.getSource();
                var oEditMode = oSwitch.getState();
                var oSmartTable = this.getView().byId("idSmartTable");
                oSmartTable.setEditable(false);
                var oToolBar = this.getView().byId("idToolBarBox");
                var oToolBar2 = this.getView().byId("idToolBarBox2");
                oToolBar.setVisible(false);
                oToolBar2.setVisible(false);

                if (oEditMode) {
                    oSmartTable.setEditable(true);
                    oToolBar.setVisible(true);
                    oToolBar2.setVisible(true);
                };
            },

        });
    });