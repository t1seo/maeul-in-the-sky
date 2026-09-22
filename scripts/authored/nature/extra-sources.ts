const CC0 = {
  license: 'CC0-1.0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  licenseFile: 'licenses/CC0-1.0.txt',
} as const;
const KENNEY = {
  ...CC0,
  creator: 'Kenney',
  modelUrl: 'https://kenney.nl/assets/nature-kit',
  downloadUrl:
    'https://kenney.nl/media/pages/assets/nature-kit/37ac38a37b-1677698939/kenney_nature-kit.zip',
  licenseFile: 'licenses/Kenney-nature.txt',
  archiveSha256: 'fa7974a0d342bfe63c38664ba9f8ec1a4aab8ea25f099bdc56870e33588c4d9d',
} as const;

export const EXTRA_NATURE_SOURCES = [
  {
    id: 'willow',
    raw: 'extra/mBrUbIp9Zd.glb',
    bytes: 151272,
    sha256: 'bd640b0e9b7a291b7a393abdea78b1f50eccfa32306839195cef36c4f3816285',
    source: {
      ...CC0,
      creator: 'Quaternius',
      originalTitle: 'Willow',
      modelUrl: 'https://poly.pizza/m/mBrUbIp9Zd',
      downloadUrl: 'https://static.poly.pizza/fb9965b3-0b81-4bec-9798-9a55d57e6daa.glb',
    },
  },
  {
    id: 'cattail',
    raw: 'extra/9uT74BMpRrl.glb',
    bytes: 29320,
    sha256: '3ec5aa72ea7fef986e70bbfbb3fbb776d5bf51ebc0b2d7eb0951c2db22fad861',
    source: {
      creator: 'Poly by Google',
      originalTitle: 'Cattail',
      modelUrl: 'https://poly.pizza/m/9uT74BMpRrl',
      downloadUrl: 'https://static.poly.pizza/d3a27812-c2ff-4d69-922e-7f2fde8cd236.glb',
      license: 'CC-BY-3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
      licenseFile: 'licenses/CC-BY-3.0.txt',
      attribution:
        'Cattail by Poly by Google, via Poly Pizza, licensed CC BY 3.0. Repacked and relit for Maeul in the Sky.',
    },
  },
  {
    id: 'lilypad',
    raw: 'extra/TI6ukUlsLh.glb',
    bytes: 23784,
    sha256: '6982fa8504bb22b62cfafe8e03d749ffb79b5e905620844665cc37946c1bd62e',
    source: {
      ...CC0,
      creator: 'Quaternius',
      originalTitle: 'Lilypad',
      modelUrl: 'https://poly.pizza/m/TI6ukUlsLh',
      downloadUrl: 'https://static.poly.pizza/ae432cca-6422-42ef-a982-b74bd0fc99b2.glb',
    },
  },
  {
    id: 'palm',
    raw: 'kenney/Models/GLTF format/tree_palmDetailedTall.glb',
    bytes: 28204,
    sha256: '2cbea0f9621cde884c63a7b4ad787bda1d051fa27ef3c66b9f2b65328dc53683',
    source: { ...KENNEY, originalTitle: 'Nature Kit — tree_palmDetailedTall' },
  },
] as const;
