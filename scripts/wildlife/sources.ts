const ULTIMATE = 'https://quaternius.com/packs/ultimateanimatedanimals.html';
const CC0 = {
  creator: 'Quaternius',
  license: 'CC0-1.0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  licenseFile: 'licenses/CC0-1.0.txt',
} as const;

export const WILDLIFE_SOURCES = [
  {
    id: 'squirrel',
    raw: 'squirrel-fQ5KzXoR2uA.glb',
    creator: 'Poly by Google',
    modelUrl: 'https://poly.pizza/m/fQ5KzXoR2uA',
    downloadUrl: 'https://static.poly.pizza/a5701682-cb65-493a-8d52-4817b76107ac.glb',
    license: 'CC-BY-3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    licenseFile: 'licenses/CC-BY-3.0.txt',
    sha256: '963821ab643595967e73ce1c24056d293159ed2ccdded1efda5ab69ba14b8ddc',
  },
  {
    ...CC0,
    id: 'cow',
    raw: 'cow-quaternius.gltf',
    modelUrl: ULTIMATE,
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1lS3t1Sof0FVne1C1WXfdX48qaHES_pDG',
    sha256: 'b04af067688d9fadf1395b4456dbf3117c2f760fb49e704ee5c8b6391fc8adb5',
  },
  {
    ...CC0,
    id: 'deer',
    raw: 'deer-quaternius.gltf',
    modelUrl: ULTIMATE,
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1iGpXKrqYGyZCPGHPPSuDAoKnOXLhXJ0q',
    sha256: 'b8afd0647e7a74332ce802c8326dfefe1a2b76da67ab925a631aaddb5ae9bdd4',
  },
  {
    ...CC0,
    id: 'fox',
    raw: 'fox-quaternius.gltf',
    modelUrl: ULTIMATE,
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1z-CWoUC2vJxrqgGFTYlMaywpE1ooV-bA',
    sha256: '2f36e3c9c75ecddda85c5f9944e98ee1e88e7c679a546534aff1cea8ecde64c7',
  },
  {
    ...CC0,
    id: 'horse',
    raw: 'horse-quaternius.gltf',
    modelUrl: ULTIMATE,
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1hbtY8kxnXiPdwYGVY7rWRgU0jl_-Q-LG',
    sha256: '3deb61550dff1d2786d04b6e8559d63ad3907d6ab606ba28ce0af074ed96341b',
  },
  {
    ...CC0,
    id: 'donkey',
    raw: 'donkey-quaternius.gltf',
    modelUrl: ULTIMATE,
    downloadUrl: 'https://drive.google.com/uc?export=download&id=1Buic-_4vNtmwN0rtMHcdWw3TEaSPz4iW',
    sha256: '4cbb2eb7d057789c945b6445d99d0c73b76c0caf7ac9b37ce88a04ca718be2ff',
  },
  {
    ...CC0,
    id: 'sheep',
    raw: 'C39AUXUUes.glb',
    modelUrl: 'https://poly.pizza/m/C39AUXUUes',
    downloadUrl: 'https://static.poly.pizza/a4bd2c4e-fe71-4dbd-9881-cf3ac8a00bbf.glb',
    sha256: '91aedec323b54d42b802b065b2f5005daea527b0a379a9f3fe90f3258f3c2382',
  },
  {
    ...CC0,
    id: 'pig',
    raw: 'TNvG3QUFlp.glb',
    modelUrl: 'https://poly.pizza/m/TNvG3QUFlp',
    downloadUrl: 'https://static.poly.pizza/665ee586-6494-4fbd-be46-fcbe600f653e.glb',
    sha256: '4bb5fc230a35db446fa2ea043f77dfc077f0b21d6e59d0235b15f01d01b05525',
  },
] as const;

export class WildlifeAssetError extends Error {
  constructor(
    readonly asset: string,
    readonly reason: string,
  ) {
    super(`${asset}: ${reason}`);
    this.name = 'WildlifeAssetError';
  }
}
