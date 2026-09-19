import { expect, it } from 'vitest';
import { SaxesParser } from 'saxes';
import { portableSvg } from '../../../src/world/map/portable.js';

it('bakes nested transparency into portable paint alpha without intermediate opacity layers', () => {
  const source =
    '<svg xmlns="http://www.w3.org/2000/svg"><g opacity="0.4" fill-opacity="0.5"><path d="M0,0h20v20Z" opacity="0.5"/><circle r="4" opacity="0.5" fill-opacity="0.2" stroke-opacity="0.6"/></g></svg>';
  const tags: Record<string, string>[] = [];
  const parser = new SaxesParser();
  parser.on('opentag', (tag) => tags.push({ name: tag.name, ...tag.attributes }));
  parser.write(portableSvg(source)).close();
  expect(tags.find((tag) => tag.name === 'g')?.opacity).toBeUndefined();
  expect(tags.find((tag) => tag.name === 'path')).toMatchObject({
    'fill-opacity': '0.1',
    'stroke-opacity': '0.2',
  });
  expect(tags.find((tag) => tag.name === 'circle')).toMatchObject({
    'fill-opacity': '0.04',
    'stroke-opacity': '0.12',
  });
  expect(tags.find((tag) => tag.name === 'circle')?.opacity).toBeUndefined();
});
