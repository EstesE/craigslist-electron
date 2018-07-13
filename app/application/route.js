import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { allSettled } from 'rsvp';

export default Route.extend({
    craigslistRepo: inject('craigslist-repository'),
    stateRepo: inject('state-repository'),
    propertyRepo: inject('property-repository'),

    model() {
        // return this.get('craigslistRepo').find({}).then((r) => {
        //     return r;
        // });

        let route = this;

        let locations = route.get('craigslistRepo').find({}).then((r) => {
            return r;
        });

        let states = route.get('stateRepo').find({
        }).then(r => {
            return r.items;
        }).catch(e => {
            console.log(`Error: ${e}`);
        });

        let properties = route.get('propertyRepo').find({
        }).then(r => {
            return r.items;
        }).catch(e => {
            console.log(`Error: ${e}`);
        });

        let promises = [locations,states,properties];

        return allSettled(promises).then(function(array) {
            return {
                craigslistLocations: array[0].value,
                states: array[1].value,
                property: array[2].value
            };
        }, function(error) {
            debugger;
        });
    },

    setupController(controller, model) {
        // debugger;
        if (model) {
            let ourLocations = [];
            model.craigslistLocations.map((loc) => {
                if (loc.country === 'US') {
                    ourLocations.push(loc);
                }
            });
            // debugger;
            
            // console.log(ourLocations.sortBy('region', 0));
            controller.set('model', {
                locations: ourLocations.sortBy('region', 0),
                property: model.property[Math.floor(Math.random() * model.property.length)]
            });
        }
    }
});
