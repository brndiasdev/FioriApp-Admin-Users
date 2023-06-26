sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/ValueState", "sap/ui/model/json/JSONModel"], function (BaseController, ValueState, JSONModel) {
  "use strict";

  return BaseController.extend("br.com.gestao.fioriappreport303.controller.Validation", {
    onInit: function () {
      sap.ui.getCore().attachValidationError(function (oEvent) {
        oEvent.getParameter("element").setValueState(ValueState.Error);
      });
      sap.ui.getCore().attachValidationSuccess(function (oEvent) {
        // o value state só funciona se o objeto possuir uma constraint dentro do XML
        oEvent.getParameter("element").setValueState(ValueState.Success);
      });

      //Model de Apoio
      var oModel = new JSONModel();
      this.getView().setModel(oModel, "MDL_Produto");
    },

    verModel: function () {
      var oModel = this.getView().getModel("MDL_Produto");
      console.log(oModel.getData()); // Joga no console o JSONMOdel Criado
    },
  });
});
