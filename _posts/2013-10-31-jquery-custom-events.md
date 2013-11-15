---
layout: post
category : javascript
tags : [javascript, jquery, event]
title: jquery custom events
---
{% include JB/setup %}

* Custom events let you structure your code such that behaviors are bound to the thing that’s being acted on, rather than the thing that triggers the action


        // Bind the custom "destroy" event.
        $('#widget_a').bind( 'destroy', function(event){
          // Remove widget A from the DOM.
          $(this).remove();
        });


        // admin_control.js
        $('#admin_control').each(function(){
          $(this).find('a.widget_a_remove').click(function(event){
            // Just trigger the custom event.
            $('#widget_a').trigger( 'destroy' );
          });
        });

* trigger 事件时可以传递参数

        $( "#foo" ).on( "custom", function( event, param1, param2 ) {
          alert( param1 + "\n" + param2 );
        });
        $( "#foo").trigger( "custom", [ "Custom", "Event" ] );

* 自定义事件可以使用 `bind, live, or delegate` 等绑定

* 也支持namespace

* 参考资料 <http://benalman.com/news/2010/02/jquery-custom-events/>
