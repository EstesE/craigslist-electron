import Service from '@ember/service';
import config from 'craigslist-electron/config/environment';
import fetch from 'fetch';

export default Service.extend({
    find: function(/*options*/) {
        return fetch(config.web.baseApiURL + '/states?active=true&select=name,abbreviation').then(response => {
            return response.json();
        }).catch(/*err*/ () => {
            // console.log(`Error: ${err}`);
        });
    }
});
