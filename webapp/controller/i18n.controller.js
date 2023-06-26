sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageBox"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, MessageBox) {
    "use strict";

    return Controller.extend("br.com.gestao.fioriappadmin303.controller.i18n", {
      onInit: function () {
        // this.changeLanguage();
      },

      sendInfo: function () {
        var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

        var cliente = this.getView().byId("cliente").getValue();
        var endereco = this.getView().byId("endereco").getValue();
        var cidade = this.getView().byId("cidade").getValue();
        var estado = this.getView().byId("estado").getValue();

        var sMensagem = oResourceBundle.getText("msgConfirmacao", [cliente, endereco, cidade, estado]);
        MessageBox.confirm(sMensagem);
      },

      changeLanguage: function () {
        var i18nModel = new sap.ui.model.resource.ResourceModel({
          bundleUrl: "i18n/i18n.properties",
          bundleLocale: "fr",
          bundleName: "br.com.gestao.fioriappadmin303.i18n.i18n_fr",
        });

        this.getView().setModel(i18nModel, "i18n");
      },
    });
  }
);
