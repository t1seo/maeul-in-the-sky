import type { PixelSprite } from '../types.js';
import { sprites as blacksmith } from './blacksmith.js';
import { sprites as bridge } from './bridge.js';
import { sprites as castle } from './castle.js';
import { sprites as cathedral } from './cathedral.js';
import { sprites as clocktower } from './clocktower.js';
import { sprites as fountain } from './fountain.js';
import { sprites as frozenFountain } from './frozenFountain.js';
import { sprites as gatehouse } from './gatehouse.js';
import { sprites as hanokEstate } from './hanokEstate.js';
import { sprites as inn } from './inn.js';
import { sprites as library } from './library.js';
import { sprites as manor } from './manor.js';
import { sprites as market } from './market.js';
import { sprites as park } from './park.js';
import { sprites as statue } from './statue.js';
import { sprites as stoneBridge } from './stoneBridge.js';
import { sprites as swimmingPool } from './swimmingPool.js';
import { sprites as tower } from './tower.js';
import { sprites as warehouse } from './warehouse.js';
export const sprites: Readonly<Record<string, readonly PixelSprite[]>> = {
  blacksmith,
  bridge,
  castle,
  cathedral,
  clocktower,
  fountain,
  frozenFountain,
  gatehouse,
  hanokEstate,
  inn,
  library,
  manor,
  market,
  park,
  statue,
  stoneBridge,
  swimmingPool,
  tower,
  warehouse,
};
