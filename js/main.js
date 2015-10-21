$(document).ready(function () {
  app.init();

});

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

Handlebars.registerHelper("countQueue", function(type) {
  if (type == "Cardless") {
    return _.reduce(this.queue.names, function(count, n) {
      if (_.indexOf(["White", "Silver", "Gold", "Platinum"], n.type) == -1) {
       return count + 1;
      }
      return count;
    }, 0);
  }
  return _.reduce(this.queue.names, function(count, n) {
    if (type == n.type) {
      return count + 1;
    }
    return count;
  }, 0);
});

Handlebars.registerHelper("select", function(option, value) {
  if (option == value) {
    return ' selected';
  } else {
    return '';
  }
});

