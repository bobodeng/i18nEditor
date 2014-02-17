
 var log = function(obj){
    console.log(obj);
 }

 // 载入样式
var link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = "http://www.baihuzi.com/baihuzi/i18n.css?t=7";
document.getElementsByTagName("head")[0].appendChild(link);

 seajs.config({
    alias: {
        '$': 'gallery/jquery/1.7.2/jquery',
        'popup': 'arale/popup/1.1.6/popup',
        'sticky' : 'arale/sticky/1.3.1/sticky',
        'tabs' : 'arale/switchable/1.0.2/tabs',
        'uri' : 'gallery/jsuri/1.2.2/jsuri'
    }
    // base:"https://a.alipayobjects.com/"
  });

seajs.use(['$','popup','sticky','tabs','uri'], function($,Popup,Sticky,Tabs,Uri) {
    log("hello i18nEdit~");
    // 数据源操作
    var i18nEditor = {
        version : "1.0.0",
        author : "#bbd {玉郎}",

        // 根据用户选择，判断是否打开编辑模式
        init : function(){
            // ##转译替换特殊字符 jsuri目前有bug 当url里出现@符号，会导致获取不到get参数，这是临时方案
            var stripString = function(s) {
            var reg = new RegExp("[@]");
            var rs = "";
            for (var i = 0; i < s.length; i++) {
                 rs = rs + s.substr(i, 1).replace(reg,'{{email}}');
              }
            return rs;
            }
            var resolveString = function(s) {
                var _s = unescape(s)+"";
                var regS = new RegExp("{{email}}","gi");
                _s = _s.replace(regS,"@")
                return _s;
            }

            var uri = new Uri(stripString(window.location.href));
            var _needResolve = true;

            if(data.loadEditMode() == "false"){
                 if(uri.getQueryParamValue('edit')){
                    uri.deleteQueryParam('edit');
                    window.location.href = resolveString(uri.toString());
                }
                _needResolve = false;
            }else{
                if(uri.getQueryParamValue('edit')){
                    // uri.deleteQueryParam('edit');
                }else{
                    uri.addQueryParam('edit','i18n');
                    window.location.href = resolveString(uri.toString());
                }
            }

            return _needResolve;
            
        }
    }

    //主体模块开始
    var data = {
        // 原始数据，有后端支持后初始化这里
        obj : {
            key2:"text2",
            key3:"text3"

        },
        lang : "zh_CN",
        history : {
            "zh_CN":{},
            "en_US":{}
        },
        // 新增操作记录 1.history add 2.obj edit
        setHistoryTask : function(key,value){
            var _slef = this;
            var lang = _slef.getLang();
            _slef["history"][lang][key] = value;
            _slef.setValue(key,value);
        },
        saveEditMode : function(value){
            var _slef = this;
            var _storage =  window.localStorage;
            _storage["eidtMode"] = value;
        },
        loadEditMode : function(){
            var _slef = this;
            var _storage =  window.localStorage;
            return _storage["eidtMode"];
        },
        getHistory : function(lang){
            var _slef = this;
            if(lang){
                return _slef["history"][lang];
            }else{
                return _slef["history"];
            }
        },
        setHistory : function(data){
            var _slef = this;
            _slef["history"] = data;
        },
        getCurrentHistory : function(){
            var _slef = this;
            var _lang = _slef.getLang();
            return _slef["history"][_lang];
        },
        saveI18nLocal : function(){
            var _slef = this;
            var _storage =  window.localStorage;
            _storage["ihome"] = JSON.stringify(_slef.getHistory());
            // JSON.stringify 把一个对象转换成json字符串， 
            // JSON.parse 把一个json字符串解析成对象。
        },
        delLocal : function(){
            var _slef = this;
            var _storage =  window.localStorage;
            _storage.clear();
        },
        // 读取本地缓存，并修改当前数据源
        loadI18nLocal : function(){
            var _slef = this;
            var _storage = window.localStorage;
            var _history = _storage["ihome"];
            // 存储到当前操作记录中
            if(_history && _history != ""){
                var _historyObj = JSON.parse(_history);
                _slef.setHistory(_historyObj);

                $.each(_slef.getCurrentHistory(),function(n,v){
                    // 给当前的数据源赋值
                    _slef.setValue(n,v);
                })               
            }
        },

        getValue : function(key){
            var _slef = this;
            return _slef["obj"][key];
        },
        setValue : function(key,value){
            var _slef = this;
            _slef["obj"][key] = value;
            return ;
        },
        getLang : function(){
            var _slef = this;
            return _slef["lang"];
        },
        setLang : function(lang){
            var _slef = this;
            _slef["lang"] = lang;
        },
        init : function(){
            var _slef = this;
            // 获取当前语言，并存储 TODO 目前从dom内获取，未来要修改成读参数
            var _lang =$("#trigger-language").text();
            if(_lang.indexOf("中文(简体)")!= -1){
                _lang = "zh_CN";
            }else if(_lang.indexOf("English")!= -1){
                _lang = "en_US";
            }else if(_lang.indexOf("Pусский")!= -1){
                _lang = "u_RU";
            }else if(_lang.indexOf("Português")!= -1){
                _lang = "pt_PT";
            }else if(_lang.indexOf("España")!= -1){
                _lang = "p_SP";
            }else{
                _lang = "en_US";
            }
           
            data.setLang(_lang);
            log("当前语言是"+_lang);   

            // 读取本地缓存，并修改当前数据源
            _slef.loadI18nLocal();

            // TODO : 待接入后端文件支持
        }

    };




    // i18nEdit 页面解析
    var resolve = {

        // 根据正则转译当前页面的key，返回需要的代码片段 插入body
        execRE : function (re, rp, content) {
            // TODO 这坨逻辑改的很渣，需要优化
           
            // 替换{{{{value____key}}}} --><span key>value</span>
            var _slef = this;
            var _history = data.getCurrentHistory() || {};
            var oReg = new RegExp(re, "ig");
            
            // 收集页面中储存在JS或者Dom中的key value
            var _hideArr = [];

            // 传入value____key,返回dom结构, TODO 不得已加入了对比修改记录逻辑，容后修改
            var wordsToHtml = function(point){
                var _point = point;
                var _arr = _point.split("____");
                var _value = _arr[0];
                var _key = _arr[1];

                // 对比当前是否有修改记录，如果有，就以修改后的值为准，如果没有，存储页面中取到的值
                if(_history[_key] && _history[_key] != _value){
                    _value = _history[_key];
                }else{
                    data.setValue(_key,_value);
                }
                var _point ="<span data-key='"+_key+"' class='j-i18n'>"+data.getValue(_key)+"</span>";

                return _point;
            }
            
            // 防止误改，先过滤掉标签中的key|value ，替换掉""中的{}，并暂存，
            content = content.replace(/[\"|\']\s*\{{3}.*?\}{3}\s*/g,function(words){
                _resultWords = words.replace(/[\{|\}]/g,"");
                _hideArr.push(words);
                return _resultWords;
            })


            _result = content.replace(oReg, function(words){
                // 截取key value ,存储data
                var _point = wordsToHtml(words.slice(4,words.length-4))
                // 拼回多截取的部分
                var _result = words[0]+_point+ words[words.length-1];
                return _result;
            });

            // 在页面底部增加一个缓存当前不可见文案的区域
            var _html = '<div class="temp-box fn-clear"><ul><p>本页面中的隐藏文案：</p>';
            // 此时的_hideArr中存储的是首字母带"的value____key
            $.each(_hideArr,function(n,v){
                // 截取key value ,存储data
                log(v)
                // 替换掉多余的{ }
                v = v.replace(/[\"|\'|\{|\}]/g,"");
                var _point = wordsToHtml(v)
                _html = _html+'<li>'+_point+'</li>';
            })
            _result = _result + _html +'</ul></div>';

            return _result; 
        },
        // 编辑主体函数
        i18nEditBox : function(){
             var jPop = new Popup({
                trigger: '.j-i18n',
                template: '<div class="us-tip us-tip-7"><p style="color:red"></p><textarea rows=4 cols=40 class="j-eidt" value=""></textarea></div>',
                beforeShow: function() {
                    // this.element.html(this.activeTrigger.data('key'));
                    // 获取当前新内容
                    var _textarea  = $("textarea",this.element)
                    $("p",this.element).text(this.activeTrigger.data('key')+" = ");
                    _textarea.val(this.activeTrigger.html());
                    _textarea.bind('keyup', function(event) {
                        // 快捷键：回车出发关闭浮层事件
                        if (event.keyCode == 13) {
                            jPop.hide();
                        }
                            
                    })
                },
                // afterHide目前有bug，会show hide时各回调一次 
                afterHide : function(){
                    if($("textarea",this.element).val().trim() =="" || $("textarea",this.element).val().trim() == this.activeTrigger.html().trim()){
                        return ;
                    }else{
                        // 改变文案并且记录history，修改data
                        this.activeTrigger.html($("textarea",this.element).val());
                        data.setHistoryTask(this.activeTrigger.data('key'),$("textarea",this.element).val());
                        // 重新渲染board
                        blackBoard.refreshBoard();
                    }
                },
                // effect:'fade',
                triggerType: 'click',
                align: {
                    baseXY: ["70%", 0],
                    selfXY: [10, "100%+10"]
                }
            });

        },
        // 获取当前鼠标选中内容
        _getSelectText : function (){
            var txt = null;
            if (window.getSelection){  // mozilla FF
                txt = window.getSelection();
               }
            else if (document.getSelection){
                txt = document.getSelection();
                }
            else if (document.selection){  //IE
                txt = document.selection.createRange().text;
                }
            return txt;
            },
        init : function(){
            var _slef = this;
            var _html = $("body").html();
            // 根据正则转译当前页面的key to value
            _html
            $("body").html( _slef.execRE("[^\"|^\']\s*\{{3}.*?\}{3}[^\"|^\']","*",_html))
            // popup事件，绑定修改事件
            _slef.i18nEditBox();
        }
    }




    // 修改记录板
    var blackBoard = {
        init : function(){
            var _slef = this;

            // 渲染语言tab
            _slef._initTab();
            
            // i18nBoard 开关事件
            $("#i18nBoard .j-board-trigger").click(function(e){
                _slef.triggerBoard();
            })

            $(window).bind('keyup', function(event) {
                // if (event.keyCode == 27 && event.ctrlKey) {
                // 快捷键：ESC
                if (event.keyCode == 27) {
                    _slef.triggerBoard();
                }
                    
            })
            // 删除修改记录
            $("#i18nBoard .j-del-local").click(function(e){
                if(confirm("将删除目前记录的所有操作，并刷新页面，请确认。")){
                    data.delLocal();
                    window.location.reload();
                }
            })
            
            // 储存editmode 到 local ,重新渲染页面
            $("#eidtModeTrigger").click(function(e){
                data.saveEditMode($(this)[0].checked+"");
                window.location.reload();

            })
            // TODO :调研一下，是否需要储存是否禁止点击事件
            $("#preventDefaultTrigger").click(function(e){

            })
            // 根据禁用链接状态，判断是否禁掉多语言的链接
            $(".j-i18n").click(function(e){
                if($("#preventDefaultTrigger")[0].checked){
                    e.preventDefault();
                    return false;
                }
            })

            // 历史操作记录初始化
            _slef.refreshBoard("init");

        },
        _initTab : function(){
            var _slef =this;
            var _str = '<div id="i18nBoard" class="">'+
                '<div class="edit-info">'+
                '    <span>version :<span class="board-key">'+i18nEditor["version"]+'</span> 有问题联系:<span class="board-key">'+i18nEditor["author"]+'</span></span>  |  '+
                '    <span>你现在编辑的语言是：<span class="board-key">'+ data.getLang() +'</span></span>  |  '+
                '    <span> 开关操作记录的快捷键：<span class="board-key">ESC</span>   | '+
                '    <span title="关闭后，将不在显示编辑框"><input type="checkbox" id="eidtModeTrigger" name="eidtMode" checked="checked"> 编辑模式</span>'+
                '    <span title="遇到不能点击的链接，请去掉勾选"><input type="checkbox" id="preventDefaultTrigger" name="preventDefault" checked="checked"> 禁止编辑时跳转</span>'+
                '</div>'+
                '<div class="content">'+
                '<ul class="ui-switchable-nav">'+
                '    <li data-lang="zh_CN">中文(简体)</li>'+
                '    <li data-lang="en_US">English</li>'+
                '    <li data-lang="ru_RU">Pусский</li>'+
                '    <li data-lang="pt_PT">Português</li>'+
                '    <li data-lang="sp_SP">España</li>'+
                '</ul>'+
                '<div class="ui-switchable-content">'+
                '    <div id="zh_CN-box" class="fn-hide">内容 B</div>'+
                '    <div id="en_US-box" class="fn-hide">内容 C</div>'+
                '    <div id="ru_RU-box" class="fn-hide">内容 D</div>'+
                '    <div id="pt_PT-box" class="fn-hide">内容 E</div>'+
                '    <div id="sp_SP-box" class="fn-hide">'+
                '        内容 A'+
                '    </div>'+
                '</div>'+
                '</div>'+
                '<ul class="botton-list">'+
                '    <li class="j-del-local" title="删除修改记录">删除</li>'+
                // '    <li class="j-save-local" title="保存本次修改">保存</li>'+
                '    <li class="j-board-trigger" title="快捷键：ESC">展开</li>'+
                '</ul>'+
            '</div>';

            $(_str).appendTo("body");
            // Sticky.fix("#i18nBoard"); 

            var tabs = new Tabs({
                element: '#i18nBoard',
                triggers: '.ui-switchable-nav li',
                panels: '.ui-switchable-content div',
                triggerType : 'click',
                activeIndex: 0,
                effect: 'fade',
                // effect: 'scrollx',
                interval: 3000
            });

            // 读取编辑模式上次的状态
            if(data.loadEditMode() == "false") $("#eidtModeTrigger")[0].checked = false;

        },
        triggerBoard : function(){
            var _slef = this;
            var _board = $("#i18nBoard");
            if(_board.hasClass("show")){
                $("#i18nBoard").animate({height:"30px"}).removeClass("show")
                $(".j-board-trigger").text("展开");
            }else{
                $("#i18nBoard").animate({height:"400px"}).addClass("show")   
                $(".j-board-trigger").text("收起");
            }
        },
        refreshBoard  : function(init){
            var _slef = this;
            var _lang = data.getLang();
            
            if(init){
                // 初始化状态下，渲染所有语言类的操作记录
                var  _langsArr = [];
                $.each($("#i18nBoard .ui-switchable-nav li"),function(n,v){
                    _langsArr.push($(v).data("lang"));
                })
                $.each(_langsArr,function(n,v){
                    // v - zh_CN ……
                    var _str = "";
                    var _lsitObj = data.getHistory(v);
                    if(_lsitObj){
                        $.each(_lsitObj,function(nn,vv){
                            _str = _str + "<p><span class='board-key'>"+nn+"</span>=<span class='board-value'>"+vv+"</span></p>";
                        })

                        $("#i18nBoard #"+v+"-box").html(_str);
                    }
                })

            }else{
                // 非初始化状态，重新渲染当前语言的操作记录
                var _lsitObj = data.getCurrentHistory();
                var _str = "";
                $.each(_lsitObj,function(n,v){
                    _str = _str + "<p><span class='board-key'>"+n+"</span>=<span class='board-value'>"+v+"</span></p>";
                })
                $("#i18nBoard #"+_lang+"-box").html(_str);
                data.saveI18nLocal();
            }


        },
        addTask : function(key){
            var _slef = this;

        },
        delTask : function(){
            var _slef = this;
        }
    }

// init
    // 数据源初始化
    data.init()
    var _needResolve = i18nEditor.init();

    // 编辑主体事件初始化
    if(_needResolve){
        resolve.init();
    }
    // 操作板初始化
    blackBoard.init(); 


});

