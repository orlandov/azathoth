#!/usr/bin/env node

var sys=require('sys'), http = require('http');
var target = "jsconf";

var num_clients = 10;
jjj = JSON.stringify;
var num_requests = 100;

function main() {
    var times = [];

    for (var i = 0; i < num_clients; i++) {
        var connection = http.createClient(8000, "localhost");
        for (var j = 0; j < num_requests/num_clients; j++) {
            (function () {
                var request = connection.request("GET", "/", {"host": "localhost"});
                sys.puts("loopity");
                var start = (new Date()).getTime();
                request.finish(function(response) {
                    var mstart = start;
                    var end = (new Date()).getTime();

                    sys.puts("start = " + mstart);
                    sys.puts("end = " + end);
                    times.push(end-mstart);
                    response.addListener("complete", function() {
                        if ((times.length % (num_requests/num_clients)) == 0) {
                            //sys.puts("average is "+(times.reduce(function (a, b) { return a+b }, 0)/times.length));
                            sys.puts("average is "+jjj(times));
                        }
                    });
                });
            })();
        }
    }
}

main();
