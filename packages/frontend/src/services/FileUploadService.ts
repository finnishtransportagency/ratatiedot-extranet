import axios from 'axios';

const upload = async (node: string, file: File): Promise<any> => {
  let formData = new FormData();

  formData.append('file', file);

  return await axios.post(`/api/alfresco/file/${node}`, formData);
};

const FileUploadService = {
  upload,
};

export default FileUploadService;
