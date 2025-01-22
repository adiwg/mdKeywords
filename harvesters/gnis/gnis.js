import { harvestAntarctica } from './antarctica';
import { harvestDomesticNames } from './domesticNames';

export default async function main() {
  console.log('Starting GNIS Harvester...');
  await harvestAntarctica();
  await harvestDomesticNames();
  console.log('Harvesting Complete');
}
