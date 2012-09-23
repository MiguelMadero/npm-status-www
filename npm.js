var npm = require('npm')
  , Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server
  , url = require('url')
  , microtime = require('microtime')
  , interval = 60 * 1000
  , running = false


var client = new Db('npm-status', new Server("127.0.0.1", 27017, {}))

client.open(function(err, p_client) {
  client.collection('npm-status', check);
});

/*****************************************************************************/

var check = function (err, collection) {
  var start = microtime.nowDouble()
  , end
  , result

  if (running) {
    return setTimeout(check, interval)
  } 

  running = true

  npm.load({}, function (err) {
    if (err) throw err
    npm.commands.search(['npm-registry-client'], true, function (err, data) {
      if (err) throw err
      end = microtime.nowDouble()

      result = {
        action: 'search',
        time: end,
        timeElapsed: end - start
      }

      collection.insert(result, function(err, docs) {
        // Locate all the entries using find
        collection.find().toArray(function(err, results) {
          console.log(results)
        });
      })

      //console.log(Object.keys(data).length)

      running = false
      setTimeout(check, interval)
    })

    npm.on("log", function (message) {
      console.log(message)
    });

  })
}
