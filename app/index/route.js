import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { allSettled } from 'rsvp';

export default Route.extend({
    craigslistRepo: inject('craigslist-repository'),
    stateRepo: inject('state-repository'),
    propertyRepo: inject('property-repository'),
    notifications: inject('toast'),

    model() {
        let route = this;

        let locations = route.get('craigslistRepo').find({}).then((r) => {
            return r;
        });

        let states = route.get('stateRepo').find({
        }).then(r => {
            return r.items;
        }).catch(e => {
            let notifications = this.get('notifications');
            notifications.error('Error', e.message, { progressBar: false, timeOut: 0, extendedTimeOut: 0 });
        });

        let properties = route.get('propertyRepo').find({
        }).then(r => {
            return r.items;
        }).catch(e => {
            let notifications = this.get('notifications');
            notifications.error('Error', e.message, { progressBar: false, timeOut: 0, extendedTimeOut: 0 });
        });

        let promises = [locations,states,properties];

        return allSettled(promises).then(function(array) {
            return {
                craigslistLocations: array[0].value,
                states: array[1].value,
                properties: array[2].value
            };
        }, function(error) {
            let notifications = this.get('notifications');
            notifications.error('Error', error.message, { progressBar: false, timeOut: 0, extendedTimeOut: 0 });
        });
    },

    setupController(controller, model) {
        if (model) {
            let ourLocations = [];
            model.craigslistLocations.map((loc) => {
                if (loc.country === 'US') {
                    ourLocations.push(loc);
                }
            });
            
            // console.log(ourLocations.sortBy('region', 0));
            controller.set('model', {
                locations: ourLocations.sortBy('region', 0),
                properties: model.property,
                property: model.properties[Math.floor(Math.random() * model.properties.length)]
            });
        }
    }
});
