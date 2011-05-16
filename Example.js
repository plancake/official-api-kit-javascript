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

try {
    
    PLANCAKE.PlancakeApiClientSettings = {                           
    }    
    
    PLANCAKE.ApiClient = new PLANCAKE.PlancakeApiClient({
            apiKey: 'efe31c2f0e034b0c76c7cf6be60b0842f280ee8c', 
            apiSecret: 'g3q82y4UxhYP69Ss',
            apiEndpointUrl: 'http://www.plancake/api_dev.php',
            userKey: 'jXkGa0uRuOlxcDO9VzeUWwfFIekYQZZj', // check Settings page
            userEmailAddress: '', // this is usually empty
            userPassword: '', // this is usually empty
            extraInfoForGetTokenCall: 'js_api_test'                                                                  
    });

    alert("Testing getServerTime");
    alert(PLANCAKE.ApiClient.getServerTime());
    
    alert("Testing getLists - see Firebug console");
    console.log(lists = PLANCAKE.ApiClient.getLists());
    
    alert("Testing addTask");
    var task = new PLANCAKE.Task();
    task.description = 'test from Javascript API kit';
    alert(PLANCAKE.ApiClient.addTask(task));    

} catch(e) {
    alert(e.name + ': ' + e.message);
}