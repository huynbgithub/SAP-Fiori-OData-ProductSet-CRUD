sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/BindingMode",
    "sap/ui/model/json/JSONModel",
    "sap/m/ColumnListItem",
    "sap/m/Input",
    "sap/ui/core/Icon",
    "sap/m/ComboBox",
    "sap/ui/core/Item",
],

    function (Controller,
        MessageToast,
        BindingMode,
        JSONModel,
        ColumnListItem,
        Input,
        Icon,
        ComboBox,
        Item,
    ) {
        "use strict";

        return Controller.extend("project.project.controller.View", {
            // Initialization function
            onInit: function () {
                //Create editable mode model for combo box when switching UI edit mode
                var comboBoxView = new JSONModel({
                    editable: false
                });
                this.getView().setModel(comboBoxView, "comboBoxView");
            },

            /**
             * @override
             */
            // Before rendering function
            onBeforeRendering: function () {
                //The model and the user interface are synchronized
                this.getView().byId('idSmartTable').getModel().setDefaultBindingMode(BindingMode.TwoWay);
            },

            // Switch event handler for toggling edit mode
            onEditModeSwitch: function (oEvent) {
                var oSwitch = oEvent.getSource();
                var oEditMode = oSwitch.getState();
                var oSmartTable = this.getView().byId("idSmartTable");
                var oToolBar = this.getView().byId("idToolBarBox");
                var oSecondToolBar = this.getView().byId("idSecondToolBarBox");

                if (oEditMode) {
                    // Enable edit mode
                    oSmartTable.setEditable(true);
                    oToolBar.setVisible(true);
                    oSecondToolBar.setVisible(true);
                    this.getView().getModel("comboBoxView").setProperty("/editable", true);
                } else {
                    // Disable edit mode
                    oSmartTable.setEditable(false);
                    oToolBar.setVisible(false);
                    oSecondToolBar.setVisible(false);
                    this.getView().getModel("comboBoxView").setProperty("/editable", false);
                }
            },

            //--addItems[] is an array for temporarily saving added items on user interface (UI)--//
            addItems: [],

            // Event handler for adding a new row on UI
            onAdd: function () {
                //Update status changes to "Updated"
                this.onGenericChange();

                //Generate new rows for input
                let oNew = new ColumnListItem(
                    {
                        cells: [
                            new Icon({ src: "sap-icon://add-document", color: "green" }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 1 }),
                            new Input({ value: "", liveChange: "onLiveChange", position: 2 }),
                            new ComboBox({
                                id: "newComboBox",
                                selectionChange: "onComboBoxChange",
                                items: {
                                    path: "/BusinessPartnerSet",
                                    enabled: "{comboBox>/editable}",
                                    template: new Item({ key: "{BusinessPartnerID}", text: "{CompanyName}" })
                                }
                            }),
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
                //Add this row into addItems[] array for sending to OData later
                this.addItems.push(oNew);
            },

            // Live change event handler for input fields
            onLiveChange: function (oEvent) {
                this.addItems[this.addItems.length - 1].getCells()[oEvent.getParameter(position)]._lastValue = oEvent.getParameter(value);
            },

            // ComboBox change event handler for add and edit on UI
            onComboBoxChange: function (oEvent) {
                //Update status changes to "Updated"
                this.onGenericChange();

                //Get the row hash id of the combobox value changed event
                var numbersInId = oEvent.getParameter('id').match(/-([0-9]+)$/);
                //Get the exact id from the above hash
                var oChangedRowId = Number(numbersInId[numbersInId.length - 1]);

                //Increase the row id if users add new Rows on UI table
                if (this.addItems && this.addItems.length > 0) {
                    oChangedRowId += this.addItems.length;
                }

                //Showing edit icon status when select new Supplier Name in ComboBox
                var oTable = this.getView().byId("idResponsiveTable");
                oTable.getItems()[oChangedRowId].getCells()[0].setSrc("sap-icon://edit");
                oTable.getItems()[oChangedRowId].getCells()[0].setColor("blue");


                //Console log the supplier id for testing when combo box changed
                var supplierIdAfterChanged = oEvent.getParameter("selectedItem").getProperty("key");
                console.log(supplierIdAfterChanged);
            },

            //--deletedIDList[] is an array for temporarily saving ids of deleted items on user interface (UI)--//
            deletedIDList: [],

            // Event handler for selecting rows for deletion and showing deletion icon on UI
            onDelete: function () {
                var oTable = this.getView().byId("idResponsiveTable");

                //Get products selected by users on UI
                var selectedItems = oTable.getSelectedItems();

                //Revert if no rows are selected
                if (selectedItems.length === 0) {
                    MessageToast.show("Please select rows!");
                    return;
                }


                if (selectedItems.length > 0) {
                    //Set status Icon of the rows to Delete icon after the Users click "Remove button" 
                    this.deletedIDList = selectedItems.map(function (item) {
                        item.getCells()[0].setSrc("sap-icon://delete")
                        item.getCells()[0].setColor("red")
                        let deletedID = item.getBindingContext().getProperty("ProductID")
                        return deletedID;
                    });
                    //Update Status Tag changes to "Updated"
                    this.onGenericChange();
                } else {
                    console.warn("No products selected.");
                }
            },

            // Event handler for resetting changes on UI
            onReset: function () {
                var oTable = this.getView().byId("idResponsiveTable");
                var oTableModel = oTable.getModel();
                var aItems = oTable.getItems();

                //Remove all icons on Status column
                aItems.forEach(function (item) {
                    item.getCells()[0].setSrc("");
                });

                //Remove Select Icon (Tick Icons) by Users on UI
                oTable.removeSelections();

                //Reset Updated Status Tag
                this.getView().byId("idGenericTag").setStatus("Success")
                this.getView().byId("idGenericTag").setText("Not Update")

                //Empty the temporary add-Items array
                if (this.addItems && this.addItems.length > 0) {
                    this.addItems.forEach(function (item) {
                        oTable.removeItem(item);
                    });
                    this.addItems = [];
                }

                //Empty the temporary deleted-item-ids array
                this.deletedIDList = [];

                //Reset all data changed by users on UI
                oTableModel.resetChanges();
            },

            // Event handler for showing change icon on UI
            onChange: function (oEvent) {
                //Update status changes to "Updated"
                this.onGenericChange();

                //Get the row hash id of the row value changed event
                var numbersInId = oEvent.getParameter("changeEvent").getParameter('id').match(/-([0-9]+)$/);
                //Get the exact id from the above hash
                var oChangedRowId = Number(numbersInId[numbersInId.length - 1]);

                //Increase the row id if Users add new Rows on UI table
                if (this.addItems && this.addItems.length > 0) {
                    oChangedRowId += this.addItems.length;
                }

                //Showing edit icon status when row value changes
                var oTable = this.getView().byId("idResponsiveTable");
                oTable.getItems()[oChangedRowId].getCells()[0].setSrc("sap-icon://edit");
                oTable.getItems()[oChangedRowId].getCells()[0].setColor("blue");
            },

            //Function for changing Generic Tag between "Not Updated" and Updated
            onGenericChange: function () {
                var oGenericTag = this.getView().byId("idGenericTag");
                oGenericTag.setText("Updated");
                oGenericTag.setStatus("Warning");
            },

            //Function: Send the Adding Rows to OData
            onAddSend: function () {
                //Checking whether User adds any Products on UI
                if (this.addItems && this.addItems.length > 0) {
                    for (let i = 0; i < this.addItems.length; i++) {
                        var aNew = this.addItems[i].getCells();
                        //Get the data input by users
                        let newRecord = {
                            ProductID: aNew[1]._lastValue,
                            TypeCode: aNew[2]._lastValue,
                            SupplierID: aNew[3].getSelectedKey(),
                            CurrencyCode: aNew[4]._lastValue,
                            Name: aNew[5]._lastValue,
                            Category: aNew[6]._lastValue,
                            Price: aNew[7]._lastValue,
                            TaxTarifCode: Number(aNew[8]._lastValue),
                            MeasureUnit: aNew[9]._lastValue
                        };
                        var oModel = this.getView().byId("idSmartTable").getModel();
                        oModel.setUseBatch(false);
                        //Push this record to OData
                        oModel.create("/ProductSet", newRecord);
                    }
                }
            },

            //Function: Deleting the Selected Rows to OData
            onDeleteSend: function () {
                var oModel = this.getView().byId("idSmartTable").getModel();
                //Checking whether User selects any Products for deleting on UI
                if (this.deletedIDList && this.deletedIDList.length > 0) {
                    this.deletedIDList.forEach(function (productID) {
                        var sPath = "/ProductSet('" + productID + "')";
                        //Deleting selected products from OData
                        oModel.remove(sPath, {
                            success: function () {
                                console.log("Deleted product with ID: " + productID + " successfully");
                            },
                            error: function (e) {
                                console.error("Error deleting product with ID: " + productID, e);
                            },
                        });
                    }
                    );
                }
            },

            //Event handler for sending Adding, Deleting, Updating to OData
            onSend: function () {
                var oModel = this.getView().byId("idSmartTable").getModel();
                oModel.setUseBatch(false);

                //Function: Send the Updating Rows to OData
                oModel.submitChanges();
                //Function: Send the Adding Rows to OData
                this.onAddSend();
                //Function: Deleting the Selected Rows to OData
                this.onDeleteSend();
                //Function: Reset UI after successfully sending
                this.onReset();
            },
        });
    });