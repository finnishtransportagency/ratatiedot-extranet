// build localStorage database that stores objects of type Area
// Area has id, alfrescoId, name, description, parent

interface Area {
  alfrescoId: string;
  name: string;
  parentId: string;
}

const areaItems: Area[] = [
  {
    alfrescoId: '70bd7ac9-4069-48b3-a205-c08569778b87',
    name: 'Alue 1 Uusimaa',
    parentId: '71d157b0-6c81-4b55-ad99-d7bfbfd2d960',
  },
];

// set areaStore in localStorage
localStorage.setItem('areaStore', JSON.stringify(areaItems));

// get areaStore from localStorage
const areaStore = localStorage.getItem('areaStore');

export default areaStore;
