import { helper } from '@ember/component/helper';

export function toTitlecase(params/*, hash*/) {
  if(typeof(params) !== 'undefined') {
		params = params.toString().replace(/-/g, ' ');
		return params.replace(/\b./g, function(m) {
			return m.toUpperCase();
		});
	}
	return params;
}

export default helper(toTitlecase);
