#!/usr/bin/env node

var sys = require('sys'),
   http = require('http');

jjj = JSON.stringify

// Default options
var method = "GET";
var host = "localhost";
var port = 80;
var numClients = 10;
var numRequests = 3000;
var reqPerClient = numClients / numRequests;
var path = "/";

function stats(v) {
    var l = v.length

    var mean = v.reduce(function (a, b) { return a + b }) / l;

    s = 0;

    var s = 0;
    v.forEach(function (val) {
        s += Math.pow(val - mean, 2);
    });
    var variance = s / l;
    var deviation = Math.sqrt(variance);

    return { variance: variance, mean: mean, deviation: deviation };
}

var elapsedStart;
var elapsedTime;
var totalTime = 0;
var bytesTransferred = 0;
var times = [];
var clientId = 0;

function pad(str, width) {
    return (new Array(width-str.length)).join(" ") + str;
}

function printReportItem(name, val) {
    sys.puts(pad(name + ":", 40) + " " + val);
}

function printReport(report) {
    //sys.puts("Server Software:"  Cherokee/0.99.38
    sys.puts("");
    printReportItem("Server Hostname", host);
    printReportItem("Server Port", port)

    printReportItem("HTTP Method", method)
    printReportItem("Document Path", path)
    //printReportItem("Document Length"  2141 bytes

    printReportItem("Concurrency Level", numClients);
    printReportItem("Number of requests", numRequests);
    //printReportItem("Time taken for tests"  0.120 seconds)
    //printReportItem("Complete requests", 1)
    //printReportItem("Failed requests"  0)
    //printReportItem("Write errors"  0)
    //rintReportItem("Total transferred"  2344 bytes)
    //printReportItem("HTML transferred"  2141 bytes)
    printReportItem("Body bytes transferred", bytesTransferred);
    printReportItem("Elapsed time", elapsedTime*1000);
    printReportItem("Time spent waiting on requests", totalTime*1000);
    printReportItem("Requests per second", (1000*report.stats.mean/elapsedTime));
    printReportItem("Mean time per request", report.stats.mean);
    printReportItem("Time per request standard deviation", report.stats.deviation);
    //printReportItem("Time per request", report.mean + "[ms] (mean)");
    //printReportItem("Transfer rate"  19.08 [Kbytes/sec] received)
}


function doClientRequests() {
    var j = 0;
    //sys.puts("Client " +clientId+  " reporting in!");
    var myId = clientId;
        var connection = http.createClient(port, host);
    function doRequest() {
        if (++j > numRequests/numClients) return;

        var start = (new Date()).getTime();
        var request = connection.request(method, "/", { "host": host });
        request.finish(function(response) {
            var end = (new Date()).getTime();
            var	delta = end - start;
            times.push(delta);
            totalTime += delta;
	    //sys.puts("Client " +myId+  " received response in " +delta+ "ms.");
            var len = times.length;

            if ((len % (numRequests/10)) == 0) {
                sys.puts(pad("Completed " +times.length+ " requests", 40) + " ("+ (len/numRequests*100) + "%)");
            }
            if (len == numRequests) {
                elapsedTime = (new Date()) - elapsedStart;
                var s = stats(times);
                var report = {
                    stats: s
                }
                printReport(report);

                return;
            }
            response.addListener("body", function (body) {
                bytesTransferred += body.length;
            });
        });
        setTimeout(arguments.callee, 0);
    }
    setTimeout(doRequest, 0);
}

function main() {
    elapsedStart = new Date();
    for (var i = 0; i < numClients; i++) {
        doClientRequests();
        clientId++;
    }
}

main();
