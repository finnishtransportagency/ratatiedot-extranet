import axios from 'axios';

export interface FileData {
  name: string;
  description: string;
  parentNode: string;
}

export const uploadFile = async (file: File, fileData: FileData) => {
  const { name, parentNode, description } = fileData;
  if (file) {
    const form = new FormData();
    form.append('name', name);
    form.append('filedata', file);
    form.append('nodeType', 'cm:content');
    const options = {
      method: 'POST',
      body: form,
    };
    await axios(`/api/alfresco/file/${parentNode}`, options)
      .then((response) => response)
      .catch((error) => {
        console.error('Error:', error);
      });
  }
};
