import Service from '@ember/service';
import config from 'craigslist-electron/config/environment';
import fetch from 'fetch';

export default Service.extend({
    find: function(/*options*/) {
        return fetch(config.web.baseApiURL + '/properties?sold=false').then(response => {
            return response.json();
        }).catch(/*err*/ () => {
            // console.log(`Error: ${err}`);
        });
    }
});
