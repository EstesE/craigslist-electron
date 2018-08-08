import Component from '@ember/component';

export default Component.extend({
    actions: {
        select(value) {
            let myValue = $('input', value)[0].value;
            this.continueLaunch(this.contents, this.page, this.browser, myValue);
            // this.continueLaunch(this.contents, this.page, this.browser, value);
        }
    }
});
