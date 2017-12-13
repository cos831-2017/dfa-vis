/**
 * @author Débora Pina
 * @email deborabpina@poli.ufrj.br
 */
var projections = {};
var selections = {};
var types = {};
       
var dataset = new Vue({
  el: '#dataset',
  data: {
    QueryType: [],
    CheckedAtts: [],
    Conditions: null,
    types: [],
    projections: {},
    selections: {},
    origin: [],
    destination: [],
    rows: null
  },
  computed: {
    QueryType: {
      get: function() {
        return this.qtypes;
      },
      set: function(newValue) {
        this.qtypes = newValue;
      }
    },      
    CheckedAtts: {
      get: function() {
        return this.checkedNames;
      },
      set: function(newValue) {
        this.checkedNames = newValue;
      }
    },
    Conditions: {
      get: function() {
        return this.conditions;
      },
      set: function(newValue) {
        this.conditions = newValue;
      }
    }
  },
  methods: {
      save: function(){        
        var context = this;
        var selectedDataset = app.$data.selectedElemet.name;
        var edges = app.$data.graph.edges;
        var nodes = app.$data.graph.nodes;
        var foundObject =  app.$data.graph.nodes.filter(function(e) {
                                return e.label == selectedDataset;
                              });
        var id = foundObject[0]['id'];
        
        var id_nodes = [];
        for (var i=0; i<nodes.length; i++){
            id_nodes.push(nodes[i]['id']);
        }
        console.log(id_nodes);
        projections[selectedDataset] = this.$data.Conditions || "";
        selections[selectedDataset] = this.$data.CheckedAtts || "";
        types[selectedDataset] = this.$data.QueryType || "logical";
        
        window.localStorage.setItem("projs", JSON.stringify(projections));
        window.localStorage.setItem("selects", JSON.stringify(selections));
        window.localStorage.setItem("types", JSON.stringify(types));    
        
        context.types = (JSON.stringify(types));
        context.projections = (JSON.stringify(projections));
        context.selections = (JSON.stringify(selections));
        
        var selected = [];
        var origin = [];
        var destination = [];
        
        var selected = $('#ds-selected').val();
        if (selected !== '') selected = JSON.parse(selected);
        else selected = [];
        if (!selected.includes(id)){console.log("vou incluir agora"); selected.push(id);}
        else {console.log("vou incluir nada");}
        console.log(selected);
        $('#ds-selected').val(JSON.stringify(selected));
   
        if (selected.length === 1){
            origin.push(id);
            destination.push(id);
        }
               
        else {
            var origin = $('#ds-origins').val();
            if (origin !== '') origin = JSON.parse(origin);
            else origin = [];

            var destination = $('#ds-destinations').val();
            if (destination !== '') destination = JSON.parse(destination);
            else destination = [];
            
            for (var i=0; i < selected.length; i++){
                if (selected[i] !== id){
                    if (bfs(edges, id_nodes, id, selected[i])){
                        console.log("primeiro if true"); 
                        console.log(id, selected[i]);                        
                        origin.pop(selected[i]);
                        if(!origin.includes(id)) origin.push(id);
                        if(!destination.includes(selected[i])) destination.push(selected[i]);
                    }                        
//                    console.log("segundo if");
                    else if (bfs(edges, id_nodes, selected[i], id)){
                        console.log(selected[i], id);
                        console.log("segundo if");                        
                        origin.pop(id);
                        destination.pop(selected[i]);
                        if(!origin.includes(selected[i])) origin.push(selected[i]);
                        if(!destination.includes(id)) destination.push(id);
                    }
                    
                    else { //acho que nesse caso é o includes
                        console.log("both");
                        if(!origin.includes(id)) origin.push(id);
                        if(!destination.includes(id)) destination.push(id);
                    }       
                }
            }                 
        }        
        console.log(origin);
        console.log(destination);

        $('#ds-origins').val(JSON.stringify(origin));
        $('#ds-destinations').val(JSON.stringify(destination));         
        
        context.source = JSON.stringify(origin);
        context.target = JSON.stringify(destination);
      },
      run: function(){
        var context = this;
        dataflowTag = $('#dataflowtag').text();
        dataflowId = getUrlParameters("dfId", "", true);
        console.log(context.projections)
        console.log(context.selections)
        console.log(context.target)
        console.log(context.source)
        $.ajax({
            url:'/query_interface/' + dataflowTag + '/' + dataflowId,
            data:{message: '(mapping)' + context.types + '(source)' + context.source + '(target)' + context.target + '(projection)' + context.projections + '(selection)' + context.selections}, 
            type:'POST',
            success:function(result){
                if(result){
//                    console.log(result);
                    generateResult("C:/debora/query_result.csv");
                    console.log("worked");
                }
            },
            error:function(){
                console.log('not worked.');
            } 
        });   
      }
  }
});

function generateResult(csv){
    var context = this;
    $.ajax({
        url:'/query_processing/',
        data:{csv: csv}, 
        type:'POST',
        success:function(result){
            if(result){
//                    $('#app').html(result);
                $('#app').html(result);   
                console.log("csv worked");
            }
        },
        error:function(){
            console.log('csv not worked.');
        } 
    });    
}

function getUrlParameters(parameter, staticURL, decode) {
    /*
     Function: getUrlParameters
     Description: Get the value of URL parameters either from
     current URL or static URL
     Author: Tirumal
     URL: www.code-tricks.com
     */
    try {
        var currLocation = (staticURL.length) ? staticURL : window.location.search,
                parArr = currLocation.split("?")[1].split("&"),
                returnBool = true;

        for (var i = 0; i < parArr.length; i++) {
            parr = parArr[i].split("=");
            if (parr[0] == parameter) {
                if (returnBool)
                    returnBool = true;
                return (decode) ? decodeURIComponent(parr[1]) : parr[1];
            } else {
                returnBool = false;
            }
        }

        if (!returnBool)
            return false;
    } catch (err) {
        return null;
    }
}