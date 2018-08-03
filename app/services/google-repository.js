import Service from '@ember/service';
import { loc } from '@ember/string';

export default Service.extend({
    find: async function(options) {
        const fetch = window.requireNode('node-fetch');
        let res = fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${options.property.address.city},${options.property.address.state.abbreviation}&destinations=${options.loc.lat},${options.loc.lon}`).then(response => {
            return response.json();
        }).catch((err) => {
            debugger;  
        });

        return await res;
    }
});
