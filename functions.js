// barebone helper functions

import crypto from 'crypto';

export function unique(array) {
  return array.filter((value, index) => array.indexOf(value) === index);
}

export function checksum(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}
