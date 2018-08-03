import Component from '@ember/component';
import config from 'craigslist-electron/config/environment';

export default Component.extend({
    init() {
        this._super(...arguments);
    },

    actions: {
        test(property) {
            this.set('property', property);
            this.setProperty(property);

            if (config.limitAreaToPropertyState) {
                this.updateLocations(property.address.state.abbreviation);
            }         
        }
    }
});
