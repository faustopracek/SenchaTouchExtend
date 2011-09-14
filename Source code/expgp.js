// Namespace
Ext.ns("Ext.gp");
// Search Field
Ext.gp.SearchField = Ext.extend(Ext.form.Text, {
    initComponent: function() {
        this.addEvents('searchBtnPressed','listItemSelected','closeBtnPressed','popupClosed','popupOpened','valueChanged','reset');
        Ext.apply(this, { 
            ui: 'select',
        });
        this.searchPanel=null;
        this.msgBox=null;
        Ext.gp.SearchField.superclass.initComponent.apply(this, arguments);
    },
    startSearch:function(){
        if(this.searchPanel!=null){
            this.searchPanel.startSearch(this.getfilterText());
        }
    },
    getActiveFilterField:function(){
        if(this.searchPanel==null){
            return null;
        }else{
            return this.searchPanel.getActiveFilterField();
        }
    },
    listScrollTo:function(posX,posY){
        if(this.searchPanel!=null){
            return this.searchPanel.listScrollTo(posX,posY);
        }
    },
    showMsg:function(msg){
        if(this.searchPanel!=undefined&&this.searchPanel!=null){
            this.searchPanel.disable();
            this.msgBox=new Ext.MessageBox().show({
                msg   : msg,
                buttons: Ext.MessageBox.OK,
                scope : this,
                icon  : Ext.MessageBox.INFO   
            });

            var zIndex = parseInt(this.searchPanel.el.getStyle('z-index')) + 1;
            this.msgBox.el.setStyle('z-index', '' + zIndex + ' !important');
            
        }
    },
    onTapHold:function(){
        /*optionsPanel=new Ext.Panel({
            scope:this,
            id:'gpSearchFieldOptionsPanel',
            items: [
                        new Ext.List({
                            id:'gpSearchFieldOptionsList',
                            store: new Ext.data.Store({
                                model: Ext.regModel('', {
                                    fields: [
                                        {name:'id', type:'int'},
                                        {name:'title', type:'string'}
                                    ]
                                }),
                                data: [
                                    {id: 1, title: 'Search'},
                                    {id: 2, title: 'Clear field'},
                                ]
                            }),
                            itemTpl: '{title}',
                            allowDeselect: true,
                            singleSelect: true,
                            scope:this,
                             listeners:{
                                     scope:this,       
                                     itemtap: function(record, index){ 
                                         //setTimeout(function(){Ext.getCmp('gpSearchFieldOptionsList').deselect(index);},500);
                                                Ext.getCmp('gpSearchFieldOptionsPanel').destroy();
                                                
                                                switch(index) {
                                                    case 0:
                                                        this.holdTapEvent=false;
                                                        this.onTap();
                                                        break;
                                                    case 1:
                                                        this.setValue('');
                                                        break;
                                                }
                                            }
                             }
                        })
                    ],
            floating: true,
            layout: 'fit',
            width: 200,
            height: 100,
            dock: 'left'
        });
        if(this.searchPanel!=null){
            this.searchPanel.distroy();
        };
        optionsPanel.show();*/
        this.holdTapEvent=true;
        this.setValue('');
        this.fireEvent('reset');
    },
    getFieldsSelectorBtnDescr:function(){ 
        if(this.searchPanel==null){
            return null;
        }else{
            return this.searchPanel.fieldsSelectorBtnDescription();
        }
    },
    getActiveFilterFieldDescription:function(){
        if(this.searchPanel==null){
            return null;
        }else{
            return this.searchPanel.getActiveFilterFieldDescription();
        }
    },
    afterRender: function() {
        Ext.gp.SearchField.superclass.afterRender.call(this);
        this.mon(this.fieldEl, {
        tap: this.onTap,
        taphold: this.onTapHold,
        scope: this
        });
        
    },
    onTap:function(){
        if(this.holdTapEvent==true){
            this.holdTapEvent=false;
            return;
        }
        this.store.clearFilter();
        this.searchPanel=new Ext.gp.SearchPanel({
            scope:this,
            store: this.store,
            listItemTpl: this.listItemTpl,
            listGrouped: this.listGrouped,
            listIndexBar: this.listIndexBar,
            listFilterFields:this.listFilterFields,
            filterText:this.filterText,
            closeBtnText:this.closeBtnText,
            filterTextPlaceHolder:this.filterTextPlaceHolder,
            filterFieldSelectorBtnText:this.filterFieldSelectorBtnText,
            listEmptyOnShow:this.listEmptyOnShow,
            activeFilterField:this.activeFilterField,
            layout:'fit',
            listeners:{
                beforedestroy:function(e){
                    if(this.msgBox!=null){
                        if(this.msgBox.isVisible()==true){
                            this.msgBox.hide();
                            this.searchPanel.enable();
                            e.show();
                            return false;
                        }
                    }
                },
                scope: this,
                hide: function(e){
                    var msg=false;
                    if(this.msgBox!=null){
                        if(this.msgBox.isVisible()==false){
                                this.store.clearFilter();  
                        }
                        else{
                            msg=true;
                        }
                    }
                    e.destroy();
                    if(msg==false){
                        this.searchPanel=null;
                        this.fireEvent('popupClosed');
                    }
                },
                closeBtnPressed:function(){
                    this.store.clearFilter();
                    this.fireEvent('closeBtnPressed');
                },
                searchBtnPressed: function(searchText){
                    this.fireEvent('searchBtnPressed');
                },
                listItemSelected: function(record,e){
                    this.setValue(record.get(this.valueField));
                    this.searchPanel.hide();
                    this.store.clearFilter();
                    this.fireEvent('listItemSelected',record);
               }
            }
        });
        this.searchPanel.show();
        this.searchPanel.doLayout();
        this.searchPanel.doComponentLayout();
        this.popupResize();
        this.fireEvent('popupOpened');
    },
    isPopupVisible:function (){
        if(this.searchPanel!=undefined){
            return this.searchPanel.isVisible();
        }
        else{
            return false;
        }
    },
    popupResize:function(width,height){
        if(this.isPopupVisible()==false){
            return;
        }
        if(width==undefined){
            this.searchPanel.setHeight(window.innerHeight-80);
        }
        else{
            this.searchPanel.setHeight(width);
        }
        if(height==undefined){
            this.searchPanel.setWidth(window.innerWidth-120);
        }
        else{
            this.searchPanel.setHeight(height);
        }
        
    },
    getValue : function(){
        Ext.gp.SearchField.superclass.getValue.call(this, this.displayValue);
        return this.currentValue;
    },
    setValue:function(v){
        this.currentValue=v;
        var r = this.store.findRecord(this.valueField,this.currentValue);
        if(r==null){
            this.displayValue=this.currentValue;
        }
        else{
            this.displayValue=r.get(this.displayField);
        }
        this.value=this.displayValue;
        Ext.gp.SearchField.superclass.setValue.call(this, this.displayValue);

        this.fireEvent('valueChanged');
    },
    setfilterText:function(value){ 
        if(this.searchPanel==null){
            this.filterText=value;
        }
        else{
            this.searchPanel.setfilterText(value);
        }
    },
    getfilterText:function(){
        if(this.searchPanel==null){
            return '';
        }
        else{
            return this.searchPanel.getfilterText();
        }
    },
    setCloseBtnText: function(value){ 
        if(this.searchPanel==null){
            this.closeBtnText=value;
        }
        else{
            this.searchPanel.setCloseBtnText(value);
        }
    },
    getCloseBtnText: function(){    
        if(this.searchPanel==null){
            return 'Close';
        }
        else{
            return this.searchPanel.getCloseBtnText();
        }
    },
    setFilterTextPlaceHolder: function(value){ 
        if(this.searchPanel==null){
            this.filterTextPlaceHolder=value;
        }
        else{
            this.searchPanel.setFilterTextPlaceHolder(value);
        }
    },
    getFilterTextPlaceHolder: function(){ 
        if(this.searchPanel==null){
            return 'Search text';
        }
        else{
            return this.searchPanel.getFilterTextPlaceHolder();
        }
    },
    setActiveFilterField:function(value){
        if(this.searchPanel==null){
            this.activeFilterField=value;
        }
        else{
            this.searchPanel.setActiveFilterField(value);
        }
    }
});
// Search ToolBars
Ext.gp.SearchToolBar = Ext.extend(Ext.Toolbar,{
    initComponent: function() {
    this.items=[
            new Ext.Button({
            id:'gpSearchToolBarCloseBtn',
            ui : "round",
            text: "Close",
            scope: this,
            listeners:{
                scope:this,
                tap:function(){this.fireEvent('closeBtnPressed');}
            }
        }),
        {xtype: 'spacer'},
        new Ext.form.Text({
            id:'gpSearchToolBarFilterText',
            scope: this,
            placeHolder: "Search text" 
        }),
        new Ext.Button({
            ui:'action',
            iconCls: 'search',
            scope: this,
            iconMask: true,
            listeners:{
                scope:this,
                tap:function(){this.fireEvent('searchBtnPressed',this.getfilterText())}
            }
        })
        ];
        this.addEvents('closeBtnPressed','searchBtnPressed');
        if(this.closeBtnText!=undefined){
            this.setCloseBtnText(this.closeBtnText);
        }
        if(this.filterTextPlaceHolder!=undefined){
            this.setFilterTextPlaceHolder(this.filterTextPlaceHolder);
        }
        
        Ext.gp.SearchToolBar.superclass.initComponent.apply(this, arguments);
    },
    setfilterText:function(value){
        Ext.getCmp('gpSearchToolBarFilterText').setValue(value);
    },
    getfilterText:function(){
        return Ext.getCmp('gpSearchToolBarFilterText').getValue();
    },
    setCloseBtnText: function(value){
        Ext.getCmp('gpSearchToolBarCloseBtn').setText(value);
    },
    getCloseBtnText: function(){
        return Ext.getCmp('gpSearchToolBarCloseBtn').getText();
    },
    setFilterTextPlaceHolder: function(value){
        Ext.getCmp('gpSearchToolBarFilterText').placeHolder=value;
    },
    getFilterTextPlaceHolder: function(){
        return Ext.getCmp('gpSearchToolBarFilterText').placeHolder;
    },                          
    dock: "top",
    scope:this
});
// Search Panel
Ext.gp.SearchPanel=Ext.extend(Ext.Panel,{
    initComponent: function() {
        
        this.addEvents('listItemSelected','closeBtnPressed','searchBtnPressed');
        if(this.filterFieldSelectorBtnText==undefined){
            this.filterFieldSelectorBtnText="Serach into";
        }
        
        this.items=[
            new Ext.List({
                id:'gpSearchPanelList',
                scope:this,
                flex:1,
                allowDeselect: true,
                clearSelectionOnDeactivate: true,
                store: this.store,
                itemTpl: this.listItemTpl,
                singleSelect: true,
                grouped: this.listGrouped,
                indexBar: this.listIndexBar,
                listeners:{
                    scope:this,
                    itemTap:function(dv, i, el, e){this.fireEvent('listItemSelected',dv.store.getAt(i),this);
                                                }
                }
            })
        ];
        if(this.listEmptyOnShow==undefined){
            this.listEmptyOnShow=true;
        }
        if(this.listEmptyOnShow==true){
            this.store.filter(this.activeFilterField,"jkpokoiokljlkjnhlijihjuihnjknki",true,false);
        }
        this.dockedItems = [
        new Ext.Picker({
                scope:this,
                id:'gpSearchPanelPickerFields',
                slots: [
                    {
                    scope:this,
                    name : 'gpSearchPanelPickerFieldsSlot',
                    id : 'gpSearchPanelPickerFieldsSlot',
                    useTitles: true,
                    title: 'Fields',
                    data : this.listFilterFields
                    }    
                ],
                listeners:{
                    scope:this,
                    change:function(p,o){this.setActiveFilterField(p.getValue()['gpSearchPanelPickerFieldsSlot']);}
                }

            }),
            new Ext.gp.SearchToolBar({
                scope:this,
                id:'gpSearchPanelSearchToolBar',
                closeBtnText:this.closeBtnText,
                filterTextPlaceHolder:this.filterTextPlaceHolder,
                listeners:{
                    scope:this,
                    closeBtnPressed:function () {
                                        this.fireEvent('closeBtnPressed');
                                        this.hide();
                                    },
                    searchBtnPressed:function (searchValue) {   
                                        this.startSearch(searchValue);
                                        this.fireEvent('searchBtnPressed',searchValue);
                                    }               
                }
            }),
            new Ext.Toolbar({
                dock: "bottom",
                scope:this,
                id:'gpSearchPanelFieldSelectorToolBar',
                items:[
                    new Ext.Button({
                        id:'gpSearchFieldsSelectorToolBarSelectBtn',
                        ui : "action",
                        text: this.fieldsSelectorBtnDescription,
                        scope: this,
                        listeners:{
                            scope:this,
                            tap:function(){gpSearchPanelList
                                Ext.getCmp("gpSearchPanelPickerFields").show();
                                }
                            }
                    })
                ]
            })
        ];
        if(this.activeFilterField==undefined){
            this.setActiveFilterField(this.listFilterFields[0]['value']);
        }
        else{
            this.setActiveFilterField(this.activeFilterField);
        }
        this.getFieldsSelectorBtnDescr();
        Ext.gp.SearchPanel.superclass.initComponent.apply(this, arguments);
    },
    showMsg:function(msg){
        Ext.MsgBox.alert(msg);          
    },
    
    getFieldsSelectorBtnDescr:function(){ 
        this.fieldsSelectorBtnDescription=this.filterFieldSelectorBtnText+' '+this.getActiveFilterFieldDescription();
        return this.fieldsSelectorBtnDescription;
    },
    setActiveFilterField:function(value){
        this.activeFilterField=value;
        Ext.getCmp('gpSearchPanelPickerFieldsSlot').setValue(value);
        this.getFieldsSelectorBtnDescr();
        Ext.getCmp('gpSearchFieldsSelectorToolBarSelectBtn').setText(this.fieldsSelectorBtnDescription);
    },
    getActiveFilterField:function(){
        return this.activeFilterField;
    },
    getActiveFilterFieldDescription:function(){
        var fieldDescr;
        for(var i =0; i< this.listFilterFields.length; i++){
            if(this.listFilterFields[i]['value']==this.getActiveFilterField()){
                fieldDescr=this.listFilterFields[i]['text'];
                break;
            }
        }
        if(this.listFilterFields.length<2){
            Ext.getCmp('gpSearchPanelFieldSelectorToolBar').setVisible(false);
        }
        else{
            Ext.getCmp('gpSearchPanelFieldSelectorToolBar').setVisible(true);
        }
        return fieldDescr;
    },
    startSearch:function(value){
        this.store.clearFilter();
        Ext.getCmp("gpSearchPanelPickerFields").hide();
        if(this.listFilterFields==undefined||this.listFilterFields==null||this.listFilterFields==''){
            return;
        }
        this.store.filter(this.activeFilterField,value,true,false); //RICERCA OTTIMISTICA!!!!!!!!!!!!!!!!!
        if(this.store.getCount()>0){
            Ext.getCmp('gpSearchPanelList').setVisible(true);
        }
        Ext.getCmp('gpSearchPanelList').scroller.scrollTo({
            x: 0,
            y: 0
        });
    },
    setfilterText:function(value){
        Ext.getCmp('gpSearchPanelSearchToolBar').setfilterText(value);
    },
    getfilterText:function(){
        return Ext.getCmp('gpSearchPanelSearchToolBar').getfilterText();
    },
    setCloseBtnText: function(value){
        Ext.getCmp('gpSearchPanelSearchToolBar').setCloseBtnText(value);
    },
    getCloseBtnText: function(){
        return Ext.getCmp('gpSearchPanelSearchToolBar').getCloseBtnText();
    },
    setFilterTextPlaceHolder: function(value){
        Ext.getCmp('gpSearchPanelSearchToolBar').setFilterTextPlaceHolder(value);
    },
    getFilterTextPlaceHolder: function(){
        return Ext.getCmp('gpSearchPanelSearchToolBar').getFilterTextPlaceHolder();
    },  
    layout:{ type: 'vbox', align: 'stretch' },
    listScrollTo:function(posX,posY){
        Ext.getCmp('gpSearchPanelList').scroller.scrollTo({
            x: posX,
            y: posY
        });
    },
    floating: true,
    centered:true,
    modal:true
});

// Spinner
Ext.gp.Spinner=Ext.extend(Ext.form.Spinner,{
    initComponent: function() {
        Ext.gp.Spinner.superclass.initComponent.apply(this, arguments);
    }
});
Ext.gp.Spinner.override({
    setValue : function(value) {
        value = parseFloat(value);

        var format = this.format;

        if (format) {
            value = value.toFixed(2);//Ext.util.Format.number(value, format);
        }

        if (isNaN(value)) {
            value = this.defaultValue;
        }

        Ext.form.Number.prototype.setValue.call(this, value);
    }
});
// ExtReg
Ext.reg('gpsearchfield', Ext.gp.SearchField);
Ext.reg('gpsearchpanel', Ext.gp.SearchPanel);
Ext.reg('gpsearchtoolbar', Ext.gp.SearchPanel);
Ext.reg('gpspinnerfield', Ext.gp.Spinner);

