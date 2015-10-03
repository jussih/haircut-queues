$(document).ready(function () {
  var mRoomDataURL = "https://mroom.asioi.fi/api/pob-info-with-queue?city=Tampere"

  jsonp(mRoomDataURL, "queueHandler"); 
});


function jsonp(url, callbackName) {                
  if (url.indexOf("?") > -1)
    url += "&callback="; 
  else
    url += "?callback="; 
  url += callbackName + "&";
  url += new Date().getTime().toString(); // prevent caching        
  
  var script = document.createElement("script");        
  script.setAttribute("src", url);
  script.setAttribute("type","text/javascript");                
  document.body.appendChild(script);
}


function queueHandler(queueData) {
  console.log(queueData);
  var source = $("#shop-template").html();
  var template = Handlebars.compile(source);
  var context = {'shops': queueData};
  var html = template(context);
  $('#data').html(html);
}

Handlebars.registerHelper("queueBars", function(options) {
  var out = "";
  var count = 0;
  for (i=0, l=this.queue.names.length; i<l; i++) {
    if (this.queue.names[i].type == "White") {
      count++;
      out += "<div class=\"queue-item white\"></div>";
    }
  }
  for (i=0, l=this.queue.names.length; i<l; i++) {
    if (this.queue.names[i].type == "Silver") {
      count++;
      out += "<div class=\"queue-item silver\"></div>";
    }
  }
  for (i=0, l=this.queue.names.length; i<l; i++) {
    if (this.queue.names[i].type == "Gold") {
      count++;
      out += "<div class=\"queue-item gold\"></div>";
    }
  }
  for (i=0, l=this.queue.names.length; i<l; i++) {
    if (this.queue.names[i].type == "Platinum") {
      count++;
      out += "<div class=\"queue-item platinum\"></div>";
    }
  }
  for (i=0, c=this.queue.names.length-count; i<c; i++) {
    out = "<div class=\"queue-item gray\"></div>" + out;
  }
  return options.fn({bars: new Handlebars.SafeString(out)});
});

Handlebars.registerHelper("countQueue", function(options) {
  var count = 0;
  for (i=0, l=this.queue.names.length; i<l; i++) {
    if (this.queue.names[i].type == options.hash.type) {
      count++;
    }
  }
  return options.fn({"count": count});
});
