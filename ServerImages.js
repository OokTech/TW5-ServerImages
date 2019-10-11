/*\
title: $:/plugins/OokTech/ServerImages/ServerImages.js
type: application/javascript
module-type: startup

This adds a hook for the "th-importing-tiddler"

\*/
(function () {

  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  // Export name and synchronous status
  exports.name = "server-images";
  exports.platforms = ["browser"];
  exports.after = ["render"];
  exports.synchronous = true;

  exports.startup = function() {
    function updateProgress(e) {
      // TODO make this work in different browsers
      /*
      if (e.lengthComputable) {
        var percentComplete = e.loaded/e.total*100;
      } else {
        var percentComplete = -1;
      }
      console.log(percentComplete);
      */
    }
    function transferComplete(e) {
      console.log('Complete!!');
    }
    function transferFailed(e) {
      console.log('Failed!');
    }
    function transferCanceled(e) {
      console.log('Cancelled!')
    }
    // Add the hook to the wiki in the browser
    $tw.hooks.addHook("th-importing-tiddler", function(tiddler) {
      // Figure out if the thing being imported is something that should be
      // saved on the server.
      var mediaTypes = ['image/gif', 'image/x-icon', 'image/jpeg', 'image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf', 'application/zip', 'application/font-woff', 'application/x-font-ttf', 'audio/ogg', 'video/mp4', 'audio/mp3', 'audio/mp4'];
      if (mediaTypes.indexOf(tiddler.fields.type) > -1 && !tiddler.fields._canonical_uri) {
        // Check if this is set up to use HTTP post or websockets to save the
        // image on the server.
        var request = new XMLHttpRequest();
        request.upload.addEventListener('progress', updateProgress);
        request.upload.addEventListener('load', transferComplete);
        request.upload.addEventListener('error', transferFailed);
        request.upload.addEventListener('abort', transferCanceled);

        var wikiPrefix = $tw.wiki.getTiddlerText('$:/WikiName') || '';
        var uploadURL = '/api/upload';
        request.open('POST', uploadURL, true);
        // cookies are sent with the request so the authentication cookie
        // should be there if there is one.
        var thing = {
          tiddler: tiddler,
          wiki: $tw.wiki.getTiddlerText('$:/WikiName')
        }
        request.setRequestHeader('x-wiki-name',wikiPrefix);
        request.send(JSON.stringify(thing));
        // Change the tiddler fields and stuff
        var fields = {};
        var wikiPrefix = $tw.wiki.getTiddlerText('$:/WikiName') || '';
        wikiPrefix = wikiPrefix === 'RootWiki'?'':'/'+wikiPrefix;
        var uri = wikiPrefix+'/files/'+tiddler.fields.title;
        fields.title = tiddler.fields.title;
        fields.type = tiddler.fields.type;
        fields._canonical_uri = uri;
        return new $tw.Tiddler(fields);
      } else {
        return tiddler;
      }
    });
  }

})();
