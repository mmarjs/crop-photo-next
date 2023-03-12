import {describe, expect, test} from '@jest/globals';
import {StringUtil} from './StringUtil';

describe('sanitime-for-s3', () => {
  test('remove all  special chars', () => {
    expect(StringUtil.sanitizeForS3("Greay Plating Image.jpg", "-")).toBe("Greay-Plating-Image.jpg");
  });

  test('replace special chars with -', () => {
    expect(StringUtil.sanitizeForS3("Greay$Plating&Image/+.jpg", "-")).toBe("Greay-Plating-Image-.jpg");
  });


  test('replace special chars with -', () => {
    expect(StringUtil.sanitizeForS3("^Greay$Plating&Image/+.jpg [{^}%`\]>[~<#|&$@=;:+ ,?", "-")).toBe("-Greay-Plating-Image-.jpg-");
  });
});