
function replace4SpriteSheet(json){
	var spriteId = "images."+json.meta.image.slice(0,-4);
//	var objectName = "images";
	
	if(jsStr.indexOf("this.initialize(images.")==-1)
	{
		// Easel0.5 or higher
		var objectName = "img";
		var rectName = "cjs.Rectangle";
	}else{
		var objectName = "images";
		var rectName = "Rectangle";
	}
	
	
	var newId = objectName+"."+json.meta.image.slice(0,-4);
	fl.trace("newId:"+newId)
	for each(var ele in json.frames){
		var id = ele.filename;
		var endIndex = id.indexOf('.');
		if(endIndex>-1){
			id = id.slice(0,endIndex);
		}
		
		fl.trace(" id:"+id);
		//id = id.slice(0,id.indexOf("_"));
		var oldStr = "this.initialize("+objectName+"."+id+");";
		var oldStr2 = "this.initialize("+objectName+"."+id+"_1);";
//        var rectName = "Rectangle";
        
		var newStr = "this.sourceRect=new "+rectName+"("
			+ele.frame.x+","
			+ele.frame.y+","		
			+ele.frame.w+","
			+ele.frame.h+");\n"
			+"    this.initialize("+newId+");\n";
		if(jsStr.indexOf(oldStr) > -1){
			jsStr = jsStr.replace(oldStr,newStr);
		}else{
			jsStr = jsStr.replace(oldStr2,newStr);
		}
		
	}
}

function main(){
	fl.runScript(fl.configURI+"Commands/Publish%20for%20CreateJS.jsfl");
	//ダイアログを表示で外部scriptの完了を待てる
	confirm("Replace Sprite Sheet");
	fl.trace("Publish CreateJS with in Sprite Sheet");
	fl.trace(" createjs_file : " + jsURL);
	fl.trace(" spritesheet_json_files : "+ jsonFiles.join("\n\t\t\t\t"));
	jsStr = read(jsURL);
	if(jsStr==""){
		alert("not exist js file:"+jsURL);
	}
	for each(var path in jsonFiles){
		var jsonStr = read( path );
		if(jsonStr == "") {
			alert("not exist json file:" + path);
			continue;
		}
		var json = eval("("+jsonStr+")");
		replace4SpriteSheet(json);
	}
	//fl.trace(jsStr);
	write( jsURL, jsStr);

}

/* file io*/
function read(path){
	//相対パス
	if(path.charAt(0) == '.'){
		path = currentDir+'/'+path;
	}
	
	var res = FLfile.read( FLfile.platformPathToURI(path) );
	if(!res){
		res = FLfile.read(path);
	}
	return res;
}
function write(path,str){
	if(path.charAt(0) == '.'){
		path = currentDir+'/'+path;
	}
	var res = FLfile.write( FLfile.platformPathToURI(path) ,str);
	if(!res){
		res = FLfile.write(path,str);
	}
	return res;
}


function getCustomInputOutput()
{
	try{
		var layer = doc.timelines[0].layers[0];
		
		if(layer.layerType == 'normal'){
			var str = layer.frames[0].actionScript;
		}else{
			var str = layer.frames[1].actionScript;
		}
	}catch(e){
		return;
	}
	
	var startIndex = str.indexOf("ss4createjs");
	if(startIndex == -1) return;
	
	var endIndex = str.indexOf("*/",startIndex);
	str=str.substring(startIndex,endIndex);
	str=str.substring(str.indexOf("\n"),endIndex);
	
	if(str == "") return;
	
	var obj = eval("("+str+")");
	if(obj.js!=null){
		jsURL = obj.js;
	}else if(obj.createjs_file!=null){
		jsURL = obj.createjs_file;
	}
	if(obj.ss != null){
		jsonFiles=obj.ss;
	}else if(obj.spritesheet_json_files != null){
		jsonFiles=obj.spritesheet_json_files;
	}
}


var doc = fl.getDocumentDOM();
var currentDir = FLfile.platformPathToURI(doc.path);
currentDir = currentDir.substr(0,currentDir.lastIndexOf('/'));
var createjsDir;

/*
 *　jsファイルのパスをToolKitから取得
 *
 *　任意のパスを指定する場合はrootの1frame目に次の以下の形式で指定する
*/
//↓↓↓↓↓↓

 /* ss4createjs 
{
    js:'hoge.js',
	ss:['./ss.json']//スプライトシートパス
}
*/

//↑↑↑↑↑↑

var cjsData = doc.getDataFromDocument("CreateJSToolkit_data");
if(cjsData!=0){
	createjsDir = cjsData.substr(cjsData.indexOf("outputPath")+11);
	var index = createjsDir.indexOf('\n');
	if(index>-1){
		createjsDir = createjsDir.substr(0,index);
	}
	fl.trace(createjsDir)
}
var targetName = doc.name.replace(".fla","");
var jsName = doc.name.replace(".fla",".js");
var jsURL = createjsDir+jsName;
var jsStr;
	
/* 
 *スプライトシート定義ファイル
 * デフォルトでは hoge.flaファイルから相対パスで./ss.jsonを指定
 *必要に応じて配列にパスを追加
 */
var jsonFiles = [
	createjsDir +"ss.json"
];



getCustomInputOutput();
main();
