#!/usr/bin/env node
/*
 Copyright (c) 2010 Orlando Vazquez

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/

var sys = require('sys'),
   http = require('http'),
   url = require('url'),
   path = require('path');

require.paths.push(path.join(__dirname, 'optparse-js', 'src'));
var optparse = require('optparse');

jjj = JSON.stringify

// Default options
var hostURL;
var method = 'GET';
var host;
var port = 80;
var numClients = 10;
var numRequests = 30;
var path = '/';
var reqPerClient = numClients / numRequests;

var switches = [
    [ '-n', '--number NUMBER', 'Number of requests to make' ],
    [ '-c', '--concurrency NUMBER', 'Concurrent number of connections' ],
    [ '-m', '--method STRING', 'HTTP method to use' ],
    [ '-h', '--help', 'Show this help' ],
];

// Create a new OptionParser.
var parser = new optparse.OptionParser(switches);
parser.on('help', function() {
    sys.puts('Help');
});

parser.on(2, function (value) {
    hostURL = url.parse(value, false);
    host = hostURL.hostname || host;
    port = Number(hostURL.port) || port;
    path = hostURL.pathname || path;
});

parser.on('concurrency', function(opt, value) {
    numClients = Number(value);
});

parser.on('number', function(opt, value) {
    numRequests = Number(value);
});

parser.on('method', function(opt, value) {
    method = value;
});

parser.parse(process.ARGV);

function stats(v) {
    var l = v.length
    var mean = v.reduce(function (a, b) { return a + b }) / l;
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
    //sys.puts('Server Software:'  Cherokee/0.99.38
    sys.puts('');
    printReportItem('Server Hostname', host);
    printReportItem('Server Port', port)

    printReportItem('HTTP Method', method)
    printReportItem('Document Path', path)
    //printReportItem('Document Length'  2141 bytes

    printReportItem('Concurrency Level', numClients);
    printReportItem('Number of requests', numRequests);
    //printReportItem('Time taken for tests'  0.120 seconds)
    //printReportItem('Complete requests', 1)
    //printReportItem('Failed requests'  0)
    //printReportItem('Write errors'  0)
    //rintReportItem('Total transferred'  2344 bytes)
    //printReportItem('HTML transferred'  2141 bytes)
    printReportItem('Body bytes transferred', bytesTransferred);
    printReportItem('Elapsed time (s)', elapsedTime/1000);
    printReportItem('Time spent waiting on requests (s)', totalTime/1000);
    printReportItem('Requests per second', (1000*report.stats.mean/elapsedTime));
    printReportItem('Mean time per request (ms)', report.stats.mean);
    printReportItem('Time per request standard deviation', report.stats.deviation);
    //printReportItem('Time per request', report.mean + '[ms] (mean)');
    //printReportItem('Transfer rate'  19.08 [Kbytes/sec] received)
}

function doClientRequests() {
    var j = 0;

//     sys.puts("Client " +clientId+  " reporting in!");
    
    var myId = clientId;
    var connection = http.createClient(port, host);
    function doRequest() {
        if (++j > numRequests/numClients) return;

        var start = (new Date()).getTime();
        var request = connection.request(method, path, { 'host': host });
        request.finish(function(response) {
            var end = (new Date()).getTime();
            var	delta = end - start;
            times.push(delta);
            totalTime += delta;
// 	    sys.puts('Client ' +myId+  ' received response in ' +delta+ 'ms.');
            var len = times.length;

            if ((len % (numRequests/10)) == 0) {
                sys.puts(pad('Completed ' +times.length+ ' requests', 40) + ' ('+ (len/numRequests*100) + '%)');
            }
            if (len == numRequests) {
                elapsedTime = (new Date()) - elapsedStart;
                var s = stats(times);
                var report = {
                    stats: s
                };
                printReport(report);
                return;
            }
            response.addListener('body', function (body) {
                bytesTransferred += body.length;
            });
        });
        process.nextTick(arguments.callee);
    }
    process.nextTick(doRequest);
}

function main() {
    elapsedStart = new Date();
    for (var i = 0; i < numClients; i++) {
        doClientRequests();
        clientId++;
    }
}

main();
