NAME
----

    azathoth - HTTP benchmark and load generator tool

SYNOPSIS
--------

    azathoth.js <options> http://example.com:8080/

DESCRIPTION
-----------

    azathoth is for generating lots of HTTP traffic. By utilizing Node.js's
    powerful asynchronous abilities it's possible to create an enormous number
    of requests.

----

    Outside the ordered universe that amorphous blight of nethermost confusion
    which blasphemes  and bubbles at the center of all infinity; the boundless
    daemon sultan Azathoth, whose name no lips dare speak aloud, and who gnaws
    hungrily in inconceivable, unlighted chambers beyond time and space amidst
    the muffled, maddening beating of vile drums and the thin monotonous whine
    of accursed flutes.                     The Dream Quest -- H. P. Lovecraft

OPTIONS
-------
    
    -c Number of concurrent connections to use. Each client will make a
       number of requests equal to the total number of requests divided by this number.

    -n Total number of requests to make.

    -m HTTP method to use (default: GET)


ENVIRONMENT
-----------

    azathoth requires node to be installed somewhere on your path.

AUTHOR
------

    Orlando Vazquez <ovazquez@gmail.com>

SEE ALSO
--------

    ab(1)
