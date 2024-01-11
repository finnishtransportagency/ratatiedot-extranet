import axios from 'axios';

interface NodeProperties {
  name: string;
  properties: {
    'cm:description'?: string;
    'cm:title'?: string;
  };
}

export const updateNode = async (
  nodeId: string,
  categoryName: string,
  name: string,
  description: string,
  title: string,
) => {
  let response = null;
  const payload: NodeProperties = {
    name,
    properties: {},
  };

  if (description) payload.properties['cm:description'] = description;
  if (title) payload.properties['cm:title'] = title;

  response = await axios(`/api/alfresco/file/${categoryName}/${nodeId}`, {
    method: 'PUT',
    data: payload,
  });
  return response as any;
};
