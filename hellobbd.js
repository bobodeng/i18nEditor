
 var log = function(obj){
    console.log(obj);
 }

var link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = "http://www.baihuzi.com/baihuzi/i18n.css";
document.getElementsByTagName("head")[0].appendChild(link);

 seajs.config({
    alias: {
        '$': 'gallery/jquery/1.7.2/jquery',
        'popup': 'arale/popup/1.1.6/popup',
        'overlay' : 'arale/overlay/1.1.4/overlay',
        'sticky' : 'arale/sticky/1.3.1/sticky',
        'tabs' : 'arale/switchable/1.0.2/tabs'

    // 'position': 'http://assets.dev.alipay.net/arale/position/1.0.0/position'

    }
    // base:"https://a.alipayobjects.com/"
  });

seajs.use(['$','popup','overlay','sticky','tabs'], function($,Popup,Overlay,Sticky,Tabs) {
    log("hello i18nEdit~");
    // 数据源操作
// SecurityForm.answer[not.blank]=Please enter your answer.
// SecureQuestionForm.email[not.blank]=Please enter your email.
// SecureQuestionForm.email[not.null]=Please enter your email.
// SecureQuestionForm.email[regexp]=Email not recognized, please enter again.
// SecureQuestionForm.email[length]=Email not recognized, please enter again.
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
        getCurrentHistory : function(){
            var _slef = this;
            var _lang = _slef.getLang();
            return _slef["history"][_lang];
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
            // TODO : 待接入后端文件支持
        }

    };

    // i18nEdit 页面解析
    var resolve = {

        execRE : function (re, rp, content) {
            var _slef = this;
            oReg = new RegExp(re, "ig");
            r = content.replace(oReg, function(words){
                // 截取key value ,存储data
                var _point = words.slice(4,words.length-4);
                var _arr = _point.split("====");
                var _key = _arr[0];
                var _value = _arr[1];

                data.setValue(_key,_value);
                var _result = words[0]+"<span data-key='"+_key+"' class='j-i18n'>"+data.getValue(_key)+"</span>"+ words[words.length-1];
                return _result;
            });
            return r; 
        },
        i18nEditBox : function(){
             var jPop = new Popup({
                trigger: '.j-i18n',
                template: '<div class="us-tip us-tip-7"><p style="color:red"></p><textarea rows=4 cols=40 class="j-eidt" value=""></textarea></div>',
                beforeShow: function() {
                    // this.element.html(this.activeTrigger.data('key'));
                    // 获取当前新内容
                    $("p",this.element).text(this.activeTrigger.data('key')+" = ");
                    $("textarea",this.element).val(this.activeTrigger.html());
                },
                // afterHide目前有bug，会show hide时各回调一次 
                afterHide : function(){
                    if($("textarea",this.element).val() =="" || $("textarea",this.element).val() == this.activeTrigger.html()){
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
            $(".j-i18n").click(function(e){
                e.preventDefault();
            })
        },
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
            // key to value
            $("body").html( _slef.execRE("[^\"|^\']\{{3}.*\}{3}[^\"|^\']","*",_html))
            // popup
            _slef.i18nEditBox();
        }
    }

    // 修改记录板
    var blackBoard = {
        init : function(){
            var _slef = this;
            var _str = '<div id="i18nBoard" class="">'+
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
                '<div class="j-board-trigger board-trigger">trigger</div>'
            '</div>';

            // <ul class="ui-switchable-nav">
            //     <li data-lang="zh_CN">中文(简体)</li>
            //     <li data-lang="en_US">English</li>
            //     <li data-lang="ru_RU">Pусский</li>
            //     <li data-lang="pt_PT">Português</li>
            //     <li data-lang="sp_SP">España</li>
            // </ul>
            // <div class="ui-switchable-content">
            //     <div class="fn-hide">
            //         内容 A
            //     </div>
            //     <div class="fn-hide">内容 B</div>
            //     <div class="fn-hide">内容 C</div>
            //     <div class="fn-hide">内容 D</div>
            //     <div class="fn-hide">内容 E</div>
            // </div>
            $(_str).appendTo("body");
            // Sticky.fix("#i18nBoard"); 

            tabs = new Tabs({
                element: '#i18nBoard',
                triggers: '.ui-switchable-nav li',
                panels: '.ui-switchable-content div',
                triggerType : 'click',
                activeIndex: 2,
                effect: 'fade',
                // effect: 'scrollx',
                interval: 3000
            });
            $(".j-board-trigger").click(function(e){
                _slef.triggerBoard();
            })

            $(window).bind('keyup', function(event) {
                log(event.keyCode);
                // if (event.keyCode == 27 && event.ctrlKey) {
                if (event.keyCode == 27) {
                    _slef.triggerBoard();
                }
                    
             })

        },
        triggerBoard : function(){
            var _slef = this;
            var _board = $("#i18nBoard");
            if(_board.hasClass("show")){
                $("#i18nBoard").animate({height:"30px"}).removeClass("show")
            }else{
                $("#i18nBoard").animate({height:"400px"}).addClass("show")   
            }
        },
        saveLocal : function(){
            var _slef = this;

        },
        resolveLocal : function(){
            var _slef = this;
            

        },
        delLocal : function(){
            var _slef = this;


        },
        refreshBoard  : function(){
            var _slef = this;
            var _lang = data.getLang();
            var _lsitObj = data.getCurrentHistory();
            var _board = $("#i18nBoard #"+_lang+"-box");
            var _str = "";
            $.each(_lsitObj,function(n,v){
                _str = _str + "<p>"+n+"="+v+"</p>";
            })
            _board.html(_str);


        },
        addTask : function(key){
            var _slef = this;

        },
        delTask : function(){
            var _slef = this;

        }


    }

    // init
    resolve.init();
    blackBoard.init(); 

});

