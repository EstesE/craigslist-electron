import Component from '@ember/component';
import config from 'craigslist-electron/config/environment';

export default Component.extend({
    removeFiles: function() {
        const fs = window.requireNode('fs');
        const path = window.requireNode('path');
        let directory = config.path;

        fs.readdir(directory, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });
    },

    init() {
        this._super(...arguments);
        this.removeFiles();
    }
});
