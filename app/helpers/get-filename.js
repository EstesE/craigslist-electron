import { helper } from '@ember/component/helper';
import { isPresent } from '@ember/utils';

export function getFilename(params/*, hash*/) {
  if (isPresent(params) && isPresent(params[0])) {
    let filename = params[0].replace(/^.*[\\\/]/, ''); // eslint-disable-line no-useless-escape
    params = filename;
  }
  return params;
}

export default helper(getFilename);
