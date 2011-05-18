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
PLANCAKE_CHROME_EXTENSION.plancakeApiClient = null; // this properties is for implementing a Singleton

PLANCAKE_CHROME_EXTENSION.apiKey = 'efe31c2f0e034b0c76c7cf6be60b0842f280ee8c';
PLANCAKE_CHROME_EXTENSION.apiSecret = 'g3q82y4UxhYP69Ss';
PLANCAKE_CHROME_EXTENSION.apiEndpointUrl = 'http://api.plancake.com/api.php';


PLANCAKE_CHROME_EXTENSION.userKeyCookieName = 'userKey';
PLANCAKE_CHROME_EXTENSION.listsCookieName = 'lists';
PLANCAKE_CHROME_EXTENSION.cookieLifetimeInDays = 60;


$(document).ready(function() {
    var plancakeApiClient = null; 
    
    // $('#ajaxInProgress').css('display', 'none');    
    
    if (! $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName)) {
        $('form#enterUserKey').show();
        $('#userKeyValue').focus();
    } else {
        $('form#enterTask').show();
        
        try {
            plancakeApiClient = PLANCAKE_CHROME_EXTENSION.getPlancakeApiClient();
            
            PLANCAKE_CHROME_EXTENSION.populateListsCombo();            
        } catch(e) {
            alert(e.name + ': ' + e.message);
        }
    }
    
    $('form#enterUserKey').submit(function() {
        $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName, $('#userKeyValue').val(), {expires: PLANCAKE_CHROME_EXTENSION.cookieLifetimeInDays});
        
        try
        {
            plancakeApiClient = PLANCAKE_CHROME_EXTENSION.getPlancakeApiClient();

            if (plancakeApiClient.getServerTime() > 0) {
                // first request to the server was successful: we are ready to go
                $('form#enterUserKey').hide();
                $('form#enterTask').show();
                
                PLANCAKE_CHROME_EXTENSION.populateListsCombo();
                    
            } else {
                alert("Some error occurred. Are you sure the userKey was correct?")
            }
        } catch (e) {
            alert("Some error occurred. Are you sure the userKey was correct? (" + e.message + ")");            
        }
        return false;
    });
    
    $('form#enterTask').submit(function() {
        plancakeApiClient = PLANCAKE_CHROME_EXTENSION.getPlancakeApiClient();

        var task = new PLANCAKE.Task();
        task.description = $('#enterTaskValue').val();
        task.listId = $('select#listsCombo').val();
        var taskId = plancakeApiClient.addTask(task);

        if ( !(taskId > 0))
        {
            alert("Some error occurred."); 
        }
        
        $('#enterTaskValue').val('');
        return false;
    });   
    
    $('#refreshListsCombo').click(function() {
        PLANCAKE_CHROME_EXTENSION.refreshListsCombo();
    });
    
    $('#resetLink').click(function() {
        PLANCAKE_CHROME_EXTENSION.resetAll();
    });

    $('#getUrlLink').click(function() {
        chrome.tabs.getSelected(null, function(tab) {
            $('#enterTaskValue').val(tab.url);
        });
    });
});

/*
 * It implements a Singleton design pattern
 */
PLANCAKE_CHROME_EXTENSION.getPlancakeApiClient = function() {
    if (PLANCAKE_CHROME_EXTENSION.plancakeApiClient === null)
    {
        if (! $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName)) {
            alert("You need to store the userKey in a cookie before getting an API client");
            return null;
        }
        
        PLANCAKE_CHROME_EXTENSION.plancakeApiClient = new PLANCAKE.PlancakeApiClient({
                apiKey: PLANCAKE_CHROME_EXTENSION.apiKey, 
                apiSecret: PLANCAKE_CHROME_EXTENSION.apiSecret,
                apiEndpointUrl: PLANCAKE_CHROME_EXTENSION.apiEndpointUrl,
                userKey: $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName), // check Settings page
                startOfCommunicationCallback: PLANCAKE_CHROME_EXTENSION.displayAjaxLoader,
                endOfCommunicationWithSuccessCallback: PLANCAKE_CHROME_EXTENSION.displaySuccessMessage,
                endOfCommunicationWithErrorCallback: PLANCAKE_CHROME_EXTENSION.displayErrorMessage              
        });   
        
    }
    return PLANCAKE_CHROME_EXTENSION.plancakeApiClient;
}

PLANCAKE_CHROME_EXTENSION.resetAll = function() {
    $.cookie(PLANCAKE_CHROME_EXTENSION.userKeyCookieName, null);
    $.cookie(PLANCAKE_CHROME_EXTENSION.listsCookieName, null);        
    $('form#enterUserKey').show();
    $('form#enterTask').hide();        
};

PLANCAKE_CHROME_EXTENSION.refreshListsCombo = function(PlancakeApiClient) {
    $.cookie(PLANCAKE_CHROME_EXTENSION.listsCookieName, null);
    PLANCAKE_CHROME_EXTENSION.populateListsCombo();
};

PLANCAKE_CHROME_EXTENSION.populateListsCombo = function()
{
    var plancakeApiClient = PLANCAKE_CHROME_EXTENSION.getPlancakeApiClient();
    var lists = null;
    
    lists = JSON.parse($.cookie(PLANCAKE_CHROME_EXTENSION.listsCookieName));

    if (! lists)
    {
       lists = plancakeApiClient.getLists();
       $.cookie(PLANCAKE_CHROME_EXTENSION.listsCookieName, JSON.stringify(lists));
    }

    var listsCombo = $('select#listsCombo');
    var listItem = null, listsOption = null;
    
    listsCombo.find('option').remove(); // removing all the old options

    for(var i in lists) {
        listItem = lists[i];
        listsOption = $('<option></option>').val(listItem.id).html(listItem.name);
        if (listItem.is_header)
        {
            listsOption.addClass('header');
        }
        listsCombo.append(listsOption);
    }   
}

PLANCAKE_CHROME_EXTENSION.displayAjaxLoader = function () {
    $('#ajaxInProgress').show();
}

PLANCAKE_CHROME_EXTENSION.displaySuccessMessage = function () {
    $('#ajaxInProgress').hide();
}

PLANCAKE_CHROME_EXTENSION.displayErrorMessage = function (errorMessage) {
    $('#ajaxInProgress').hide();
}   