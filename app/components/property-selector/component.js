import Component from '@ember/component';

export default Component.extend({
    init() {
        this._super(...arguments);
    },

    actions: {
        test(property) {
            this.set('property', property);
            this.setProperty(property);
        }
    }
});
