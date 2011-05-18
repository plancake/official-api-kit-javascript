/*************************************************************************************
* ===================================================================================*
* Software by: Danyuki Software Limited                                              *
* This file is part of Plancake.                                                     *
*                                                                                    *
* Copyright 2009-2010-2011 by:     Danyuki Software Limited                          *
* Support, News, Updates at:  http://www.plancake.com                                *
* Licensed under the AGPL version 3 license.                                         *                                                       *
* Danyuki Software Limited is registered in England and Wales (Company No. 07554549) *
**************************************************************************************
* Plancake is distributed in the hope that it will be useful,                        *
* but WITHOUT ANY WARRANTY; without even the implied warranty of                     *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                      *
* GNU Affero General Public License for more details.                                *
*                                                                                    *
* You should have received a copy of the GNU Affero General Public License           *
* along with this program.  If not, see <http://www.gnu.org/licenses/>.              *
*                                                                                    *
**************************************************************************************/

/* See file Example.js to see how to use the PlancakeApiClient object */

var PLANCAKE = PLANCAKE || {};

////////////////////////////////////////////////
//
// Throws an error in case of misconfiguration.
// Calls the callback endOfCommunicationWithErrorCallback (see param settings)
// in the case of a communication error
//
// @param object settings, i.e.:
// {
//           apiKey: 'efe31c2f0e034b0c76c7cf6be60b0842f280ee8c', 
//           apiSecret: 'g3q82y4UxhYP69Ss',
//           apiEndpointUrl: 'http://api.plancake,com/api.php',
//           userKey: 'jXkGa0uRuOlxcDO9VzeUWwfFIekYQZZj', // check Settings page
//           userEmailAddress: '', // this is usually empty
//           userPassword: '', // this is usually empty
//           extraInfoForGetTokenCall: 'this is the test for JS API kit', // optional
//           startOfCommunicationCallback: displayAjaxLoader, // optional
//           endOfCommunicationWithSuccessCallback: displaySuccessMessage, // optional
//           endOfCommunicationWithErrorCallback: displayErrorMessage // optional - the error message is passed as input                                                                            
// }
// 
////////////////////////////////////////////////
PLANCAKE.PlancakeApiClient = function(settings) {
                                                                                                                         
/***** CONSTANTS *****/

    var API_VER = 3; /* this is actually a constant */

    var INVALID_TOKEN_ERROR = 30; /* this is actually a constant */

    var UNKNOWN_ERROR = 999; /* this is actually a constant */

/***** PUBLIC PROPERTIES *****/

    /**
     * @var string
     */
    this.token = null;


/***** PRIVATE PROPERTIES *****/

    /**
     * @var string
     */
    var userKey = null;

    /**
     * @var string
     */
    var extraInfoForGetTokenCall = null;

    /**
     * @var string
     */
    var apiKey = null;

    /**
     * @var string
     */
    var apiSecret = null;

    /**
     * @var string
     */
    var apiEndpointUrl = null;

    /**
     * Used rarely, not applicable to personal API keys
     *
     * @var string
     */
    var userEmailAddress = null;

    /**
     * Used rarely, not applicable to personal API keys
     *
     * @var string
     */
    var userPassword = null;
    
    /**
     * @var string
     */    
    var startOfCommunicationCallback = null;
    
    /**
     * @var string
     */    
    var endOfCommunicationWithSuccessCallback = null;

    /**
     * @var string
     */    
    var endOfCommunicationWithErrorCallback = null;

/***** INITIALIZATION *****/

    if ( (settings.apiKey != null) && (settings.apiKey != undefined) 
                                    && (settings.apiKey.length > 0)) {
        apiKey = settings.apiKey;
    } else {
        throw new Error('You need  to specify an API key');
    }

    if ( (settings.apiSecret != null) && (settings.apiSecret != undefined) 
                                    && (settings.apiSecret.length > 0)) {
        apiSecret = settings.apiSecret;
    } else {
        throw new Error('You need  to specify an API secret');
    }
    
    if ( (settings.apiEndpointUrl != null) && (settings.apiEndpointUrl != undefined) 
                                    && (settings.apiEndpointUrl.length > 0)) {
        apiEndpointUrl = settings.apiEndpointUrl;
    } else {
        throw new Error('You need  to specify an API endpoint');
    }    

    if ( (settings.userKey != null) && (settings.userKey != undefined) 
                                    && (settings.userKey.length > 0)) {
        userKey = settings.userKey;
    }

    if ( (settings.userEmailAddress != null) && (settings.userEmailAddress != undefined) 
                                    && (settings.userEmailAddress.length > 0)) {
        userEmailAddress = settings.userEmailAddress;
    }
    
    if ( (settings.userPassword != null) && (settings.userPassword != undefined) 
                                        && (settings.userPassword.length > 0)) {    
        userPassword = settings.userPassword;        
    }
    
    if ( (userKey === null) && (userEmailAddress === null) && (userPassword === null) )
    {
        throw new Error('You need to specify either a userKey or userEmailAddress and userPassword');
    }

    if ( (settings.extraInfoForGetTokenCall != null) && (settings.extraInfoForGetTokenCall != undefined) 
                                        && (settings.extraInfoForGetTokenCall.length > 0)) {    
        extraInfoForGetTokenCall = settings.extraInfoForGetTokenCall;        
    }

    if ( (settings.startOfCommunicationCallback != null) && (settings.startOfCommunicationCallback != undefined) ) {    
        startOfCommunicationCallback = settings.startOfCommunicationCallback;      
    }

    if ( (settings.endOfCommunicationWithSuccessCallback != null) && (settings.endOfCommunicationWithSuccessCallback != undefined) ) {    
        endOfCommunicationWithSuccessCallback = settings.endOfCommunicationWithSuccessCallback;        
    }

    if ( (settings.endOfCommunicationWithErrorCallback != null) && (settings.endOfCommunicationWithErrorCallback != undefined) ) {    
        endOfCommunicationWithErrorCallback = settings.endOfCommunicationWithErrorCallback;        
    }

/***** PRIVATE METHODS *****/
    /**
     *
     * @param object(associative array) params - including token
     * @param string methodName
     * @return string
     */
    var getSignatureForRequest = function(params, methodName) {
        
        var paramKeys = [];
        var key, i, str;
            
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                    paramKeys.push(key);
            }
        }            
        
        paramKeys.sort();

        str = methodName;
        for(i in paramKeys) {
           str +=  paramKeys[i] + params[paramKeys[i]];
        }

        str += apiSecret;

        return PLANCAKE.Utils.md5(str);
    }
   

    /**
     *
     * @param object(associative array) $params
     * @param string methodName
     * @return object:
     *   {
     *      url: http://.....
     *      params: a=b&c=d
     *   }
     */
    var prepareRequest = function(params, methodName) {
        var request = {}, signature, key;

        params.token = this.token;
        params.api_ver = API_VER;

        signature = getSignatureForRequest(params, methodName);

        request.url = apiEndpointUrl + '/' + methodName;
        
        request.params = '';
        for (key in params) {
            request.params += key + '=' + encodeURI(params[key]) + '&';
        }
        request.params += 'sig=' + signature;

        return request;
    }

    /**
     * @return 
     */
    var resetToken = function() {
        // we don't have a token yet or it has been reset as
        // it was probably expired
        var params = {},
            request = null,
            response = null;


        this.token = '';
        
        params.token = '';
        params.api_key = apiKey;
        params.api_ver = API_VER;

        if ( extraInfoForGetTokenCall !== null ) {
            params.extra_info = extraInfoForGetTokenCall;
        }

	if (userEmailAddress !== null) {
	   params.user_email = userEmailAddress;		  
	}

	if (userPassword !== null) {
	   params.user_pwd = userPassword;		  
	}

	if (userKey !== null) {
	   params.user_key = userKey;
	}

        request = prepareRequest.call(this, params, 'getToken');

        $.ajax({
            url: request.url,
            crossdomain: true,
            timeout: 30000,
            async: false,
            dataType: 'json',
            type: 'POST', // if we use GET, the reply could be cached, even if we don't want
            data: request.params,
            success: $.proxy( function(dataFromServer) {
                response = dataFromServer;

                if (response.error) {
                    if (endOfCommunicationWithErrorCallback !== null) {
                        endOfCommunicationWithErrorCallback(response.error);
                    }
                }

                this.token = response.token;                  
            }, this)
        });
    }
    
    /**
     *
     * @param object params
     * @param string methodName
     * @param object httpMethod (= POST)
     * @return json object
     */
    var sendRequest = function(params, methodName, httpMethod) {
        var request = null, response = null, methodResponse = null, errorDuringRequest = null;          
        
        if ( (this.token === null) || !(this.token.length > 0) ) {
            resetToken.call(this);
        }

        if ( (httpMethod === undefined) || (httpMethod === null) ) {
            httpMethod = 'POST'; // if we use GET, the reply could be cached, even if we don't want
        }

        request = prepareRequest.call(this, params, methodName);
        
        if (startOfCommunicationCallback !== null)
        {
            startOfCommunicationCallback();
        }

        $.ajax({
            url: request.url,
            crossdomain: true,
            async: false,
            timeout: 30000,
            dataType: 'json',
            type: httpMethod,
            data: request.params,
            success: $.proxy( function(dataFromServer) 
            {
                response = dataFromServer;

                //Plancake.Utils.dump(response);
                if (response.error) {
                    // if the error is an INVALID_TOKEN_ERROR, we try to get the token again
                    // (maybe it was just expired)
                    if (response.error == INVALID_TOKEN_ERROR) {
                        resetToken();
                        request = prepareRequest.call(this, params, methodName);

                        $.ajax({
                            url: request.url,
                            crossdomain: true,
                            async: false,
                            timeout: 30000,
                            dataType: 'json',
                            type: httpMethod,
                            data: request.params,
                            success: $.proxy( function(dataFromServer) {
                                response = dataFromServer;
                                if (response.error) {
                                    errorDuringRequest = response.error; 
                                } else {
                                    methodResponse = dataFromServer;
                                }
                                if (endOfCommunicationWithSuccessCallback !== null) {
                                    endOfCommunicationWithSuccessCallback();
                                }
                            }, this),
                            error: function () { 
                                errorDuringRequest = "Error " + UNKNOWN_ERROR; 
                            }
                         });
                    } else {
                        errorDuringRequest = response.error;  
                    }
                } else {
                    methodResponse = dataFromServer;
                    if (endOfCommunicationWithSuccessCallback !== null) {
                        endOfCommunicationWithSuccessCallback();
                    }                    
                }
            }, this),
            error: function () {
                errorDuringRequest = "Error " + UNKNOWN_ERROR;
            }
        });
        
        if (errorDuringRequest != null) {
            if (endOfCommunicationWithErrorCallback !== null) {
                endOfCommunicationWithErrorCallback(response.error);
            }            
        }
        
        return methodResponse;
    }
    
/***** PUBLIC METHODS *****/
    
    /**
     *
     * @return array
     */
    this.getServerTime = function() {
        var response = sendRequest.call(this, {}, 'getServerTime');

        return response.time;
    } 
    
     /**
     * @param int fromTimestamp (=null) - to return only the lists created or edited after this timestamp (GMT)
     * @param int toTimestamp (=null) - to return only the lists created or edited till this timestamp (GMT)
     * @return object
     */
    this.getLists = function(fromTimestamp, toTimestamp)
    {
        params = {};

        if (fromTimestamp > 0)
        {
            params.from_ts = fromTimestamp;
            params.to_ts = toTimestamp;
        }

        response = sendRequest.call(this, params, 'getLists');

        return response.lists;
    }  
    
    /**
     *
     * @param object (PlancakeTask) task
     * @return int - the taskId
     */
    this.addTask = function(task)
    {        
        params.descr = task.description;
        params.is_header = task.isHeader ? 1 : 0;
        params.is_starred = task.isStarred ? 1 : 0;

        if (task.listId !== null)
            params.list_id = task.listId;
        if (task.dueDate !== null)
            params.due_date = task.dueDate;
        if (task.dueTime !== null)
            params.due_time = task.dueTime;
        if (task.repetitionId !== null)
            params.repetition_id = task.repetitionId;
        if (task.repetitionParam !== null)
            params.repetition_param = task.repetitionParam;
        if (task.repetitionIcalRrule !== null)
            params.repetition_ical_rrule = task.repetitionIcalRrule;
        if (task.note !== null)
            params.note = task.note;
        if (task.tagIds !== null)
            params.tag_ids = task.tagIds;

        response = sendRequest.call(this, params, 'addTask');

        return response.task_id;
    }
    
}