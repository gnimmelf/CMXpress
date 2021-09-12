 /******************************************************************************
 * Copyright (c) 2016 Nicola Del Gobbo
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
 * WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing permissions
 * and limitations under the License.
 *
 * Contributors - initial API implementation:
 * Nicola Del Gobbo <nicoladelgobbo@gmail.com>
 * Antonio D'Angelo <tonydangelo123@gmail.com>
 *****************************************************************************/

'use strict';

/**
 *
 */
const types = {
    "BAD_REQUEST": {
        "name": "Bad Request",
        "code": 400,
        "description": "The request could not be understood by the server due to malformed syntax. The client SHOULD " +
            "NOT repeat the request without modifications."
    },
    "UNAUTHORIZED": {
        "code": 401,
        "name": "Unauthorized",
        "description": "The request requires user authentication. The response MUST include a WWW-Authenticate header" +
            " field containing a challenge applicable to the requested resource. The client MAY repeat the request with" +
            " a suitable Authorization header field. If the request already included Authorization credentials, then the" +
            " 401 response indicates that authorization has been refused for those credentials. If the 401 response" +
            " contains the same challenge as the prior response, and the user agent has already attempted authentication" +
            " at least once, then the user SHOULD be presented the entity that was given in the response, since that" +
            " entity might include relevant diagnostic information."
    },
    "FORBIDDEN": {
        "code": 403,
        "name": "Forbidden",
        "description": "The server understood the request, but is refusing to fulfill it. Authorization will not help" +
            " and the request SHOULD NOT be repeated. If the request method was not HEAD and the server wishes to make" +
            " public why the request has not been fulfilled, it SHOULD describe the reason for the refusal in the entity." +
            " If the server does not wish to make this information available to the client, the status code 404" +
            " (Not Found) can be used instead."
    },
    "NOT_FOUND": {
        "code": 404,
        "name": "Not Found",
        "description": "The server has not found anything matching the Request-URI. No indication is given of whether" +
            " the condition is temporary or permanent. The 410 (Gone) status code SHOULD be used if the server knows," +
            " through some internally configurable mechanism, that an old resource is permanently unavailable and has no" +
            " forwarding address. This status code is commonly used when the server does not wish to reveal exactly why " +
            " the request has been refused, or when no other response is applicable."
    },
    "METHOD_NOT_ALLOWED": {
        "code": 405,
        "name": "Method Not Allowed",
        "description": "The method specified in the Request-Line is not allowed for the resource identified by the" +
            " Request-URI. The response MUST include an Allow header containing a list of valid methods for the requested" +
            " resource."
    },
    "NOT_ACCEPTABLE": {
        "code": 406,
        "name": "Not Acceptable",
        "description": "The resource identified by the request is only capable of generating response entities which " +
            " have content characteristics not acceptable according to the accept headers sent in the request."
    },
    "PROXY_AUTHENTICATION_REQUIRED": {
        "code": 407,
        "name": "Proxy Authentication Required",
        "description": "This code is similar to 401 (Unauthorized), but indicates that the client must first" +
            " authenticate itself with the proxy. The proxy MUST return a Proxy-Authenticate header field containing a" +
            " challenge applicable to the proxy for the requested resource. The client MAY repeat the request with a" +
            " suitable Proxy-Authorization header field."
    },
    "REQUEST_TIMEOUT": {
        "code": 408,
        "name": "Request Timeout",
        "description": "The client did not produce a request within the time that the server was prepared to wait. " +
            " The client MAY repeat the request without modifications at any later time."
    },
    "CONFLICT": {
        "code": 409,
        "name": "Conflict",
        "description": "The request could not be completed due to a conflict with the current state of the resource." +
            " This code is only allowed in situations where it is expected that the user might be able to resolve the " +
            " conflict and resubmit the request. The response body SHOULD include enough information for the user to " +
            " recognize the source of the conflict. Ideally, the response entity would include enough information for the" +
            " user or user agent to fix the problem; however, that might not be possible and is not required."
    },
    "GONE": {
        "code": 410,
        "name": "Gone",
        "description": "The requested resource is no longer available at the server and no forwarding address is" +
            " known. This condition is expected to be considered permanent. Clients with link editing capabilities SHOULD" +
            " delete references to the Request-URI after user approval. If the server does not know, or has no facility" +
            " to determine, whether or not the condition is permanent, the status code 404 (Not Found) SHOULD be used " +
            " instead. This response is cacheable unless indicated otherwise."
    },
    "LENGTH_REQUIRED": {
        "code": 411,
        "name": "Length Required",
        "description": "The server refuses to accept the request without a defined Content- Length. The client MAY" +
            " repeat the request if it adds a valid Content-Length header field containing the length of the message-body" +
            " in the request message."
    },
    "PRECONDITION_FAILED": {
        "code": 412,
        "name": "Precondition Failed",
        "description": "The precondition given in one or more of the request-header fields evaluated to false when it" +
            " was tested on the server. This response code allows the client to place preconditions on the current " +
            " resource metainformation (header field data) and thus prevent the requested method from being applied to a" +
            " resource other than the one intended."
    },
    "REQUEST_ENTITY_TOO_LARGE": {
        "code": 413,
        "name": "Request Entity Too Large",
        "description": "The server is refusing to process a request because the request entity is larger than the" +
            " server is willing or able to process. The server MAY close the connection to prevent the client from " +
            " continuing the request."
    },
    "REQUEST_URI_TOO_LONG": {
        "code": 414,
        "name": "Request-URI Too Long",
        "description": "The server is refusing to service the request because the Request-URI is longer than the" +
            " server is willing to interpret. This rare condition is only likely to occur when a client has improperly" +
            " converted a POST request to a GET request with long query information, when the client has descended into" +
            " a URI black hole of redirection (e.g., a redirected URI prefix that points to a suffix of itself), or when" +
            " the server is under attack by a client attempting to exploit security holes present in some servers using" +
            " fixed-length buffers for reading or manipulating the Request-URI."
    },
    "UNSUPPORTED_MEDIA_TYPE": {
        "code": 415,
        "name": "Unsupported Media Type",
        "description": "The server is refusing to service the request because the entity of the request is in a" +
            " format not supported by the requested resource for the requested method."
    },
    "REQUESTED_RANGE_NOT_SATISFIABLE": {
        "code": 416,
        "name": "Requested Range Not Satisfiable",
        "description": "A server SHOULD return a response with this status code if a request included a Range" +
            " request-header field, and none of the range-specifier values in this field overlap the current extent of " +
            " the selected resource, and the request did not include an If-Range request-header field. (For byte-ranges, " +
            " this means that the first- byte-pos of all of the byte-range-spec values were greater than the current " +
            " length of the selected resource.) When this status code is returned for a byte-range request, the response " +
            " SHOULD include a Content-Range entity-header field specifying the current length of the selected resource." +
            " This response MUST NOT use the multipart/byteranges content- type."
    },
    "EXPECTATION_FAILED": {
        "code": 417,
        "name": "Expectation Failed",
        "description": "The expectation given in an Expect request-header field could not be met by this server, or," +
            " if the server is a proxy, the server has unambiguous evidence that the request could not be met by the" +
            " next-hop server."
    },
    "I_AM_A_TEAPOT": {
        "code": 418,
        "name": "I'm a teapoat (RFC 2324)",
        "description": "This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324," +
            " Hyper Text Coffee Pot Control Protocol, and is not expected to be implemented by actual HTTP servers."
    },
    "ENHANCE_YOUR_CALM": {
        "code": 420,
        "name": "Enhance Your Calm",
        "description": "Returned by the API endpoint when the client is being rate limited. Likely a reference to" +
            " this number's association with marijuana. Other services may wish to implement the 429 Too Many Requests " +
            " response code instead."
    },
    "UNPROCESSABLE_ENTITY": {
        "code": 422,
        "name": "Unprocessable Entity",
        "description": "The 422 (Unprocessable Entity) status code means the server understands the content type of" +
            " the request entity (hence a 415(Unsupported Media Type) status code is inappropriate), and the syntax of" +
            " the request entity is correct (thus a 400 (Bad Request) status code is inappropriate) but was unable to" +
            " process the contained instructions. For example, this error condition may occur if an XML request body" +
            " contains well-formed (i.e., syntactically correct), but semantically erroneous, XML instructions."
    },
    "LOCKED": {
        "code": 423,
        "name": "Locked (WebDAV)",
        "description": "The 423 (Locked) status code means the source or destination resource of a method is locked." +
            " This response SHOULD contain an appropriate precondition or postcondition code, such as" +
            " 'lock-token-submitted' or 'no-conflicting-lock'."
    },
    "FAILED_DEPENDENCY": {
        "code": 424,
        "name": "Failed Dependency (WebDAV)",
        "description": "The 424 (Failed Dependency) status code means that the method could not be performed on the" +
            " resource because the requested action depended on another action and that action failed."
    },
    "RESERVED_FOR_WEBDAV": {
        "code": 425,
        "name": "Reserved for WebDAV",
        "description": "Defined in drafts of WebDAV Advanced Collections Protocol, but not present in Web Distributed" +
            " Authoring and Versioning (WebDAV) Ordered Collections Protocol."
    },
    "UPGRADE_REQUIRED": {
        "code": 426,
        "name": "Upgrade Required",
        "description": "Reliable, interoperable negotiation of Upgrade features requires an unambiguous failure" +
            " signal. The 426 Upgrade Required status code allows a server to definitively state the precise protocol" +
            " extensions a given resource must be served with."
    },
    "PRECONDITION_REQUIRED": {
        "code": 428,
        "name": "Precondition Required",
        "description": "The origin server requires the request to be conditional. Intended to prevent the LOST UPDATE" +
            " PROBLEM, where a client GETs a resource's state, modifies it, and PUTs it back to the server, when" +
            " meanwhile a third party has modified the state on the server, leading to a conflict."
    },
    "TOO_MANY_REQUESTS": {
        "code": 429,
        "name": "Too Many Requests",
        "description": "The 429 status code indicates that the user has sent too many requests in a given amount of" +
            " time (rate limiting). The response representations SHOULD include details explaining the condition, and MAY" +
            " include a Retry-After header indicating how long to wait before making a new request."
    },
    "REQUEST_HEADER_FIELDS_TOO_LARGE": {
        "code": 431,
        "name": "Request Header Fields Too Large",
        "description": "The 431 status code indicates that the server is unwilling to process the request because its" +
            " header fields are too large. The request MAY be resubmitted after reducing the size of the request header" +
            " fields."
    },
    "NO_RESPONSE": {
        "code": 444,
        "name": "No Response",
        "description": "The server returns no information to the client and closes the connection (useful as a" +
            " deterrent for malware)."
    },
    "RETRY_WITH": {
        "code": 449,
        "name": "Retry With (Microsoft)",
        "description": "A Microsoft extension. The request should be retried after performing the appropriate action."
    },
    "BLOCKED_BY_WINDOWS_PARENTAL_CONTROLS": {
        "code": 450,
        "name": "Blocked by Windows Parental Controls (Microsoft)",
        "description": "A Microsoft extension. This error is given when Windows Parental Controls are turned on and" +
            " are blocking access to the given webpage."
    },
    "CLIENT_CLOSED_REQUEST": {
        "code": 499,
        "name": "Client Closed Request",
        "description": "This code is introduced to log the case when the connection is closed by client while HTTP" +
            " server is processing its request, making server unable to send the HTTP header back."
    },
    "INTERNAL_SERVER_ERROR": {
        "code": 500,
        "name": "Internal Server Error",
        "description": "The server encountered an unexpected condition which prevented it from fulfilling the request."
    },
    "NOT_IMPLEMENTED": {
        "code": 501,
        "name": "Not Implemented",
        "description": "The server does not support the functionality required to fulfill the request. This is the" +
            " appropriate response when the server does not recognize the request method and is not capable of supporting" +
            " it for any resource."
    },
    "BAD_GATEWAY": {
        "code": 502,
        "name": "Bad Gateway",
        "description": "The server, while acting as a gateway or proxy, received an invalid response from the" +
            " upstream server it accessed in attempting to fulfill the request."
    },
    "SERVICE_UNAVAILABLE": {
        "code": 503,
        "name": "Service Unavailable",
        "description": "The server is currently unable to handle the request due to a temporary overloading or" +
            " maintenance of the server. The implication is that this is a temporary condition which will be alleviated" +
            " after some delay. If known, the length of the delay MAY be indicated in a Retry-After header. If no" +
            " Retry-After is given, the client SHOULD handle the response as it would for a 500 response."
    },
    "GATEWAY_TIMEOUT": {
        "code": 504,
        "name": "Gateway Timeout",
        "description": "The server, while acting as a gateway or proxy, did not receive a timely response from the" +
            " upstream server specified by the URI (e.g. HTTP, FTP, LDAP) or some other auxiliary server (e.g. DNS) it" +
            " needed to access in attempting to complete the request."
    },
    "HTTP_VERSION_NOT_SUPPORTED": {
        "code": 505,
        "name": "HTTP Version Not Supported",
        "description": "The server does not support, or refuses to support, the HTTP protocol version that was used" +
            " in the request message. The server is indicating that it is unable or unwilling to complete the request" +
            " using the same major version as the client, as described in section 3.1, other than with this error" +
            " message. The response SHOULD contain an entity describing why that version is not supported and what other" +
            " protocols are supported by that server."
    },
    "VARIANT_ALSO_NEGOTIATES": {
        "code": 506,
        "name": "Variant Also Negotiates",
        "description": "The 506 status code indicates that the server has an internal configuration error: the chosen" +
            " variant resource is configured to engage in transparent content negotiation itself, and is therefore not a" +
            " proper end point in the negotiation process."
    },
    "INSUFFICIENT_STORAGE": {
        "code": 507,
        "name": "Insufficient Storage (WebDAV)",
        "description": "The 507 (Insufficient Storage) status code means the method could not be performed on the" +
            " resource because the server is unable to store the representation needed to successfully complete the" +
            " request. This condition is considered to be temporary. If the request that received this status code was" +
            " the result of a user action, the request MUST NOT be repeated until it is requested by a separate user" +
            " action."
    },
    "LOOP_DETECTED": {
        "code": 508,
        "name": "Loop Detected (WebDAV)",
        "description": "The 508 (Loop Detected) status code indicates that the server terminated an operation because" +
            " it encountered an infinite loop while processing a request with Depth: infinity. This status indicates that" +
            " the entire operation failed."
    },
    "BANDWIDTH_LIMIT_EXCEEDED": {
        "code": 509,
        "name": "Bandwidth Limit Exceeded",
        "description": "This status code, while used by many servers, is not specified in any RFCs."
    },
    "NOT_EXTENDED": {
        "code": 510,
        "name": "Not Extended",
        "description": "The policy for accessing the resource has not been met in the request. The server should send" +
            " back all the information necessary for the client to issue an extended request. It is outside the scope of" +
            " this specification to specify how the extensions inform the client."
    },
    "NETWORK_AUTHENTICATION_REQUIRED": {
        "code": 511,
        "name": "Network Authentication Required",
        "description": "The 511 status code indicates that the client needs to authenticate to gain network access." +
            " The response representation SHOULD contain a link to a resource that allows the user to submit credentials."
    },
    "NETWORK_READ_TIMEOUT_ERROR": {
        "code": 598,
        "name": "Network read timeout error",
        "description": "This status code is not specified in any RFCs, but is used by some HTTP proxies to signal a" +
            " network read timeout behind the proxy to a client in front of the proxy."
    },
    "NETWORK_CONNECT_TIMEOUT_ERROR": {
        "code": 599,
        "name": "Network connect timeout error",
        "description": ""
    }
};

/**
 * Represents a RESTfulError
 */

class RESTfulError extends Error {

  constructor(typeOrCode, message) {
    const errorType = RESTfulError.getByTypeOrCode(typeOrCode)
    super(message || errorType.name);
    Object.assign(this, errorType);
  }

  static getTypes() {
    return Object.keys(types);
  }

  static getTypeInfo(type) {
    return Object.assign({}, types[type]);
  }

  static getTypeByCode(code) {
    return Object.keys(types).find(key => parseInt(types[key].code) == code);
  }

  static getByTypeOrCode(typeOrCode) {
    return types[(Number.isNaN(Number(typeOrCode)) ? typeOrCode : RESTfulError.getTypeByCode(typeOrCode))];
  }

  get [Symbol.toStringTag]() {
    return 'RESTfulError';
  }

  toString() {
    return `${this.code}: ${super.toString()}`
  }
}

/**
 *
 */
module.exports = RESTfulError;