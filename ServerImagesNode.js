/*\
title: $:/plugins/OokTech/ServerImages/ServerImagesNode.js
type: application/javascript
module-type: startup

This adds the path handler to the server.

\*/
(function () {

  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  // Export name and synchronous status
  exports.name = "server-images-node";
  exports.platforms = ["node"];
  //exports.after = ["render"];
  exports.synchronous = true;

  exports.startup = function() {
    if ($tw.httpServer) {
      if (typeof $tw.httpServer.addRoute === 'function') {
        var path = require('path');
        var fs = require('fs');
        var buffer = require('buffer');
        // Add the route to the server
        $tw.httpServer.addRoute({
          method: "POST",
          path: /^\/upload$/,
          handler: function (request,response,state) {
            var body = '';
            request.on('data', function (data) {
              body += data;
              if (body.length > 10e6) {
                request.connection.destroy();
              }
            });
            request.on('end', function () {
              var parsedBody = JSON.parse(body);
              console.log(parsedBody.wiki)
              let filesPath;
              if ($tw.Bob) {
                const basePath = $tw.ServerSide.getBasePath();
                let midPath;
                if(parsedBody.storeIn !== 'wiki') {
                  midPath = path.join($tw.settings.wikisPath, parsedBody.wiki);
                } else {
                  midPath = $tw.settings.filePathRoot;
                }
                filesPath = path.resolve(basePath, midPath, 'files');
                /*
                let filesPath;
                if(data.storeIn !== 'wiki') {
                  filesPath = path.resolve(basePath, midPath, 'files');
                } else {
                  filesPath = path.resolve(basePath, midPath);
                }
                if ($tw.settings.filePathRoot) {
                  if (parsedBody.wiki === 'RootWiki') {
                    basePath = $tw.settings.filePathRoot;
                  } else {
                    basePath = path.join($tw.settings.filePathRoot, parsedBody.wiki);
                  }
                }
                */
              }
              var buf = Buffer.from(parsedBody.tiddler.fields.text,'base64');
              fs.writeFile(path.join(filesPath, parsedBody.tiddler.fields.title), buf, function(error) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("C'est fini!");
                  return true;
                }
              });
            });
            // TODO return some sort of response!
          }
        });
      } else {
        // This part is for the external server part.
        // I am not sure how to put anything here that is useful.
        console.log('Make sure your server is configured to allow media uploads from the ServerImages plugin!')
      }
    } else {
      console.log('The ServerImages plugin only works with Bob at the moment')
    }
  }

})();
