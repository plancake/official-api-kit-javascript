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

var PLANCAKE_CHROME_EXTENSION = {};
PLANCAKE_CHROME_EXTENSION.apiKey = 'efe31c2f0e034b0c76c7cf6be60b0842f280ee8c';
PLANCAKE_CHROME_EXTENSION.apiSecret = 'g3q82y4UxhYP69Ss';
PLANCAKE_CHROME_EXTENSION.apiEndpointUrl = 'http://api.plancake.com/api.php';


PLANCAKE_CHROME_EXTENSION.userKeyCookieName = 'userKey';
PLANCAKE_CHROME_EXTENSION.cookieLifetimeInDays = 60;


$(document).ready(function() {
    
    if (! $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName)) {
        $('form#enterUserKey').show();
        $('#userKeyValue').focus();
    } else {
        $('form#enterTask').show();
        
        try {
            PLANCAKE.ApiClient = new PLANCAKE.PlancakeApiClient({
                    apiKey: PLANCAKE_CHROME_EXTENSION.apiKey, 
                    apiSecret: PLANCAKE_CHROME_EXTENSION.apiSecret,
                    apiEndpointUrl: PLANCAKE_CHROME_EXTENSION.apiEndpointUrl,
                    userKey: $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName) // check Settings page
            });

            var lists = PLANCAKE.ApiClient.getLists();

            var task = new PLANCAKE.Task();
            task.description = 'test from Javascript API kit';   
        } catch(e) {
            alert(e.name + ': ' + e.message);
        }
    }
    
    $('form#enterUserKey').submit(function() {
        $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName, $('#userKeyValue').val(), {expires: PLANCAKE_CHROME_EXTENSION.cookieLifetimeInDays});
        
        try
        {
            PLANCAKE.ApiClient = new PLANCAKE.PlancakeApiClient({
                    apiKey: PLANCAKE_CHROME_EXTENSION.apiKey, 
                    apiSecret: PLANCAKE_CHROME_EXTENSION.apiSecret,
                    apiEndpointUrl: PLANCAKE_CHROME_EXTENSION.apiEndpointUrl,
                    userKey: $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName) // check Settings page
            });

            if (PLANCAKE.ApiClient.getServerTime() > 0) {
                alert(PLANCAKE.ApiClient.getServerTime());
                // first request to the server was successful: we are ready to go
                $('form#enterUserKey').hide();
                $('form#enterTask').show();
            } else {
                alert("Some error occurred. Are you sure the userKey was correct?")
            }
        } catch (e) {
            alert("Some error occurred. Are you sure the userKey was correct? (" + e.message + ")");            
        }
    });
    
    $('form#enterTask').submit(function() {
        PLANCAKE.ApiClient = new PLANCAKE.PlancakeApiClient({
                apiKey: PLANCAKE_CHROME_EXTENSION.apiKey, 
                apiSecret: PLANCAKE_CHROME_EXTENSION.apiSecret,
                apiEndpointUrl: PLANCAKE_CHROME_EXTENSION.apiEndpointUrl,
                userKey: $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName) // check Settings page
        });

        var task = new PLANCAKE.Task();
        task.description = $('#enterTaskValue').val();
        var taskId = PLANCAKE.ApiClient.addTask(task);
        alert(taskId);
        if ( !(taskId > 0))
        {
            alert("Some error occurred."); 
        }
    });    
    
    $('a#resetLink').click(function() {
        $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName, null);
        $('form#enterUserKey').show();
        $('form#enterTask').hide();        
    });
});