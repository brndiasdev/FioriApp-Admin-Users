sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend("br.com.gestao.fioriappadmin303.controller.DataBinding", {
      onInit: function () {
        var objModelJson = new sap.ui.model.json.JSONModel();
        objModelJson.loadData("dados/Produtos.json");
        this.getView().setModel(objModelJson, "Model_JSON_Produtos");
      },
      getRegion: function () {
        var objRegionsModelJson = new sap.ui.model.json.JSONModel();
        objRegionsModelJson.loadData("dados/Regions.json");
        this.getView().setModel(objRegionsModelJson, "Model_JSON_Regions");

        var formRegions = this.getView().byId("formRegions");
        formRegions.bindElement("Model_JSON_Regions>/regions/0");
      },
    });
  }
);
