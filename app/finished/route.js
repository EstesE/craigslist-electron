import Route from '@ember/routing/route';

export default Route.extend({
    model(params) {
        return params;
    },

    afterModel(model) {
        if (model && model.pageToVisit) {
            const { shell } = window.requireNode('electron');
            shell.openExternal(model.pageToVisit);
        }
    }
});
