sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/format/NumberFormat", "br/com/gestao/fioriappusers303/util/Formatter", "sap/ui/core/Fragment", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/ODataModel", "sap/m/MessageToast", "br/com/gestao/fioriappusers303/util/Validator", "sap/ui/core/ValueState", "sap/m/BusyDialog", "sap/m/MessageBox"], function (BaseController, NumberFormat, Formatter, Fragment, JSONModel, ODataModel, MessageToast, Validator, ValueState, BusyDialog, MessageBox) {
  "use strict";

  return BaseController.extend("br.com.gestao.fioriappusers303.controller.Detalhes", {
    objFormatter: Formatter,
    //Criar o Obj Route
    onInit() {
      sap.ui.getCore().attachValidationError(function (oEvent) {
        oEvent.getParameter("element").setValueState(ValueState.Error);
      });
      sap.ui.getCore().attachValidationSuccess(function (oEvent) {
        // o value state só funciona se o objeto possuir uma constraint dentro do XML
        oEvent.getParameter("element").setValueState(ValueState.Success);
      });
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      // Acopla a função no onInit para que toda vez que o Route for chamado a função seja executada
      oRouter.getRoute("Detalhes").attachMatched(this.onBindingProdutoDetalhes, this); // attachMatched = Sempre que o getRoute for chamado ele acopla uma outra função dentro dele

      // -------
      // 1 - Chamar a função para fazer o carregamento dos fragments iniciais
      this._formFragments = {};
      this._showFormFragments("DisplayBasicInfo", "vboxBasicInfo");
      this._showFormFragments("DisplayTechInfo", "vboxTechInfo");

      this._habilitaEdicao(false);
    },
    // 2 - Receber como parametro o nome do Fragment e o nome do ID da VBOX Destino
    _showFormFragments: function (sFragmentName, sVBoxName) {
      var objVBox = this.byId(sVBoxName);
      objVBox.removeAllItems();

      this._getFormAllItems(sFragmentName).then(function (oVBox) {
        objVBox.insertItem(oVBox);
      });
    },

    // 3 - Cria o Objeto Fragment baseado no Nome e Adiciona em um Objeto com uma coleção de Fragments
    _getFormAllItems: function (sFragmentName) {
      var oFormFragment = this._formFragments[sFragmentName];
      var oView = this.getView();
      if (!oFormFragment) {
        oFormFragment = Fragment.load({
          id: oView.getId(),
          name: "br.com.gestao.fioriappusers303.frags." + sFragmentName,
          controller: this,
        });
        this._formFragments[sFragmentName] = oFormFragment;
      }
      return oFormFragment;
    },

    onBindingProdutoDetalhes: function (oEvent) {
      // Capturando o parametro trafegado no Route Detalhes - ProductID
      var oProduto = oEvent.getParameter("arguments").Userid;

      // Crie um Objeto referente a View Detalhes
      var oView = this.getView();

      // Criar um parametro e controle para redirecionamento da view após o Delete
      this._bDelete = false;

      // Criar a URL de chamada da nossa entidade de Produtos - stringURL
      var sURL = "/Produtos('" + oProduto + "')"; // Essa forma de tratar a variável oProduto diz ao código que ela vai ser tratada como uma string dentro do URL

      oView.bindElement({
        path: sURL,
        parameters: { expand: "to_cat" },
        events: {
          change: this.onBindingChange.bind(this),
          dataRequested: function () {
            oView.setBusy(true); // deixa a view ocupada até receber a resposta do serviço
          },
          dataReceived: function (data) {
            // quando receber a resposta, tira o setBusy
            oView.setBusy(false);
          },
        },
      });
    },

    onBindingChange: function (oEvent) {
      var oView = this.getView();
      var oElementBinding = oView.getElementBinding();
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

      if (!oElementBinding.getBoundContext()) {
        // se não existir o registro e não estamos na operação de delete, redireciona para o ObjectNotFound
        if (!this._bDelete) {
          oRouter.getTargets().display("objectNotFound"); // Pega as targets dentro do manifest.json e mostra a view correspondente a target ObjectNotFound
          return;
        }
        // SE não exister um elemento (registro) válido eu farei uma ação que é redirecionar para uma nova VIEW
      } else {
        // Se Não existir, clonamos o registro atual
        this._oProduto = Object.assign({}, oElementBinding.getBoundContext().getObject());
      }
    },
    onNavBack: function () {
      this._habilitaEdicao(false);
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("Lista");
    },
    criarModel: function () {
      // Model Produto
      var oModel = new JSONModel();
      this.getView().setModel(oModel, "MDL_Produto");
    },
    handleEdit: function () {
      // Cria o Model
      this.criarModel();

      // Atribui o Model ao Registro
      var oModelProduto = this.getView().getModel("MDL_Produto");
      oModelProduto.setData(this._oProduto);

      // Recupera os usuários
      this.onGetUsuarios();

      // Habilita a Edição
      this._habilitaEdicao(true);
    },
    handleCancel: function () {
      // Restaura o registro atual
      var oModel = this.getView().getModel();
      oModel.refresh(true);

      this._habilitaEdicao(false); // volta para somente leitura
    },
    handleSave: function () {
      // Salva e Restaura o registro atual
      var oModel = this.getView().getModel();
      oModel.refresh(true);

      this._habilitaEdicao(false); // volta para somente leitura
    },
    _habilitaEdicao: function (bEdit) {
      var oView = this.getView();

      // Botões de Ações
      oView.byId("editButton").setVisible(!bEdit);
      oView.byId("deleteButton").setVisible(bEdit);
      oView.byId("saveButton").setVisible(bEdit);
      oView.byId("cancelButton").setVisible(bEdit);

      // Seções das Páginas - Habilitar ou Desabilitar
      oView.byId("objPage0").setVisible(!bEdit);
      oView.byId("objPage1").setVisible(!bEdit);
      oView.byId("objPage2").setVisible(bEdit);

      if (bEdit) {
        this._showFormFragments("Change", "vboxChangeProduct");
      } else {
        this._showFormFragments("DisplayBasicInfo", "vboxBasicInfo");
        this._showFormFragments("DisplayTechInfo", "vboxTechInfo");
      }
    },
    onGetUsuarios: function () {
      var t = this;
      var strEntity = "/sap/opu/odata/sap/ZSB_USERS_303";

      var oModelSend = new ODataModel(strEntity, true);
      oModelSend.read("/Usuarios", {
        // Le dentro do OData a entidade Usuarios criada através da Z_USERS_303
        success: function (oData, results) {
          if (results.statusCode === 200) {
            var oModelUsers = new JSONModel();
            oModelUsers.setData(oData.results);
            t.getView().setModel(oModelUsers, "MDL_Users");
          }
        },
        error: function (e) {
          var oReturn = JSON.parse(e.response.body);
          MessageToast.show(oReturn.error.message.value, {
            duration: 4000,
          });
        },
      });
    },
    onCategoria: function (oEvent) {
      this._oInput = oEvent.getSource().getId(); // getSource = Origem
      var oView = this.getView();

      if (!this._CategoriaSearchHelp) {
        // se this._CategoriaSearchHelp não existe...
        this._CategoriaSearchHelp = Fragment.load({
          // Importado na função de Origem do Controller - dá load no fragment no ID do oView
          id: oView.getId(),
          name: "br.com.gestao.fioriappusers303.frags.SH_Categorias",
          controller: this,
        }).then(function (oDialog) {
          oView.addDependent(oDialog); // oDialog = conteúdo do Fragment.load({oDialog})
          return oDialog;
        });
      }

      this._CategoriaSearchHelp.then(function (oDialog) {
        oDialog.getBinding("items").filter([]); // Abre o filtro em Branco, limpando a ultima pesquisa.

        // Abre o Fragment
        oDialog.open();
      });
    },
    pressValidation: function () {
      // ↓ Cria o objeto Validator ↓
      var validator = new Validator();
      // ↓ Chama a validação ↓
      if (validator.validate(this.byId("vboxChangeProduct"))) {
        this.handleSave();
      }
    },
    handleSave: function () {
      // 1 - Cria uma referência do objeto Model que está recebendo as informações do fragment
      var oModel = this.getView().getModel("MDL_Produto").getData();
      // var objNovo = oModel.getData();
      var sPath = this.getView().getElementBinding().getPath();

      // 2 - Manipular Propriedades
      oModel.Price = oModel.Price.toString();
      oModel.Weightmeasure = oModel.Weightmeasure.toString();
      oModel.Width = oModel.Width.toString();
      oModel.Depth = oModel.Depth.toString();
      oModel.Height = oModel.Height.toString();
      oModel.Changedat = new Date().toISOString().substring(0, 19);

      delete oModel.to_cat;
      delete oModel._metadata;

      // 3 - Criando referências do Arquivo i18n
      var bundle = this.getView().getModel("i18n").getResourceBundle();
      var t = this; // variável contexto da View

      // 4 - Criar o Objeto Model referência do model Default (Odata)
      var oModelProduto = t.getView().getModel();

      MessageBox.confirm(
        bundle.getText("updateDialogMessage", [oModel.Productid]), // Pergunta do Processo dentro do i18n
        function (action) {
          //função de disparo do insert
          debugger;
          if (MessageBox.Action.OK === action) {
            // Verifica se o usuário confirmou a operação
            t._oBusyDialog = new BusyDialog({
              text: bundle.getText("Sending"),
            });
            t._oBusyDialog.open();
            setTimeout(function () {
              //Realizar a chamada para o SAP
              var oModelSend = new ODataModel(oModelProduto.sServiceUrl, true);
              oModelSend.update(
                sPath,
                oModel,
                null,
                function (d, r) {
                  // Função de Sucesso
                  if (r.statusCode === 204) {
                    // 204 = Atualização

                    t._oBusyDialog.close(); // Fecha o Dialog
                    MessageBox.success(bundle.getText("updateDialogSuccess", [oModel.Productid]));

                    t.handleCancel(); // Volta para somente leitura
                  }
                },
                function (e) {
                  // Função de Erro
                  //Fecha o busyDialog
                  t._oBusyDialog.close();
                  var oReturn = JSON.parse(e.response.body);
                  MessageToast.show(oReturn.error.message.value, {
                    duration: 4000,
                  });
                }
              );
            }, 2000);
          }
        },
        bundle.getText("updateDialogTitle") // Exibe o title da popup
      );
    },
    onValueHelpClose: function (oEvent) {
      var oSelectedItem = oEvent.getParameter("selectedItem");
      var oInput = null;

      if (this.byId(this._oInput)) {
        oInput = this.byId(this._oInput);
      } else {
        oInput = sap.ui.getCore().byId(this._oInput);
      }

      if (!oSelectedItem) {
        oInput.resetProperty("value");
        return;
      }
      oInput.setValue(oSelectedItem.getTitle());
    },
    onValueHelpSearch: function (oEvent) {
      var sValue = oEvent.getParameter("value"); // captura o valor digitado pelo usuário

      /* OPÇÃO 1 - Cria um único Filtro
      var oFilter = new Filter("Description", FilterOperator.Contains, sValue); // Cria um Filter que recebe o sValue e associa na Propriedade "Description"
      oEvent.getSource().getBinding("items").filter([oFilter]); */

      //OPÇÃO 2 - Cria um filtro dinâmico, adicionando várias propriedades
      var objFilter = { filters: [], and: false };
      objFilter.filters.push(new Filter("Description", FilterOperator.Contains, sValue));
      objFilter.filters.push(new Filter("Category", FilterOperator.Contains, sValue));

      var oFilter = new Filter(objFilter);
      oEvent.getSource().getBinding("items").filter(oFilter);
    },
    getSupplier: function (event) {
      this._oInput = event.getSource().getId();
      var oValue = event.getSource().getValue();

      var sElement = "/Fornecedores('" + oValue + "')"; // URL DE CHAMADA DE UM FORNECEDOR

      var oModel = this.getView().getModel(); // Cria o objeto Model Default do Projeto

      var oModelProduto = this.getView().getModel("MDL_Produto"); // Model onde o usuário realiza o preenchimento das informações de Produto

      // Realizar a chamada para a SAP
      var oModelSend = new ODataModel(oModel.sServiceUrl, true);
      oModelSend.read(sElement, {
        success: function (oData, results) {
          if (results.statusCode === 200) {
            oModelProduto.setProperty("/Supplierid", oData.Lifnr);
            oModelProduto.setProperty("/Suppliername", oData.Name1);
          }
        },
        error: function (e) {
          oModelProduto.setProperty("/Supplierid", "");
          oModelProduto.setProperty("/Suppliername", "");

          var oReturn = JSON.parse(e.response.body);
          MessageToast.show(oReturn.error.message.value, {
            duration: 4000,
          });
        },
      });
    },
    handleDelete: function () {
      var objDelete = this.getView().getElementBinding().getBoundContext().getObject(); // Acessa o Registro do Objeto
      // var objNovo = oModel.getData();
      var sPath = this.getView().getElementBinding().getPath(); // Acessa o Path
      // 3 - Criando referências do Arquivo i18n
      var bundle = this.getView().getModel("i18n").getResourceBundle();
      var t = this; // variável contexto da View
      // 4 - Criar o Objeto Model referência do model Default (Odata)
      var oModelProduto = t.getView().getModel();
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

      MessageBox.confirm(
        bundle.getText("deleteDialogMessage", [objDelete.Productid]), // Pergunta do Processo dentro do i18n
        function (action) {
          //função de disparo do insert
          debugger;
          if (MessageBox.Action.OK === action) {
            // Verifica se o usuário confirmou a operação
            t._oBusyDialog = new BusyDialog({
              text: bundle.getText("Sending"),
            });
            t._oBusyDialog.open();

            setTimeout(function () {
              //Realizar a chamada para o SAP
              var oModelSend = new ODataModel(oModelProduto.sServiceUrl, true);
              oModelSend.remove(sPath, {
                success: function (d, r) {
                  // Função de Sucesso
                  if (r.statusCode === 204) {
                    // 204 = Atualização / Delete

                    t._oBusyDialog.close(); // Fecha o Dialog

                    // Setar parametro de Delete
                    t._bDelete = true;

                    // MessageBox.success(bundle.getText("deleteDialogSuccess", [objDelete.Productid]));
                    MessageBox["information"](bundle.getText("deleteDialogSuccess", [objDelete.Productid]), {
                      actions: [MessageBox.Action.OK],
                      onClose: function (action) {
                        if (action === MessageBox.Action.OK) {
                          t.getView().getModel().refresh();
                          oRouter.navTo("Lista");
                        }
                      }.bind(this),
                    });

                    t.handleCancel(); // Volta para somente leitura
                  }
                },
                error: function (e) {
                  // Função de Erro
                  //Fecha o busyDialog
                  t._oBusyDialog.close();
                  var oReturn = JSON.parse(e.response.body);
                  MessageToast.show(oReturn.error.message.value, {
                    duration: 4000,
                  });
                },
              });
            }, 2000);
          }
        },
        bundle.getText("deleteDialogTitle") // Exibe o title da popup
      );
    },
  });
});

/* Function para botão com ação de retornar para outra View
Dentro do XML na propriedade Press do button é possivel colocar ="history.back()" ---- Vou adicionar a função por via de conhecimento

onNavBack: function(){
  var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
  oRouter.navTo("Lista")
} */
