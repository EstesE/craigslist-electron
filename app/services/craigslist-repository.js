import Service from '@ember/service';

export default Service.extend({
    find: function(options) {
        const fetch = window.requireNode('node-fetch');
        return fetch('https://www.craigslist.org/about/areas.json').then(response => {
            return response.json();
        }).catch(err => {
            debugger;  
        });
    }
});
