import Component from '@ember/component';
import { set } from '@ember/object';
import config from 'craigslist-electron/config/environment';

export default Component.extend({

    init() {
        this._super(...arguments);
        let component = this;
        // debugger;
        let gallery = this.get('model');
		gallery.map(function (image) {
			if (!image.active) {
				set(image, 'active', true);
			}
		});

		component.set('blobBaseUrl', config.asset.baseURL);
        component.set('blobContainer', config.asset.container);
    },

    actions: {
        // addImage(image) {
        //     debugger;
        // }
    }
});
