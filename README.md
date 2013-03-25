jQuery plugin for PostMessages
==============

postmessage using JSON for data message

$.postmsg.bind('eventName', function(data,event){ });

$.postmsg.send({target:'iframeId', type: 'eventName', data:{key:value}});
